/**
 * Anmeldung bearbeiten — 5-Schritt-Wizard.
 * Steps: 1) Eingegangene Anmeldung wählen → 2) Freie Plätze der Veranstaltung ansehen →
 *        3) Bestätigen oder auf Warteliste setzen → 4) Person zuordnen oder neu anlegen → 5) Prüfen.
 * Reads: anmeldungen, veranstaltungen. Writes: anmeldungen (update), personen (create, optional).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, BudgetTracker, StepNav, SummaryStep, SuccessStep.
 */
import { useEffect, useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { BudgetTracker } from '@/components/blocks/BudgetTracker';
import { fieldText, fieldNumber, fieldLookup, fieldRef, fieldDate, combineFilters, refFilter } from '@/lib/journey';
import type { JourneyRecord } from '@/lib/journey';
import { useAnmeldungBearbeitenFlow } from '@/lib/journey/flows/AnmeldungBearbeiten';
import { tx } from '@/i18n';

const PERSON_KEYS = ['vorname', 'nachname', 'email', 'telefon', 'unternehmen', 'funktion'] as const;

export default function AnmeldungBearbeitenPage() {
  const [step, setStep] = useState(1);
  const flow = useAnmeldungBearbeitenFlow({
    steps: {
      anmeldungen: 1, anmeldestatus: 3,
      person: 4, vorname: 4, nachname: 4, email: 4, telefon: 4, unternehmen: 4, funktion: 4,
    },
    items: {
      anmeldungen: (r, ctx) => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: [ctx.ref('veranstaltung'), fieldText(r, 'email')].filter(Boolean).join(' · '),
        status: fieldLookup(r, 'anmeldestatus') ?? undefined,
        stats: [{ label: tx('Personen'), value: fieldNumber(r, 'anzahl_personen') ?? 1 }],
      }),
      person: (r) => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: fieldText(r, 'email'),
      }),
    },
  });

  const anmeldungId = flow.pick('anmeldungen').selectedId as string | null | undefined;
  const anmeldung: JourneyRecord | undefined = anmeldungId ? flow.picks.anmeldungen.recordOf(anmeldungId) : undefined;
  const eventId = anmeldung ? fieldRef(anmeldung, 'veranstaltung') : null;
  const ownStatus = anmeldung ? fieldLookup(anmeldung, 'anmeldestatus')?.key : undefined;
  const requested = anmeldung ? fieldNumber(anmeldung, 'anzahl_personen') ?? 1 : 1;

  const [event, setEvent] = useState<JourneyRecord | null>(null);
  const [taken, setTaken] = useState<number | null>(null);

  useEffect(() => {
    if (!eventId) { setEvent(null); setTaken(null); return; }
    let cancelled = false;
    setTaken(null);
    (async () => {
      const [ev, list] = await Promise.all([
        flow.port.get('veranstaltungen', eventId),
        flow.port.list('anmeldungen', {
          filter: combineFilters(refFilter('veranstaltung', eventId), tx('r.v_anmeldestatus == \'bestaetigt\'')),
          limit: 500,
        }),
      ]);
      if (cancelled) return;
      setEvent(ev);
      const sum = list
        .filter(r => r.id !== anmeldungId)
        .reduce((acc, r) => acc + (fieldNumber(r, 'anzahl_personen') ?? 1), 0);
      setTaken(sum);
    })().catch(() => { if (!cancelled) setTaken(null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, anmeldungId]);

  const max = event ? fieldNumber(event, 'max_teilnehmer') : null;
  const free = max != null && taken != null ? max - taken : null;
  const status = flow.forms.anmeldungen.get('anmeldestatus') as string | null | undefined;

  const prefillPerson = () => {
    if (!anmeldung) return;
    const f = flow.forms.personen;
    f.set('vorname', fieldText(anmeldung, 'vorname'));
    f.set('nachname', fieldText(anmeldung, 'nachname'));
    f.set('email', fieldText(anmeldung, 'email'));
    f.set('telefon', fieldText(anmeldung, 'telefon'));
    f.set('unternehmen', fieldText(anmeldung, 'unternehmen'));
    f.set('funktion', fieldText(anmeldung, 'position'));
  };

  const checkCapacity = (): boolean | string => {
    if (!flow.validateStep(3)) return false;
    if (status === 'bestaetigt' && max != null && taken != null && taken + requested > max) {
      return tx('Die maximale Teilnehmerzahl der Veranstaltung ist mit dieser Bestätigung überschritten.');
    }
    return true;
  };

  const checkPerson = (): boolean => {
    const f = flow.forms.personen;
    const typed = PERSON_KEYS.some(k => String(f.get(k) ?? '').trim() !== '');
    return typed ? f.validate(['vorname', 'nachname', 'email']) : true;
  };

  const beginn = event ? fieldDate(event, 'beginn') : null;

  return (
    <IntentWizardShell
      title={tx('Anmeldung bearbeiten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Anmeldung bestätigen oder auf die Warteliste setzen und die Person speichern.'),
        needs: [tx('Eine eingegangene Anmeldung')],
      }}
    >
      <WizardStep label={tx('Anmeldung')} description={tx('Welche Anmeldung möchtest du bearbeiten?')}>
        <EntitySelectStep
          {...flow.picks.anmeldungen.select}
          {...flow.pick('anmeldungen')}
          searchPlaceholder={tx('Name oder E-Mail …')}
        />
      </WizardStep>

      <WizardStep label={tx('Freie Plätze')} description={tx('So voll ist die Veranstaltung gerade.')} needs={['anmeldungen']}>
        <div className="space-y-4">
          {event && (
            <div className="rounded-2xl bg-secondary p-4">
              <p className="font-medium">{fieldText(event, 'titel')}</p>
              {beginn && <p className="text-sm text-muted-foreground">{beginn.replace('T', ' ')}</p>}
              <p className="mt-2 text-sm">
                {tx`Diese Anmeldung: ${requested} Person(en)`}
              </p>
            </div>
          )}
          {max != null && taken != null ? (
            <BudgetTracker
              format="count"
              unit={tx('Plätze')}
              budget={max}
              booked={taken}
              label={tx('Bestätigte Teilnehmende')}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {event && max == null
                ? tx('Für diese Veranstaltung ist keine maximale Teilnehmerzahl festgelegt.')
                : tx('Belegung wird geladen …')}
            </p>
          )}
          {free != null && free < requested && (
            <p className="text-sm text-destructive">
              {tx`Nur noch ${Math.max(free, 0)} Plätze frei — die Warteliste ist hier die passende Wahl.`}
            </p>
          )}
          <StepNav onBack={() => setStep(1)} nextStepLabel={tx('Status')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Status')} description={tx('Bestätigen oder auf die Warteliste setzen.')} needs={['anmeldungen']}>
        <div className="space-y-4">
          <Bound form={flow.forms.anmeldungen} name="anmeldestatus" />
          <StepNav onBack={() => setStep(2)} onNext={checkCapacity} nextStepLabel={tx('Person')} />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Person')}
        description={tx('Eine vorhandene Person zuordnen oder eine neue Person anlegen.')}
        needs={['anmeldungen']}
      >
        <div className="space-y-6">
          <EntitySelectStep
            {...flow.picks.person.select}
            {...flow.pick('person')}
            avatar="initials"
            searchPlaceholder={tx('Person suchen …')}
            create={false}
          />
          <div className="space-y-3 rounded-2xl bg-secondary p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{tx('Oder neue Person anlegen')}</p>
              <button type="button" className="text-sm text-primary underline" onClick={prefillPerson}>
                {tx('Daten aus der Anmeldung übernehmen')}
              </button>
            </div>
            <Bound form={flow.forms.personen} name="vorname" />
            <Bound form={flow.forms.personen} name="nachname" />
            <Bound form={flow.forms.personen} name="email" />
            <Bound form={flow.forms.personen} name="telefon" />
            <Bound form={flow.forms.personen} name="unternehmen" />
            <Bound form={flow.forms.personen} name="funktion" />
          </div>
          <StepNav onBack={() => setStep(3)} onNext={checkPerson} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'personenart', label: tx('Art der Person'), value: tx('Teilnehmende') }]}
            whatHappensNext={tx('Die Anmeldung erhält den neuen Status und die Person wird zugeordnet.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          actions={{ copy: false, print: false }}
          next={[
            { label: tx('Veranstaltung anlegen'), href: '#/intents/veranstaltung-anlegen' },
            { label: tx('Anmeldung öffnen'), href: '#/intents/anmeldung-oeffnen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
