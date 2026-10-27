import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Personen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    unternehmen?: string;
    funktion?: string;
    personenart?: LookupValue[];
  };
}

export interface Veranstaltungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    veranstaltungsart?: LookupValue;
    status?: LookupValue;
    beginn?: string; // Format: YYYY-MM-DD oder ISO String
    ende?: string; // Format: YYYY-MM-DD oder ISO String
    anmeldefrist?: string; // Format: YYYY-MM-DD oder ISO String
    max_teilnehmer?: number;
    ort_name?: string;
    strasse?: string;
    hausnummer?: string;
    plz?: string;
    ort?: string;
    headerbild?: string;
    kurzbeschreibung?: string;
    beschreibung?: string;
    begruessungstext?: string;
    datenschutzhinweis?: string;
    bestaetigungstext?: string;
    ansprechperson?: RecordUrl; // applookup -> URL zu 'Personen' Record
  };
}

export interface Anmeldungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    veranstaltung?: RecordUrl; // applookup -> URL zu 'Veranstaltungen' Record
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    unternehmen?: string;
    position?: string;
    anzahl_personen?: number;
    bemerkungen?: string;
    datenschutz_einwilligung?: boolean;
    newsletter_einwilligung?: boolean;
    anmeldestatus?: LookupValue;
    person?: RecordUrl; // applookup -> URL zu 'Personen' Record
  };
}

export const APP_IDS = {
  PERSONEN: '6ae070b2291a6bffcf3311bb',
  VERANSTALTUNGEN: '6ae070b67aff79540e937a15',
  ANMELDUNGEN: '6ae070b71ca3553441f2b8c2',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'personen': {
    personenart: [{ key: "ansprechperson", get label() { return lookupLabel('personen', 'personenart', "ansprechperson") ?? "Ansprechperson"; } }, { key: "mitglied", get label() { return lookupLabel('personen', 'personenart', "mitglied") ?? "Mitglied"; } }, { key: "mitarbeitende", get label() { return lookupLabel('personen', 'personenart', "mitarbeitende") ?? "Mitarbeitende"; } }, { key: "teilnehmende", get label() { return lookupLabel('personen', 'personenart', "teilnehmende") ?? "Teilnehmende"; } }, { key: "sonstige", get label() { return lookupLabel('personen', 'personenart', "sonstige") ?? "Sonstige"; } }],
  },
  'veranstaltungen': {
    veranstaltungsart: [{ key: "netzwerktreffen", get label() { return lookupLabel('veranstaltungen', 'veranstaltungsart', "netzwerktreffen") ?? "Netzwerktreffen"; } }, { key: "workshop", get label() { return lookupLabel('veranstaltungen', 'veranstaltungsart', "workshop") ?? "Workshop"; } }, { key: "konferenz", get label() { return lookupLabel('veranstaltungen', 'veranstaltungsart', "konferenz") ?? "Konferenz"; } }, { key: "webinar", get label() { return lookupLabel('veranstaltungen', 'veranstaltungsart', "webinar") ?? "Webinar"; } }, { key: "fremde_veranstaltung", get label() { return lookupLabel('veranstaltungen', 'veranstaltungsart', "fremde_veranstaltung") ?? "Besuch einer fremden Veranstaltung"; } }, { key: "interne_aktivitaet", get label() { return lookupLabel('veranstaltungen', 'veranstaltungsart', "interne_aktivitaet") ?? "Interne Aktivität"; } }, { key: "sonstiges", get label() { return lookupLabel('veranstaltungen', 'veranstaltungsart', "sonstiges") ?? "Sonstiges"; } }],
    status: [{ key: "entwurf", get label() { return lookupLabel('veranstaltungen', 'status', "entwurf") ?? "Entwurf"; } }, { key: "anmeldung_offen", get label() { return lookupLabel('veranstaltungen', 'status', "anmeldung_offen") ?? "Anmeldung offen"; } }, { key: "ausgebucht", get label() { return lookupLabel('veranstaltungen', 'status', "ausgebucht") ?? "Ausgebucht"; } }, { key: "abgeschlossen", get label() { return lookupLabel('veranstaltungen', 'status', "abgeschlossen") ?? "Abgeschlossen"; } }, { key: "abgesagt", get label() { return lookupLabel('veranstaltungen', 'status', "abgesagt") ?? "Abgesagt"; } }],
  },
  'anmeldungen': {
    anmeldestatus: [{ key: "eingegangen", get label() { return lookupLabel('anmeldungen', 'anmeldestatus', "eingegangen") ?? "Eingegangen"; } }, { key: "bestaetigt", get label() { return lookupLabel('anmeldungen', 'anmeldestatus', "bestaetigt") ?? "Bestätigt"; } }, { key: "warteliste", get label() { return lookupLabel('anmeldungen', 'anmeldestatus', "warteliste") ?? "Warteliste"; } }, { key: "storniert", get label() { return lookupLabel('anmeldungen', 'anmeldestatus', "storniert") ?? "Storniert"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'personen': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'unternehmen': 'string/text',
    'funktion': 'string/text',
    'personenart': 'multiplelookup/checkbox',
  },
  'veranstaltungen': {
    'titel': 'string/text',
    'veranstaltungsart': 'lookup/select',
    'status': 'lookup/select',
    'beginn': 'date/datetimeminute',
    'ende': 'date/datetimeminute',
    'anmeldefrist': 'date/date',
    'max_teilnehmer': 'number',
    'ort_name': 'string/text',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'plz': 'string/text',
    'ort': 'string/text',
    'headerbild': 'file',
    'kurzbeschreibung': 'string/textarea',
    'beschreibung': 'string/textarea',
    'begruessungstext': 'string/textarea',
    'datenschutzhinweis': 'string/textarea',
    'bestaetigungstext': 'string/textarea',
    'ansprechperson': 'applookup/select',
  },
  'anmeldungen': {
    'veranstaltung': 'applookup/select',
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'unternehmen': 'string/text',
    'position': 'string/text',
    'anzahl_personen': 'number',
    'bemerkungen': 'string/textarea',
    'datenschutz_einwilligung': 'bool',
    'newsletter_einwilligung': 'bool',
    'anmeldestatus': 'lookup/select',
    'person': 'applookup/select',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreatePersonen = StripLookup<Personen['fields']>;
export type CreateVeranstaltungen = StripLookup<Veranstaltungen['fields']>;
export type CreateAnmeldungen = StripLookup<Anmeldungen['fields']>;