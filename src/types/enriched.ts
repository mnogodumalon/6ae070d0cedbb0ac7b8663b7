import type { Anmeldungen, Veranstaltungen } from './app';

export type EnrichedVeranstaltungen = Veranstaltungen & {
  ansprechpersonName: string;
};

export type EnrichedAnmeldungen = Anmeldungen & {
  veranstaltungName: string;
  personName: string;
};
