/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - personen: vorname (Vorname), nachname (Nachname), email (E-Mail)
 *   - veranstaltungen: titel (Titel), veranstaltungsart (Veranstaltungsart), status (Status), beginn (Beginn)
 *   - anmeldungen: veranstaltung (Veranstaltung), vorname (Vorname), nachname (Nachname), email (E-Mail), datenschutz_einwilligung (Ich habe den Datenschutzhinweis gelesen und stimme der Verarbeitung meiner Daten zu)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "personen": "vorname" | "nachname" | "email" | "telefon" | "unternehmen" | "funktion" | "personenart";
  "veranstaltungen": "titel" | "veranstaltungsart" | "status" | "beginn" | "ende" | "anmeldefrist" | "max_teilnehmer" | "ort_name" | "strasse" | "hausnummer" | "plz" | "ort" | "kurzbeschreibung" | "beschreibung" | "begruessungstext" | "datenschutzhinweis" | "bestaetigungstext" | "ansprechperson";
  "anmeldungen": "veranstaltung" | "vorname" | "nachname" | "email" | "telefon" | "unternehmen" | "position" | "anzahl_personen" | "bemerkungen" | "datenschutz_einwilligung" | "newsletter_einwilligung" | "anmeldestatus" | "person";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  personen: { vorname: "Bitte den Vornamen eingeben.", nachname: "Bitte den Nachnamen eingeben.", email: "Bitte die E-Mail-Adresse eingeben." },
  veranstaltungen: { titel: "Bitte einen Titel eingeben.", veranstaltungsart: "Bitte die Art der Veranstaltung wählen.", status: "Bitte einen Status wählen.", beginn: "Bitte Datum und Uhrzeit des Beginns wählen." },
  anmeldungen: { veranstaltung: "Bitte eine Veranstaltung auswählen.", vorname: "Bitte den Vornamen eingeben.", nachname: "Bitte den Nachnamen eingeben.", email: "Bitte die E-Mail-Adresse eingeben.", datenschutz_einwilligung: "Bitte der Datenverarbeitung zustimmen." },
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
