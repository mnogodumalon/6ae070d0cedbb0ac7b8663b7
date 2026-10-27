/**
 * Veranstaltung anlegen — 5-Schritt-Wizard.
 * Steps: 1) Titel & Art → 2) Termin & Teilnehmer → 3) Ort → 4) Ansprechperson → 5) Anmeldeseite → 6) Prüfen & anlegen.
 * Reads: personen (Auswahl der Ansprechperson). Writes: veranstaltungen (status fest auf „entwurf“).
 * Composes: IntentWizardShell, Bound, EntitySelectStep, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText } from '@/lib/journey';
import { useVeranstaltungAnlegenFlow } from '@/lib/journey/flows/VeranstaltungAnlegen';
import { tx } from '@/i18n';

export default function VeranstaltungAnlegenPage() {
  const [step, setStep] = useState(1);
  const flow = useVeranstaltungAnlegenFlow({
    steps: {
      titel: 1, veranstaltungsart: 1,
      beginn: 2, ende: 2, anmeldefrist: 2, max_teilnehmer: 2,
      ort_name: 3, strasse: 3, hausnummer: 3, plz: 3, ort: 3,
      ansprechperson: 4,
      headerbild: 5, kurzbeschreibung: 5, beschreibung: 5, begruessungstext: 5, datenschutzhinweis: 5, bestaetigungstext: 5,
    },
    items: {
      ansprechperson: r => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: [fieldText(r, 'unternehmen'), fieldText(r, 'funktion')].filter(Boolean).join(' · ') || undefined,
      }),
    },
  });
  const v = flow.forms.veranstaltungen;

  return (
    <IntentWizardShell
      title={tx('Veranstaltung anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Veranstaltung mit Termin, Ort, Ansprechperson und Anmeldeseite in einem Zug erfassen.'),
        needs: [tx('Titel und Art'), tx('Beginn und Ende'), tx('Veranstaltungsort'), tx('Texte der Anmeldeseite')],
      }}
    >
      <WizardStep label={tx('Titel')} description={tx('Wie heißt die Veranstaltung und um was für eine Art handelt es sich?')}>
        <div className="space-y-4">
          <Bound form={v} name="titel" />
          <Bound form={v} name="veranstaltungsart" />
          <StepNav hideBack onNext={() => flow.validateStep(1)} nextStepLabel={tx('Termin')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Termin')} description={tx('Wann findet sie statt und wie viele Personen können teilnehmen?')}>
        <div className="space-y-4">
          <Bound form={v} name="beginn" />
          <Bound form={v} name="ende" />
          <Bound form={v} name="anmeldefrist" />
          <Bound form={v} name="max_teilnehmer" />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Ort')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Ort')} description={tx('Wo findet die Veranstaltung statt?')}>
        <div className="space-y-4">
          <Bound form={v} name="ort_name" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2"><Bound form={v} name="strasse" /></div>
            <Bound form={v} name="hausnummer" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Bound form={v} name="plz" />
            <div className="sm:col-span-2"><Bound form={v} name="ort" /></div>
          </div>
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Ansprechperson')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Ansprechperson')} description={tx('Wer ist Ansprechperson für diese Veranstaltung?')}>
        <div className="space-y-4">
          <EntitySelectStep
            {...flow.picks.ansprechperson.select}
            {...flow.pick('ansprechperson')}
            avatar="initials"
            searchPlaceholder={tx('Name oder Unternehmen suchen …')}
          />
          <StepNav onBack={() => setStep(3)} onNext={() => flow.validateStep(4)} nextStepLabel={tx('Anmeldeseite')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Anmeldeseite')} description={tx('Headerbild und Texte, die Teilnehmende auf der Anmeldeseite sehen.')}>
        <div className="space-y-4">
          <Bound form={v} name="headerbild" />
          <Bound form={v} name="kurzbeschreibung" rows={2} />
          <Bound form={v} name="beschreibung" rows={5} />
          <Bound form={v} name="begruessungstext" rows={3} />
          <Bound form={v} name="datenschutzhinweis" rows={3} />
          <Bound form={v} name="bestaetigungstext" rows={3} />
          <StepNav onBack={() => setStep(4)} onNext={() => flow.validateStep(5)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Status'), value: tx('Entwurf') }]}
            whatHappensNext={tx('Die Veranstaltung wird als Entwurf angelegt und ist noch nicht für Anmeldungen geöffnet.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          restartLabel={tx('Weitere Veranstaltung anlegen')}
          whatHappensNext={tx('Die Veranstaltung ist als Entwurf gespeichert. Öffne die Anmeldung, wenn alles bereit ist.')}
          next={[
            { label: tx('Weitere Veranstaltung anlegen'), onClick: () => { flow.submit.reset(); flow.reset(); setStep(1); } },
            { label: tx('Anmeldung bearbeiten'), href: '#/intents/anmeldung-bearbeiten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
