/**
 * useVeranstaltungAnlegenFlow — the plumbing of the flow « Veranstaltung anlegen », generated from the plan.
 *
 * Writes `veranstaltungen`: asks `titel`, `veranstaltungsart`, `beginn`, `ende`, `anmeldefrist`, `max_teilnehmer`, `ort_name`, `strasse`, `hausnummer`, `plz`, `ort`, `ansprechperson`, `headerbild`, `kurzbeschreibung`, `beschreibung`, `begruessungstext`, `datenschutzhinweis`, `bestaetigungstext`; sets `status` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 3)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useVeranstaltungAnlegenFlow({
 *     steps: { ansprechperson: 1, titel: 2, veranstaltungsart: 2, beginn: 2, ende: 2, anmeldefrist: 2, max_teilnehmer: 2, ort_name: 2, strasse: 2, hausnummer: 2, plz: 2, ort: 2, headerbild: 2, kurzbeschreibung: 2, beschreibung: 2, begruessungstext: 2, datenschutzhinweis: 2, bestaetigungstext: 2 },
 *     items: { ansprechperson: r => ({ id: r.id, title: fieldText(r, 'vorname') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.ansprechperson.select} {...flow.pick('ansprechperson')} />
 *     <Bound form={flow.forms.veranstaltungen} name="titel" />
 *     <Bound form={flow.forms.veranstaltungen} name="veranstaltungsart" />
 *     <Bound form={flow.forms.veranstaltungen} name="beginn" />
 *     <Bound form={flow.forms.veranstaltungen} name="ende" />
 *     <Bound form={flow.forms.veranstaltungen} name="anmeldefrist" />
 *     <Bound form={flow.forms.veranstaltungen} name="max_teilnehmer" />
 *     <Bound form={flow.forms.veranstaltungen} name="ort_name" />
 *     <Bound form={flow.forms.veranstaltungen} name="strasse" />
 *     <Bound form={flow.forms.veranstaltungen} name="hausnummer" />
 *     <Bound form={flow.forms.veranstaltungen} name="plz" />
 *     <Bound form={flow.forms.veranstaltungen} name="ort" />
 *     <Bound form={flow.forms.veranstaltungen} name="headerbild" />
 *     <Bound form={flow.forms.veranstaltungen} name="kurzbeschreibung" />
 *     <Bound form={flow.forms.veranstaltungen} name="beschreibung" />
 *     <Bound form={flow.forms.veranstaltungen} name="begruessungstext" />
 *     <Bound form={flow.forms.veranstaltungen} name="datenschutzhinweis" />
 *     <Bound form={flow.forms.veranstaltungen} name="bestaetigungstext" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type VeranstaltungAnlegenFieldKey = 'anmeldefrist' | 'ansprechperson' | 'beginn' | 'begruessungstext' | 'beschreibung' | 'bestaetigungstext' | 'datenschutzhinweis' | 'ende' | 'hausnummer' | 'headerbild' | 'kurzbeschreibung' | 'max_teilnehmer' | 'ort' | 'ort_name' | 'plz' | 'strasse' | 'titel' | 'veranstaltungsart';

export interface VeranstaltungAnlegenForms {
  veranstaltungen: StepForm<'veranstaltungen'>;
}

// Alias so the option generics stay readable.
type Key = VeranstaltungAnlegenFieldKey;

export interface VeranstaltungAnlegenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    ansprechperson?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"anmeldefrist": 2, "ansprechperson": 1, "beginn": 2, "begruessungstext": 2, "beschreibung": 2, "bestaetigungstext": 2, "datenschutzhinweis": 2, "ende": 2, "hausnummer": 2, "headerbild": 2, "kurzbeschreibung": 2, "max_teilnehmer": 2, "ort": 2, "ort_name": 2, "plz": 2, "strasse": 2, "titel": 2, "veranstaltungsart": 2};
export const VERANSTALTUNGANLEGEN_REVIEW_STEP = 3;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useVeranstaltungAnlegenFlow(options: VeranstaltungAnlegenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const veranstaltungen = useStepForm('veranstaltungen', {
    fields: ["titel", "veranstaltungsart", "beginn", "ende", "anmeldefrist", "max_teilnehmer", "ort_name", "strasse", "hausnummer", "plz", "ort", "ansprechperson", "headerbild", "kurzbeschreibung", "beschreibung", "begruessungstext", "datenschutzhinweis", "bestaetigungstext"],
    steps: only(steps, ["titel", "veranstaltungsart", "beginn", "ende", "anmeldefrist", "max_teilnehmer", "ort_name", "strasse", "hausnummer", "plz", "ort", "ansprechperson", "headerbild", "kurzbeschreibung", "beschreibung", "begruessungstext", "datenschutzhinweis", "bestaetigungstext"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["titel", "veranstaltungsart", "beginn", "ende", "anmeldefrist", "max_teilnehmer", "ort_name", "strasse", "hausnummer", "plz", "ort", "ansprechperson", "headerbild", "kurzbeschreibung", "beschreibung", "begruessungstext", "datenschutzhinweis", "bestaetigungstext"]),
    messages: only(options.messages as Record<string, string> | undefined, ["titel", "veranstaltungsart", "beginn", "ende", "anmeldefrist", "max_teilnehmer", "ort_name", "strasse", "hausnummer", "plz", "ort", "ansprechperson", "headerbild", "kurzbeschreibung", "beschreibung", "begruessungstext", "datenschutzhinweis", "bestaetigungstext"]),
  });
  const forms: VeranstaltungAnlegenForms = { veranstaltungen };
  const formList: StepForm[] = [veranstaltungen];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    ansprechperson: useRecordSearch(servicePort, 'personen', withPickPolicy('ansprechperson', {
      searchFields: ["vorname", "nachname", "unternehmen"] as never,
      filter: "'ansprechperson' in r.v_personenart or 'mitarbeitende' in r.v_personenart",
      where: (r: JourneyRecord) => fieldLookups(r, "personenart").some(o => ["ansprechperson", "mitarbeitende"].includes(o.key)),
      toItem: options.items?.ansprechperson as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:veranstaltung-anlegen:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:veranstaltung-anlegen:write:${entity}.${field}`,
  });
  const picks = {
    ansprechperson: { ...searches.ansprechperson, select: { ...searches.ansprechperson.select, create: false as boolean, hint: hintFor('ansprechperson', 'personen', {"conditions": [{"field": "personenart", "op": "in", "value": ["ansprechperson", "mitarbeitende"]}], "mode": "all"} as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'veranstaltungen', entity: 'veranstaltungen', form: veranstaltungen, primary: true,
      values: (): FormValues => ({
        status: policyFixedValue('veranstaltungen', 'status') ?? "entwurf",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('veranstaltungen', 'status', policyFixedValue('veranstaltungen', 'status') ?? "entwurf")],

      // the planner's assumptions that first act here — shown once with „Passt“ / „ändern“
      notices: () => [{"assumed": "Ansprechpersonen und Mitarbeitende", "id": "ansprechpersonen-auswahl", "question": "Welche Personen sind als Ansprechperson w\u00e4hlbar?"}],
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'veranstaltung-anlegen' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: VeranstaltungAnlegenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: VeranstaltungAnlegenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'veranstaltung-anlegen' as const,
    draftKey: 'veranstaltung-anlegen' as const,
    entity: 'veranstaltungen' as const,
    form: veranstaltungen,
    forms, formList, picks, submit, steps,    reviewStep: VERANSTALTUNGANLEGEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type VeranstaltungAnlegenFlow = ReturnType<typeof useVeranstaltungAnlegenFlow>;
