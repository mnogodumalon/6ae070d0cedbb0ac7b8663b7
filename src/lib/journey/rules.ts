/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'personen' | 'veranstaltungen' | 'anmeldungen';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "personen": "vorname" | "nachname" | "email" | "telefon" | "unternehmen" | "funktion";
  "veranstaltungen": "titel" | "ort_name" | "strasse" | "hausnummer" | "plz" | "ort" | "kurzbeschreibung" | "beschreibung" | "begruessungstext" | "datenschutzhinweis" | "bestaetigungstext";
  "anmeldungen": "vorname" | "nachname" | "email" | "telefon" | "unternehmen" | "position" | "bemerkungen";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "personen": never;
  "veranstaltungen": "ansprechperson";
  "anmeldungen": "veranstaltung" | "person";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it as a value. `file` is false: a file is UPLOADED
   *  (`form.file(key)` → FileField; the chosen file travels in the create as a data URL). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "personen": {
    "key": "personen",
    "appId": "6ae070b2291a6bffcf3311bb",
    "label": "Personen",
    "pascal": "Personen",
    "single": "PersonenEntry"
  },
  "veranstaltungen": {
    "key": "veranstaltungen",
    "appId": "6ae070b67aff79540e937a15",
    "label": "Veranstaltungen",
    "pascal": "Veranstaltungen",
    "single": "VeranstaltungenEntry"
  },
  "anmeldungen": {
    "key": "anmeldungen",
    "appId": "6ae070b71ca3553441f2b8c2",
    "label": "Anmeldungen",
    "pascal": "Anmeldungen",
    "single": "AnmeldungenEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "personen": {
    "vorname": {
      "key": "vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "nachname": {
      "key": "nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": true,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "unternehmen": {
      "key": "unternehmen",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Unternehmen",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "organization"
    },
    "funktion": {
      "key": "funktion",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Funktion",
      "writable": true,
      "maxLength": 4000
    },
    "personenart": {
      "key": "personenart",
      "fulltype": "multiplelookup/checkbox",
      "kind": "multilookup",
      "required": false,
      "label": "Art der Person",
      "writable": true,
      "options": [
        "ansprechperson",
        "mitglied",
        "mitarbeitende",
        "teilnehmende",
        "sonstige"
      ]
    }
  },
  "veranstaltungen": {
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "veranstaltungsart": {
      "key": "veranstaltungsart",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Veranstaltungsart",
      "writable": true,
      "options": [
        "netzwerktreffen",
        "workshop",
        "konferenz",
        "webinar",
        "fremde_veranstaltung",
        "interne_aktivitaet",
        "sonstiges"
      ]
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "entwurf",
        "anmeldung_offen",
        "ausgebucht",
        "abgeschlossen",
        "abgesagt"
      ]
    },
    "beginn": {
      "key": "beginn",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": true,
      "label": "Beginn",
      "writable": true
    },
    "ende": {
      "key": "ende",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": false,
      "label": "Ende",
      "writable": true
    },
    "anmeldefrist": {
      "key": "anmeldefrist",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Anmeldefrist",
      "writable": true
    },
    "max_teilnehmer": {
      "key": "max_teilnehmer",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Maximale Teilnehmerzahl",
      "writable": true
    },
    "ort_name": {
      "key": "ort_name",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Name des Veranstaltungsorts",
      "writable": true,
      "maxLength": 4000
    },
    "strasse": {
      "key": "strasse",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Straße",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-line1"
    },
    "hausnummer": {
      "key": "hausnummer",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Hausnummer",
      "writable": true,
      "maxLength": 4000
    },
    "plz": {
      "key": "plz",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Postleitzahl",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "postal-code"
    },
    "ort": {
      "key": "ort",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Ort",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-level2"
    },
    "headerbild": {
      "key": "headerbild",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Headerbild",
      "writable": false
    },
    "kurzbeschreibung": {
      "key": "kurzbeschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Kurzbeschreibung",
      "writable": true
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Ausführliche Beschreibung",
      "writable": true
    },
    "begruessungstext": {
      "key": "begruessungstext",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Begrüßungstext der Anmeldeseite",
      "writable": true
    },
    "datenschutzhinweis": {
      "key": "datenschutzhinweis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Datenschutzhinweis",
      "writable": true
    },
    "bestaetigungstext": {
      "key": "bestaetigungstext",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bestätigungstext nach der Anmeldung",
      "writable": true
    },
    "ansprechperson": {
      "key": "ansprechperson",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Ansprechperson",
      "writable": true,
      "targetAppId": "6ae070b2291a6bffcf3311bb",
      "targetEntity": "personen"
    }
  },
  "anmeldungen": {
    "veranstaltung": {
      "key": "veranstaltung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Veranstaltung",
      "writable": true,
      "targetAppId": "6ae070b67aff79540e937a15",
      "targetEntity": "veranstaltungen"
    },
    "vorname": {
      "key": "vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "nachname": {
      "key": "nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": true,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "unternehmen": {
      "key": "unternehmen",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Unternehmen",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "organization"
    },
    "position": {
      "key": "position",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Position",
      "writable": true,
      "maxLength": 4000
    },
    "anzahl_personen": {
      "key": "anzahl_personen",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Anzahl Personen",
      "writable": true
    },
    "bemerkungen": {
      "key": "bemerkungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkungen",
      "writable": true
    },
    "datenschutz_einwilligung": {
      "key": "datenschutz_einwilligung",
      "fulltype": "bool",
      "kind": "bool",
      "required": true,
      "label": "Ich habe den Datenschutzhinweis gelesen und stimme der Verarbeitung meiner Daten zu",
      "writable": true
    },
    "newsletter_einwilligung": {
      "key": "newsletter_einwilligung",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Ich möchte über weitere Veranstaltungen des IT-Clusters informiert werden",
      "writable": true
    },
    "anmeldestatus": {
      "key": "anmeldestatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Anmeldestatus",
      "writable": true,
      "options": [
        "eingegangen",
        "bestaetigt",
        "warteliste",
        "storniert"
      ]
    },
    "person": {
      "key": "person",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Zugeordnete Person",
      "writable": true,
      "targetAppId": "6ae070b2291a6bffcf3311bb",
      "targetEntity": "personen"
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "personen": [],
  "veranstaltungen": [
    {
      "kind": "range",
      "from": "beginn",
      "to": "ende"
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 5
    },
    {
      "kind": "record",
      "field": "ansprechperson",
      "targetEntity": "personen"
    }
  ],
  "anmeldungen": [
    {
      "kind": "choice",
      "field": "anmeldestatus",
      "count": 4
    },
    {
      "kind": "record",
      "field": "veranstaltung",
      "targetEntity": "veranstaltungen"
    },
    {
      "kind": "record",
      "field": "person",
      "targetEntity": "personen"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "personen": [
    "vorname",
    "nachname"
  ],
  "veranstaltungen": [
    "titel"
  ],
  "anmeldungen": [
    "vorname",
    "nachname"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
