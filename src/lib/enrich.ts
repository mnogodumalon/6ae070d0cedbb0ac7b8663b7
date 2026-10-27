import type { EnrichedAnmeldungen, EnrichedVeranstaltungen } from '@/types/enriched';
import type { Anmeldungen, Personen, Veranstaltungen } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface VeranstaltungenMaps {
  personenMap: Map<string, Personen>;
}

export function enrichVeranstaltungen(
  veranstaltungen: Veranstaltungen[],
  maps: VeranstaltungenMaps
): EnrichedVeranstaltungen[] {
  return veranstaltungen.map(r => ({
    ...r,
    ansprechpersonName: resolveDisplay(r.fields.ansprechperson, maps.personenMap, 'vorname', 'nachname'),
  }));
}

interface AnmeldungenMaps {
  veranstaltungenMap: Map<string, Veranstaltungen>;
  personenMap: Map<string, Personen>;
}

export function enrichAnmeldungen(
  anmeldungen: Anmeldungen[],
  maps: AnmeldungenMaps
): EnrichedAnmeldungen[] {
  return anmeldungen.map(r => ({
    ...r,
    veranstaltungName: resolveDisplay(r.fields.veranstaltung, maps.veranstaltungenMap, 'titel'),
    personName: resolveDisplay(r.fields.person, maps.personenMap, 'vorname', 'nachname'),
  }));
}
