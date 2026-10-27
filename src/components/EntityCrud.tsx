/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'personen'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.personen.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.personen.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.personen.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.personen              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   personen: vorname, nachname, email, telefon, unternehmen, funktion, personenart  ·  ← veranstaltungen (list + contextual +) · ← anmeldungen (list + contextual +)
 *   veranstaltungen: titel, veranstaltungsart, status, beginn, ende, anmeldefrist, max_teilnehmer, ort_name, …  ·  → personen · ← anmeldungen (list + contextual +)
 *   anmeldungen: veranstaltung, vorname, nachname, email, telefon, unternehmen, position, anzahl_personen, …  ·  → veranstaltungen · → personen
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Personen, Veranstaltungen, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichVeranstaltungen, enrichAnmeldungen } from '@/lib/enrich';
import type { EnrichedVeranstaltungen, EnrichedAnmeldungen } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { PersonenDialog, type PersonenDialogDefaults } from '@/components/dialogs/PersonenDialog';
import { PersonenDetails } from '@/components/details/PersonenDetails';
import { VeranstaltungenDialog, type VeranstaltungenDialogDefaults } from '@/components/dialogs/VeranstaltungenDialog';
import { VeranstaltungenDetails } from '@/components/details/VeranstaltungenDetails';
import { AnmeldungenDialog, type AnmeldungenDialogDefaults } from '@/components/dialogs/AnmeldungenDialog';
import { AnmeldungenDetails } from '@/components/details/AnmeldungenDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'personen'; record: Personen }
  | { type: 'veranstaltungen'; record: EnrichedVeranstaltungen }
  | { type: 'anmeldungen'; record: EnrichedAnmeldungen };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  personen: EntityCrudApi<Personen, PersonenDialogDefaults>;
  veranstaltungen: EntityCrudApi<Veranstaltungen, VeranstaltungenDialogDefaults>;
  anmeldungen: EntityCrudApi<Anmeldungen, AnmeldungenDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { personen: Personen[]; veranstaltungen: EnrichedVeranstaltungen[]; anmeldungen: EnrichedAnmeldungen[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [personenDialog, setPersonenDialog] = useState<{ defaults?: PersonenDialogDefaults; editing?: Personen } | null>(null);
  const [veranstaltungenDialog, setVeranstaltungenDialog] = useState<{ defaults?: VeranstaltungenDialogDefaults; editing?: Veranstaltungen } | null>(null);
  const [anmeldungenDialog, setAnmeldungenDialog] = useState<{ defaults?: AnmeldungenDialogDefaults; editing?: Anmeldungen } | null>(null);
  const enrichedVeranstaltungen = useMemo(() => enrichVeranstaltungen(data.veranstaltungen, { personenMap: data.personenMap }), [data.veranstaltungen, data.personenMap]);
  const enrichedAnmeldungen = useMemo(() => enrichAnmeldungen(data.anmeldungen, { veranstaltungenMap: data.veranstaltungenMap, personenMap: data.personenMap }), [data.anmeldungen, data.veranstaltungenMap, data.personenMap]);

  function detailPersonen(record: Personen, push = false) {
    const item: OverlayItem = { type: 'personen', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitPersonen(fields: Personen['fields']) {
    const editing = personenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setPersonen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updatePersonenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('personen')} — ${t('crud_updated')}`, async () => {
        data.setPersonen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updatePersonenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createPersonenEntry(fields);
      undoToast(`${appLabel('personen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailVeranstaltungen(record: Veranstaltungen, push = false) {
    const rec = enrichedVeranstaltungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'veranstaltungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitVeranstaltungen(fields: Veranstaltungen['fields']) {
    const editing = veranstaltungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setVeranstaltungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateVeranstaltungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('veranstaltungen')} — ${t('crud_updated')}`, async () => {
        data.setVeranstaltungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateVeranstaltungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createVeranstaltungenEntry(fields);
      undoToast(`${appLabel('veranstaltungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailAnmeldungen(record: Anmeldungen, push = false) {
    const rec = enrichedAnmeldungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'anmeldungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitAnmeldungen(fields: Anmeldungen['fields']) {
    const editing = anmeldungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setAnmeldungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateAnmeldungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('anmeldungen')} — ${t('crud_updated')}`, async () => {
        data.setAnmeldungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateAnmeldungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createAnmeldungenEntry(fields);
      undoToast(`${appLabel('anmeldungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <PersonenDialog
        open={personenDialog !== null}
        onClose={() => setPersonenDialog(null)}
        onSubmit={submitPersonen}
        defaultValues={personenDialog?.defaults}
        recordId={personenDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Personen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Personen']}
      />
      <VeranstaltungenDialog
        open={veranstaltungenDialog !== null}
        onClose={() => setVeranstaltungenDialog(null)}
        onSubmit={submitVeranstaltungen}
        defaultValues={veranstaltungenDialog?.defaults}
        recordId={veranstaltungenDialog?.editing?.record_id}
        personenList={data.personen}
        enablePhotoScan={AI_PHOTO_SCAN['Veranstaltungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Veranstaltungen']}
      />
      <AnmeldungenDialog
        open={anmeldungenDialog !== null}
        onClose={() => setAnmeldungenDialog(null)}
        onSubmit={submitAnmeldungen}
        defaultValues={anmeldungenDialog?.defaults}
        recordId={anmeldungenDialog?.editing?.record_id}
        veranstaltungenList={data.veranstaltungen}
        personenList={data.personen}
        enablePhotoScan={AI_PHOTO_SCAN['Anmeldungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Anmeldungen']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'personen') {
            return (
              <>
                <RecordHeader title={top.record.fields.vorname ?? appLabel('personen')} subtitle={undefined} />
                <PersonenDetails
                  record={top.record}
                  veranstaltungenList={data.veranstaltungen}
                  onOpenVeranstaltungen={(r) => detailVeranstaltungen(r, true)}
                  onAddVeranstaltungen={perms.canWrite('veranstaltungen') ? () => setVeranstaltungenDialog({ defaults: { ansprechperson: createRecordUrl(APP_IDS.PERSONEN, top.record.record_id) } }) : undefined}
                  anmeldungenList={data.anmeldungen}
                  onOpenAnmeldungen={(r) => detailAnmeldungen(r, true)}
                  onAddAnmeldungen={perms.canWrite('anmeldungen') ? () => setAnmeldungenDialog({ defaults: { person: createRecordUrl(APP_IDS.PERSONEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'veranstaltungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('veranstaltungen')} subtitle={top.record.fields.beginn ? formatDate(top.record.fields.beginn) : undefined} />
                <VeranstaltungenDetails
                  record={top.record}
                  personenList={data.personen}
                  onOpenPersonen={(r) => detailPersonen(r, true)}
                  anmeldungenList={data.anmeldungen}
                  onOpenAnmeldungen={(r) => detailAnmeldungen(r, true)}
                  onAddAnmeldungen={perms.canWrite('anmeldungen') ? () => setAnmeldungenDialog({ defaults: { veranstaltung: createRecordUrl(APP_IDS.VERANSTALTUNGEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'anmeldungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.vorname ?? appLabel('anmeldungen')} subtitle={undefined} />
                <AnmeldungenDetails
                  record={top.record}
                  veranstaltungenList={data.veranstaltungen}
                  onOpenVeranstaltungen={(r) => detailVeranstaltungen(r, true)}
                  personenList={data.personen}
                  onOpenPersonen={(r) => detailPersonen(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'personen') return perms.canWrite('personen');
          if (top.type === 'veranstaltungen') return perms.canWrite('veranstaltungen');
          if (top.type === 'anmeldungen') return perms.canWrite('anmeldungen');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'personen') setPersonenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'veranstaltungen') setVeranstaltungenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'anmeldungen') setAnmeldungenDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    personen: {
      openCreate: (defaults?: PersonenDialogDefaults) => (perms.canWrite('personen') ? setPersonenDialog({ defaults }) : refuse()),
      openEdit: (record: Personen) => (perms.canWrite('personen') ? setPersonenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Personen) => detailPersonen(record, false),
      canWrite: perms.canWrite('personen'),
    },
    veranstaltungen: {
      openCreate: (defaults?: VeranstaltungenDialogDefaults) => (perms.canWrite('veranstaltungen') ? setVeranstaltungenDialog({ defaults }) : refuse()),
      openEdit: (record: Veranstaltungen) => (perms.canWrite('veranstaltungen') ? setVeranstaltungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Veranstaltungen) => detailVeranstaltungen(record, false),
      canWrite: perms.canWrite('veranstaltungen'),
    },
    anmeldungen: {
      openCreate: (defaults?: AnmeldungenDialogDefaults) => (perms.canWrite('anmeldungen') ? setAnmeldungenDialog({ defaults }) : refuse()),
      openEdit: (record: Anmeldungen) => (perms.canWrite('anmeldungen') ? setAnmeldungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Anmeldungen) => detailAnmeldungen(record, false),
      canWrite: perms.canWrite('anmeldungen'),
    },
    enriched: { personen: data.personen, veranstaltungen: enrichedVeranstaltungen, anmeldungen: enrichedAnmeldungen },
  };
}
