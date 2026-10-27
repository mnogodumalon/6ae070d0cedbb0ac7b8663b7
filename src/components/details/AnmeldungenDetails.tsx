import type { Anmeldungen, Veranstaltungen, Personen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface AnmeldungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Anmeldungen;
  /** N:1-Ziel „Veranstaltungen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  veranstaltungenList: Veranstaltungen[];
  /** Klick auf die Veranstaltungen-Relation → overlay.push auf dessen Detail. */
  onOpenVeranstaltungen?: (record: Veranstaltungen) => void;
  /** N:1-Ziel „Personen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  personenList: Personen[];
  /** Klick auf die Personen-Relation → overlay.push auf dessen Detail. */
  onOpenPersonen?: (record: Personen) => void;
}

export function AnmeldungenDetails({
  record,
  veranstaltungenList,
  onOpenVeranstaltungen,
  personenList,
  onOpenPersonen,
}: AnmeldungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const veranstaltungTarget = veranstaltungenList.find(r => r.record_id === extractRecordId(record.fields.veranstaltung));
  const personTarget = personenList.find(r => r.record_id === extractRecordId(record.fields.person));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('anmeldungen', 'vorname')} value={record.fields.vorname} format="text" />
        <RecordField label={fieldLabel('anmeldungen', 'nachname')} value={record.fields.nachname} format="text" />
        <RecordField label={fieldLabel('anmeldungen', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('anmeldungen', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('anmeldungen', 'unternehmen')} value={record.fields.unternehmen} format="text" />
        <RecordField label={fieldLabel('anmeldungen', 'position')} value={record.fields.position} format="text" />
        <RecordField label={fieldLabel('anmeldungen', 'anzahl_personen')} value={record.fields.anzahl_personen} format="text" />
        <RecordField label={fieldLabel('anmeldungen', 'bemerkungen')} value={record.fields.bemerkungen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('anmeldungen', 'datenschutz_einwilligung')} value={record.fields.datenschutz_einwilligung} format="bool" />
        <RecordField label={fieldLabel('anmeldungen', 'newsletter_einwilligung')} value={record.fields.newsletter_einwilligung} format="bool" />
        <RecordField label={fieldLabel('anmeldungen', 'anmeldestatus')} value={record.fields.anmeldestatus} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('anmeldungen', 'veranstaltung')}
          name={veranstaltungTarget?.fields.titel ?? '—'}
          meta={[veranstaltungTarget?.fields.ort_name, veranstaltungTarget?.fields.strasse].filter(Boolean).join(' · ') || undefined}
          onClick={veranstaltungTarget && onOpenVeranstaltungen ? () => onOpenVeranstaltungen!(veranstaltungTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('anmeldungen', 'person')}
          name={personTarget?.fields.vorname ?? '—'}
          meta={[personTarget?.fields.email, personTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={personTarget && onOpenPersonen ? () => onOpenPersonen!(personTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.ANMELDUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('anmeldungen')} />
    </>
  );
}
