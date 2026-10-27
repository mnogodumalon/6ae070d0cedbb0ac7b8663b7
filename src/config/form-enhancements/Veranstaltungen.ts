// Auto-generated. Per-entity form-enhancements config for "Veranstaltungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", {"row": ["veranstaltungsart", "status"], "cols": "1fr 1fr"}, {"row": ["beginn", "ende"], "cols": "1fr 1fr"}, {"row": ["anmeldefrist", "max_teilnehmer"], "cols": "1fr 1fr"}, "ort_name", {"row": ["strasse", "hausnummer"], "cols": "2fr 1fr"}, {"row": ["plz", "ort"], "cols": "1fr 2fr"}, "ansprechperson", "kurzbeschreibung", "beschreibung", "begruessungstext", "datenschutzhinweis", "bestaetigungstext"],
  defaults: {
    'status': { kind: 'lookup', key: 'entwurf', label: 'Entwurf' },
    'beginn': { kind: 'today', withTime: true },
  },
  computed: {
    '_veranstaltung_dauer_stunden': { kind: 'dateDiff', from: 'beginn', to: 'ende', unit: 'hours' },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
