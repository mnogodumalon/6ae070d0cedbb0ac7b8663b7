import type { Veranstaltungen, Personen, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface VeranstaltungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Veranstaltungen;
  /** N:1-Ziel „Personen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  personenList: Personen[];
  /** Klick auf die Personen-Relation → overlay.push auf dessen Detail. */
  onOpenPersonen?: (record: Personen) => void;
  /** 1:N „Anmeldungen" (veranstaltung): VOLLE Liste — der Block filtert auf diesen Record. */
  anmeldungenList: Anmeldungen[];
  /** Zeilen-Klick → overlay.push auf das Anmeldungen-Detail (nie der Edit-Dialog). */
  onOpenAnmeldungen: (record: Anmeldungen) => void;
  /** Kontextuelles „+": öffnet den Anmeldungen-Dialog mit diesem Record vorgesetzt. */
  onAddAnmeldungen?: () => void;
}

export function VeranstaltungenDetails({
  record,
  personenList,
  onOpenPersonen,
  anmeldungenList,
  onOpenAnmeldungen,
  onAddAnmeldungen,
}: VeranstaltungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const ansprechpersonTarget = personenList.find(r => r.record_id === extractRecordId(record.fields.ansprechperson));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('veranstaltungen', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('veranstaltungen', 'veranstaltungsart')} value={record.fields.veranstaltungsart} format="pill" />
        <RecordField label={fieldLabel('veranstaltungen', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('veranstaltungen', 'beginn')} value={record.fields.beginn} format="datetime" />
        <RecordField label={fieldLabel('veranstaltungen', 'ende')} value={record.fields.ende} format="datetime" />
        <RecordField label={fieldLabel('veranstaltungen', 'anmeldefrist')} value={record.fields.anmeldefrist} format="date" />
        <RecordField label={fieldLabel('veranstaltungen', 'max_teilnehmer')} value={record.fields.max_teilnehmer} format="text" />
        <RecordField label={fieldLabel('veranstaltungen', 'ort_name')} value={record.fields.ort_name} format="text" />
        <RecordField label={fieldLabel('veranstaltungen', 'strasse')} value={record.fields.strasse} format="text" />
        <RecordField label={fieldLabel('veranstaltungen', 'hausnummer')} value={record.fields.hausnummer} format="text" />
        <RecordField label={fieldLabel('veranstaltungen', 'plz')} value={record.fields.plz} format="text" />
        <RecordField label={fieldLabel('veranstaltungen', 'ort')} value={record.fields.ort} format="text" />
        <RecordField label={fieldLabel('veranstaltungen', 'headerbild')} className="md:col-span-2">
          {record.fields.headerbild ? (
            <MediaThumbnail src={record.fields.headerbild as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('veranstaltungen', 'kurzbeschreibung')} value={record.fields.kurzbeschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('veranstaltungen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('veranstaltungen', 'begruessungstext')} value={record.fields.begruessungstext} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('veranstaltungen', 'datenschutzhinweis')} value={record.fields.datenschutzhinweis} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('veranstaltungen', 'bestaetigungstext')} value={record.fields.bestaetigungstext} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('veranstaltungen', 'ansprechperson')}
          name={ansprechpersonTarget?.fields.vorname ?? '—'}
          meta={[ansprechpersonTarget?.fields.email, ansprechpersonTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={ansprechpersonTarget && onOpenPersonen ? () => onOpenPersonen!(ansprechpersonTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('anmeldungen')}
        items={anmeldungenList.filter(r => extractRecordId(r.fields.veranstaltung) === record.record_id)}
        map={r => ({ name: r.fields.vorname ?? appLabel('anmeldungen'), meta: undefined })}
        onOpen={onOpenAnmeldungen}
        onAdd={onAddAnmeldungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.VERANSTALTUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('veranstaltungen')} />
    </>
  );
}
