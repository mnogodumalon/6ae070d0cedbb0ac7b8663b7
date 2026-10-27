/**
 * Anmeldung öffnen — 3-Schritt-Wizard.
 * Steps: 1) Veranstaltung im Entwurf wählen → 2) Anmeldefrist und Teilnehmerzahl prüfen → 3) Prüfen & Status auf „Anmeldung offen" setzen.
 * Reads: veranstaltungen (titel, beginn, anmeldefrist, max_teilnehmer, status). Writes: veranstaltungen.status (update via useAnmeldungOeffnenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, StepNav, StatusBadge, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { IconCalendarEvent, IconCheck, IconUsers, IconAlertTriangle } from '@tabler/icons-react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { StepNav } from '@/components/blocks/StepNav';
import { StatusBadge } from '@/components/blocks/StatusBadge';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldDate, fieldNumber, fieldLookup, todayIso } from '@/lib/journey';
import { useAnmeldungOeffnenFlow } from '@/lib/journey/flows/AnmeldungOeffnen';
import { tx } from '@/i18n';

function showDate(iso: string | null, pattern = 'dd.MM.yyyy'): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

export default function AnmeldungOeffnenPage() {
  const [step, setStep] = useState(1);
  const flow = useAnmeldungOeffnenFlow({
    steps: { veranstaltungen: 1 },
    items: {
      veranstaltungen: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: tx`Beginn ${showDate(fieldDate(r, 'beginn'), 'dd.MM.yyyy HH:mm')}`,
        status: fieldLookup(r, 'status') ?? undefined,
      }),
    },
  });

  const pickedId = flow.pick('veranstaltungen').selectedId ?? null;
  const picked = pickedId ? flow.picks.veranstaltungen.recordOf(pickedId) : undefined;
  const frist = picked ? fieldDate(picked, 'anmeldefrist') : null;
  const maxTn = picked ? fieldNumber(picked, 'max_teilnehmer') : null;
  const status = picked ? fieldLookup(picked, 'status') : null;
  const fristVorbei = frist !== null && frist < todayIso();
  const alreadyOpen = status?.key === 'anmeldung_offen';

  const problem = (): string | undefined => {
    if (!picked) return tx('Wähle zuerst eine Veranstaltung aus.');
    if (!frist) return tx('Für diese Veranstaltung ist noch keine Anmeldefrist gesetzt.');
    if (maxTn === null || maxTn <= 0) return tx('Für diese Veranstaltung ist noch keine maximale Teilnehmerzahl gesetzt.');
    if (fristVorbei) return tx('Die Anmeldefrist liegt bereits in der Vergangenheit.');
    if (alreadyOpen) return tx('Die Anmeldung ist bereits offen.');
    return undefined;
  };
  const blocker = problem();

  return (
    <IntentWizardShell
      title={tx('Anmeldung öffnen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Gib eine Veranstaltung im Entwurf für die öffentliche Anmeldung frei.'),
        needs: [tx('Veranstaltung im Entwurf'), tx('Gesetzte Anmeldefrist'), tx('Maximale Teilnehmerzahl')],
      }}
    >
      <WizardStep label={tx('Veranstaltung')} description={tx('Welche Veranstaltung soll für die Anmeldung geöffnet werden?')}>
        <EntitySelectStep
          {...flow.picks.veranstaltungen.select}
          {...flow.pick('veranstaltungen')}
          avatar="none"
          searchPlaceholder={tx('Titel der Veranstaltung …')}
        />
      </WizardStep>

      <WizardStep label={tx('Frist & Plätze')} description={tx('Prüfe, ob Anmeldefrist und Teilnehmerzahl gesetzt sind.')}>
        {picked ? (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-4 space-y-3 overflow-hidden">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold min-w-0 truncate">{fieldText(picked, 'titel')}</h3>
                {status && <StatusBadge statusKey={status.key} label={status.label} />}
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <IconCalendarEvent size={16} className="shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{tx('Beginn')}:</span>
                  <span>{showDate(fieldDate(picked, 'beginn'), 'dd.MM.yyyy HH:mm')}</span>
                </li>
                <li className="flex items-center gap-2">
                  {frist && !fristVorbei ? (
                    <IconCheck size={16} className="shrink-0 text-emerald-600" />
                  ) : (
                    <IconAlertTriangle size={16} className="shrink-0 text-amber-600" />
                  )}
                  <span className="text-muted-foreground">{tx('Anmeldefrist')}:</span>
                  <span>{frist ? showDate(frist) : tx('nicht gesetzt')}</span>
                </li>
                <li className="flex items-center gap-2">
                  {maxTn !== null && maxTn > 0 ? (
                    <IconCheck size={16} className="shrink-0 text-emerald-600" />
                  ) : (
                    <IconAlertTriangle size={16} className="shrink-0 text-amber-600" />
                  )}
                  <IconUsers size={16} className="shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{tx('Maximale Teilnehmerzahl')}:</span>
                  <span>{maxTn !== null ? maxTn : tx('nicht gesetzt')}</span>
                </li>
              </ul>
              {blocker && (
                <p className="text-sm text-destructive" role="alert">
                  {blocker}
                </p>
              )}
            </div>
            <StepNav
              onBack={() => setStep(1)}
              onNext={() => blocker ?? true}
              nextStepLabel={tx('Prüfen')}
            />
          </div>
        ) : (
          <StepNav onBack={() => setStep(1)} nextDisabled>
            {tx('Dieser Schritt braucht die Auswahl aus Schritt 1.')}
          </StepNav>
        )}
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'status', label: tx('Neuer Status'), value: tx('Anmeldung offen') },
              { key: 'frist', label: tx('Anmeldefrist'), value: showDate(frist) },
              { key: 'max', label: tx('Maximale Teilnehmerzahl'), value: maxTn !== null ? String(maxTn) : '—' },
            ]}
            confirmLabel={tx('Anmeldung öffnen')}
            whatHappensNext={tx('Die Veranstaltung nimmt ab sofort Anmeldungen entgegen.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          title={tx('Anmeldung geöffnet')}
          facts={[
            { label: tx('Veranstaltung'), value: fieldText(flow.submit.result.primary, 'titel') || '—' },
            { label: tx('Status'), value: fieldLookup(flow.submit.result.primary, 'status')?.label ?? tx('Anmeldung offen') },
          ]}
          actions={{ copy: false, print: false }}
          whatHappensNext={tx('Neue Anmeldungen kannst du jetzt im Ablauf „Anmeldung bearbeiten" bestätigen.')}
          next={[
            { label: tx('Weitere Anmeldung öffnen'), onClick: () => { flow.reset(); setStep(1); } },
            { label: tx('Anmeldung bearbeiten'), href: '#/intents/anmeldung-bearbeiten' },
            { label: tx('Veranstaltung anlegen'), href: '#/intents/veranstaltung-anlegen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
