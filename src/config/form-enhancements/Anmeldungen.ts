// Auto-generated. Per-entity form-enhancements config for "Anmeldungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["veranstaltung", {"row": ["vorname", "nachname"]}, "email", "telefon", {"row": ["unternehmen", "position"], "cols": "1fr 1fr"}, "anzahl_personen", "anmeldestatus", "person", "datenschutz_einwilligung", "newsletter_einwilligung", "bemerkungen"],
  defaults: {
    'anzahl_personen': { kind: 'literal', value: 1 },
    'anmeldestatus': { kind: 'lookup', key: 'eingegangen', label: 'Eingegangen' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
