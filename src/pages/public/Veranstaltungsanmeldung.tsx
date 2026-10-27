import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/PublicShell';
import {
  loadPublicPagesConfig,
  type PublicPagesConfig,
  type PublicPageConfig,
} from '@/lib/publicClient';
import {
  useStepForm,
  useJourneySubmit,
  useRecordSearch,
  fieldText,
  formatFieldValue,
  type JourneyRecord,
} from '@/lib/journey';
import { createPublicPort } from '@/lib/journey/publicPort';
import { IntentWizardShell } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { Bound } from '@/components/blocks/Bound';
import { tx } from '@/i18n';

const SLUG = 'veranstaltungsanmeldung';

export default function Veranstaltungsanmeldung() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicPagesConfig(SLUG)
      .then(c => {
        setCfg(c);
        setPage(c?.pages[SLUG] ?? null);
      })
      .catch(() => {
        setCfg(null);
        setPage(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !cfg || !page) {
    return <PublicShell loading={loading} unavailable={!loading} />;
  }
  return (
    <PublicShell title={tx('Veranstaltung anmelden')} description={tx('Wähle eine Veranstaltung und melde dich an.')} wide>
      <Wizard cfg={cfg} page={page} />
    </PublicShell>
  );
}

function Wizard({ cfg, page }: { cfg: PublicPagesConfig; page: PublicPageConfig }) {
  const port = useMemo(() => createPublicPort(cfg, page), [cfg, page]);
  const [step, setStep] = useState(1);

  const events = useRecordSearch(port, 'veranstaltungen', {
    searchFields: ['titel', 'ort', 'kurzbeschreibung'],
    orderby: ['v_beginn asc'],
    toItem: (r: JourneyRecord) => {
      const ort = [fieldText(r, 'ort_name'), fieldText(r, 'ort')].filter(Boolean).join(', ');
      const beginn = formatFieldValue('veranstaltungen', 'beginn', r.fields.beginn);
      return {
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: [beginn, ort].filter(Boolean).join(' · '),
      };
    },
  });

  const f = useStepForm('anmeldungen', {
    fields: [
      'veranstaltung', 'vorname', 'nachname', 'email', 'telefon', 'unternehmen',
      'position', 'anzahl_personen', 'bemerkungen', 'datenschutz_einwilligung',
      'newsletter_einwilligung',
    ],
    steps: {
      veranstaltung: 1, vorname: 2, nachname: 2, email: 2, telefon: 2, unternehmen: 2,
      position: 2, anzahl_personen: 2, bemerkungen: 2, datenschutz_einwilligung: 2,
      newsletter_einwilligung: 2,
    },
    autoComplete: true,
  });
  const submit = useJourneySubmit(
    port,
    [{ key: 'anmeldung', entity: 'anmeldungen', form: f, primary: true }],
    { draftKey: 'veranstaltungsanmeldung' },
  );

  const selectedId = (f.get('veranstaltung') as string | null) ?? null;
  const ev = selectedId ? events.recordOf(selectedId) : undefined;
  const bild = ev ? (ev.fields.headerbild as string | null) : null;
  const ort = ev
    ? [
        fieldText(ev, 'ort_name'),
        [fieldText(ev, 'strasse'), fieldText(ev, 'hausnummer')].filter(Boolean).join(' '),
        [fieldText(ev, 'plz'), fieldText(ev, 'ort')].filter(Boolean).join(' '),
      ].filter(Boolean).join(', ')
    : '';

  const steps = [
    { label: tx('Veranstaltung'), key: 'event' },
    { label: tx('Deine Daten'), key: 'data' },
    { label: tx('Prüfen'), key: 'review' },
  ];

  return (
    <IntentWizardShell
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      back={false}
      forms={[f]}
      draftKey="veranstaltungsanmeldung"
    >
      {step === 1 && (
        <EntitySelectStep
          {...events.select}
          avatar="none"
          create={false}
          searchPlaceholder={tx('Veranstaltung suchen')}
          emptyText={tx('Aktuell ist keine Veranstaltung mit offener Anmeldung verfügbar.')}
          selectedId={selectedId}
          onSelect={id => {
            f.set('veranstaltung', id, events.labelOf(id) ?? '');
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <div className="space-y-5">
          {ev && (
            <div className="overflow-hidden rounded-xl border bg-muted/30">
              {bild && <img src={bild} alt="" className="h-40 w-full object-cover sm:h-52" />}
              <div className="space-y-2 p-4">
                <h2 className="text-lg font-semibold">{fieldText(ev, 'titel')}</h2>
                <p className="text-sm text-muted-foreground">
                  {formatFieldValue('veranstaltungen', 'beginn', ev.fields.beginn)}
                  {fieldText(ev, 'ende') ? ` – ${formatFieldValue('veranstaltungen', 'ende', ev.fields.ende)}` : ''}
                </p>
                {ort && <p className="text-sm text-muted-foreground">{ort}</p>}
                {fieldText(ev, 'kurzbeschreibung') && (
                  <p className="whitespace-pre-line text-sm">{fieldText(ev, 'kurzbeschreibung')}</p>
                )}
                {fieldText(ev, 'begruessungstext') && (
                  <p className="whitespace-pre-line text-sm">{fieldText(ev, 'begruessungstext')}</p>
                )}
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={f} name="vorname" />
            <Bound form={f} name="nachname" />
          </div>
          <Bound form={f} name="email" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={f} name="telefon" />
            <Bound form={f} name="anzahl_personen" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={f} name="unternehmen" />
            <Bound form={f} name="position" />
          </div>
          <Bound form={f} name="bemerkungen" />
          {ev && fieldText(ev, 'datenschutzhinweis') && (
            <p className="whitespace-pre-line rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              {fieldText(ev, 'datenschutzhinweis')}
            </p>
          )}
          <Bound form={f} name="datenschutz_einwilligung" />
          <Bound form={f} name="newsletter_einwilligung" />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() =>
              f.validate([
                'veranstaltung', 'vorname', 'nachname', 'email', 'telefon',
                'anzahl_personen', 'datenschutz_einwilligung',
              ])
            }
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      )}

      {step === 3 && !submit.done && (
        <SummaryStep
          forms={[f]}
          submit={submit}
          whatHappensNext={tx('Nach dem Absenden ist deine Anmeldung eingegangen.')}
        />
      )}
      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[f]}
          submit={submit}
          title={tx('Anmeldung eingegangen')}
          whatHappensNext={
            ev && fieldText(ev, 'bestaetigungstext')
              ? <span className="whitespace-pre-line">{fieldText(ev, 'bestaetigungstext')}</span>
              : undefined
          }
        />
      )}
    </IntentWizardShell>
  );
}
