import type { Personen, Veranstaltungen, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface PersonenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Personen;
  /** 1:N „Veranstaltungen" (ansprechperson): VOLLE Liste — der Block filtert auf diesen Record. */
  veranstaltungenList: Veranstaltungen[];
  /** Zeilen-Klick → overlay.push auf das Veranstaltungen-Detail (nie der Edit-Dialog). */
  onOpenVeranstaltungen: (record: Veranstaltungen) => void;
  /** Kontextuelles „+": öffnet den Veranstaltungen-Dialog mit diesem Record vorgesetzt. */
  onAddVeranstaltungen?: () => void;
  /** 1:N „Anmeldungen" (person): VOLLE Liste — der Block filtert auf diesen Record. */
  anmeldungenList: Anmeldungen[];
  /** Zeilen-Klick → overlay.push auf das Anmeldungen-Detail (nie der Edit-Dialog). */
  onOpenAnmeldungen: (record: Anmeldungen) => void;
  /** Kontextuelles „+": öffnet den Anmeldungen-Dialog mit diesem Record vorgesetzt. */
  onAddAnmeldungen?: () => void;
}

export function PersonenDetails({
  record,
  veranstaltungenList,
  onOpenVeranstaltungen,
  onAddVeranstaltungen,
  anmeldungenList,
  onOpenAnmeldungen,
  onAddAnmeldungen,
}: PersonenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('personen', 'vorname')} value={record.fields.vorname} format="text" />
        <RecordField label={fieldLabel('personen', 'nachname')} value={record.fields.nachname} format="text" />
        <RecordField label={fieldLabel('personen', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('personen', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('personen', 'unternehmen')} value={record.fields.unternehmen} format="text" />
        <RecordField label={fieldLabel('personen', 'funktion')} value={record.fields.funktion} format="text" />
        <RecordField label={fieldLabel('personen', 'personenart')} value={Array.isArray(record.fields.personenart) ? record.fields.personenart.map((v: unknown) => (v && typeof v === 'object' && 'label' in v) ? (v as {label: unknown}).label : v).join(', ') : null} format="text" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('veranstaltungen')}
        items={veranstaltungenList.filter(r => extractRecordId(r.fields.ansprechperson) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('veranstaltungen'), meta: r.fields.beginn })}
        onOpen={onOpenVeranstaltungen}
        onAdd={onAddVeranstaltungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('anmeldungen')}
        items={anmeldungenList.filter(r => extractRecordId(r.fields.person) === record.record_id)}
        map={r => ({ name: r.fields.vorname ?? appLabel('anmeldungen'), meta: undefined })}
        onOpen={onOpenAnmeldungen}
        onAdd={onAddAnmeldungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.PERSONEN} recordId={record.record_id} readOnly={!perms.canWrite('personen')} />
    </>
  );
}
