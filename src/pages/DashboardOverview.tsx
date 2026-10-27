import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { IconAlertTriangle, IconCalendarEvent, IconClockHour4, IconPlus, IconUsers } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { flowActionFor } from '@/config/plan';
import { extractRecordId } from '@/services/livingAppsService';
import { lookupKey, formatDate } from '@/lib/formatters';
import { tx, dateFnsLocale } from '@/i18n';
import { useClock, gruss, namen } from '@/lib/polish';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatCard, StatCardRow } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { Button } from '@/components/ui/button';
import { CalendarWidget, useCalendar, type CalendarEvent, type CalendarTone } from '@/components/widgets/CalendarWidget';

type Filter = 'all' | 'open' | 'deadline';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { veranstaltungen, anmeldungen } = data;
  const crud = useEntityCrud(data);
  const enrichedVeranstaltungen = crud.enriched.veranstaltungen;
  const enrichedAnmeldungen = crud.enriched.anmeldungen;

  const clock = useClock();
  const cal = useCalendar({ initialView: 'month' });
  const [filter, setFilter] = useState<Filter>('all');
  const today = format(clock, 'yyyy-MM-dd');
  const in7 = format(new Date(clock.getTime() + 7 * 86400000), 'yyyy-MM-dd');

  // Belegte Plätze je Veranstaltung (ohne Stornierte und Warteliste)
  const belegung = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of anmeldungen) {
      const k = lookupKey(a.fields.anmeldestatus);
      if (k === 'storniert' || k === 'warteliste') continue;
      const id = extractRecordId(a.fields.veranstaltung);
      if (!id) continue;
      m.set(id, (m.get(id) ?? 0) + (a.fields.anzahl_personen ?? 1));
    }
    return m;
  }, [anmeldungen]);

  const isOpen = (v: EnrichedVeranstaltungenT) =>
    lookupKey(v.fields.status) === 'anmeldung_offen' &&
    (!v.fields.anmeldefrist || v.fields.anmeldefrist.slice(0, 10) >= today);

  type EnrichedVeranstaltungenT = (typeof enrichedVeranstaltungen)[number];

  const offene = enrichedVeranstaltungen.filter(isOpen);
  const baldFrist = offene
    .filter(v => v.fields.anmeldefrist && v.fields.anmeldefrist.slice(0, 10) <= in7)
    .sort((a, b) => (a.fields.anmeldefrist ?? '').localeCompare(b.fields.anmeldefrist ?? ''));
  const ueberbucht = enrichedVeranstaltungen.filter(v => {
    const max = v.fields.max_teilnehmer;
    return !!max && (belegung.get(v.record_id) ?? 0) > max && (v.fields.beginn ?? '').slice(0, 10) >= today;
  });

  const kapazitaet = offene.reduce((s, v) => s + (v.fields.max_teilnehmer ?? 0), 0);
  const belegt = offene.reduce((s, v) => s + (v.fields.max_teilnehmer ? (belegung.get(v.record_id) ?? 0) : 0), 0);

  const neue = enrichedAnmeldungen
    .filter(a => lookupKey(a.fields.anmeldestatus) === 'eingegangen')
    .sort((a, b) => (b.createdat ?? '').localeCompare(a.createdat ?? ''));

  const shown = enrichedVeranstaltungen.filter(v =>
    filter === 'open' ? isOpen(v) : filter === 'deadline' ? baldFrist.some(b => b.record_id === v.record_id) : true);

  const toneFor = (v: EnrichedVeranstaltungenT): CalendarTone => {
    const k = lookupKey(v.fields.status);
    if (k === 'abgesagt') return 'destructive';
    if (k === 'ausgebucht') return 'warning';
    if (k === 'anmeldung_offen') return 'success';
    if (k === 'entwurf') return 'default';
    return 'primary';
  };

  const events: CalendarEvent[] = shown
    .filter(v => !!v.fields.beginn)
    .map(v => {
      const max = v.fields.max_teilnehmer;
      const n = belegung.get(v.record_id) ?? 0;
      return {
        id: `veranstaltung:${v.record_id}`,
        start: v.fields.beginn!,
        end: v.fields.ende,
        title: v.fields.titel ?? tx('Ohne Titel'),
        subtitle: max ? `${n} / ${max}` : v.fields.ort_name,
        tone: toneFor(v),
      };
    });

  const naechste = enrichedVeranstaltungen
    .filter(v => (v.fields.beginn ?? '').slice(0, 10) >= today && lookupKey(v.fields.status) !== 'abgesagt')
    .sort((a, b) => (a.fields.beginn ?? '').localeCompare(b.fields.beginn ?? ''))[0];

  const personName = (a: { fields: { vorname?: string; nachname?: string } }) =>
    `${a.fields.vorname ?? ''} ${a.fields.nachname ?? ''}`.trim() || tx('Unbekannt');

  const kontext = neue.length > 0
    ? tx`${namen(neue.map(a => a.fields.vorname ?? ''))} ${neue.length === 1 ? 'hat' : 'haben'} sich neu angemeldet und warten auf Bestätigung.`
    : naechste
      ? tx`Nächste Veranstaltung: ${naechste.fields.titel ?? ''} am ${formatDate(naechste.fields.beginn)}.`
      : tx('Lege deine erste Veranstaltung an und öffne die Anmeldung.');

  const hero = ueberbucht.length > 0 ? (
    <HeroBanner
      icon={<IconAlertTriangle size={18} />}
      action={{ label: tx('Veranstaltung prüfen'), onClick: () => crud.veranstaltungen.openDetail(ueberbucht[0]) }}
    >
      <b>{ueberbucht[0].fields.titel}</b> {tx`ist überbucht — ${belegung.get(ueberbucht[0].record_id) ?? 0} Plätze belegt bei maximal ${ueberbucht[0].fields.max_teilnehmer ?? 0}.`}
    </HeroBanner>
  ) : undefined;

  const auslastung = kapazitaet > 0 ? Math.round((belegt / kapazitaet) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{kontext}</p>
        </div>
        {crud.veranstaltungen.canWrite && (
          <Button onClick={() => crud.veranstaltungen.openCreate({ status: 'entwurf' })}>
            <IconPlus size={16} className="shrink-0" />
            {tx('Neue Veranstaltung')}
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="split"
        hero={hero}
        kpis={
          <StatCardRow>
            <StatCard
              title={tx('Anmeldung offen')}
              value={offene.length}
              description={offene.length > 0 ? tx('Veranstaltungen mit freier Anmeldung') : tx('Aktuell keine offene Anmeldung')}
              icon={<IconCalendarEvent size={18} className="text-muted-foreground" />}
              onClick={() => setFilter(f => (f === 'open' ? 'all' : 'open'))}
              active={filter === 'open'}
            />
            <StatCard
              title={tx('Frist endet bald')}
              value={baldFrist.length}
              description={baldFrist.length > 0 ? tx('Anmeldefrist in den nächsten 7 Tagen') : tx('Keine Frist läuft bald ab')}
              icon={<IconClockHour4 size={18} className="text-muted-foreground" />}
              tone={baldFrist.length > 0 ? 'warning' : 'default'}
              onClick={() => setFilter(f => (f === 'deadline' ? 'all' : 'deadline'))}
              active={filter === 'deadline'}
            />
            <StatCard
              title={tx('Plätze belegt')}
              value={kapazitaet > 0 ? `${auslastung} %` : '–'}
              description={kapazitaet > 0 ? tx`${belegt} von ${kapazitaet} Plätzen bei offenen Veranstaltungen` : tx('Keine Platzgrenzen hinterlegt')}
              icon={<IconUsers size={18} className="text-muted-foreground" />}
            />
          </StatCardRow>
        }
        aside={
          <>
            <WorkList
              title={tx('Neue Anmeldungen')}
              items={neue.map(a => {
                const go = flowActionFor('anmeldungen', 'anmeldestatus', a.record_id, 'bestaetigt');
                return {
                  id: a.record_id,
                  title: personName(a),
                  secondLine: (
                    <>
                      <span className="font-medium text-primary">{tx('Eingegangen')}</span>
                      <span className="text-muted-foreground"> · {a.veranstaltungName}</span>
                    </>
                  ),
                  action: go ? { label: tx('Prüfen'), onClick: go } : undefined,
                };
              })}
              onItemClick={id => {
                const r = anmeldungen.find(a => a.record_id === id);
                if (r) crud.anmeldungen.openDetail(r);
              }}
              max={5}
              empty={{ text: tx('Keine neuen Anmeldungen — alles bearbeitet.') }}
            />
            <WorkList
              title={tx('Belegung & Fristen')}
              items={[...offene]
                .sort((a, b) => (a.fields.anmeldefrist ?? '9999').localeCompare(b.fields.anmeldefrist ?? '9999'))
                .map(v => {
                  const max = v.fields.max_teilnehmer;
                  const n = belegung.get(v.record_id) ?? 0;
                  const voll = !!max && n >= max;
                  return {
                    id: v.record_id,
                    title: v.fields.titel ?? tx('Ohne Titel'),
                    secondLine: (
                      <>
                        <span className={voll ? 'font-medium text-destructive' : 'font-medium'}>
                          {max ? `${n} / ${max}` : tx`${n} angemeldet`}
                        </span>
                        <span className="text-muted-foreground">
                          {v.fields.anmeldefrist ? tx` · Frist ${formatDate(v.fields.anmeldefrist)}` : ''}
                        </span>
                      </>
                    ),
                  };
                })}
              onItemClick={id => {
                const r = veranstaltungen.find(v => v.record_id === id);
                if (r) crud.veranstaltungen.openDetail(r);
              }}
              max={5}
              empty={{
                text: naechste ? tx`Nächste Veranstaltung: ${naechste.fields.titel ?? ''}` : tx('Keine Veranstaltung mit offener Anmeldung.'),
                action: crud.veranstaltungen.canWrite
                  ? { label: tx('Neue Veranstaltung'), onClick: () => crud.veranstaltungen.openCreate({ status: 'entwurf' }) }
                  : undefined,
              }}
            />
          </>
        }
        primary={
          <CalendarWidget
            events={events}
            view={cal.view}
            referenceDate={cal.cursor}
            locale={dateFnsLocale()}
            onViewChange={cal.setView}
            onCursorChange={cal.setCursor}
            onEventClick={ev => {
              const r = veranstaltungen.find(v => v.record_id === ev.id.split(':')[1]);
              if (r) crud.veranstaltungen.openDetail(r);
            }}
            onEmptyClick={
              crud.veranstaltungen.canWrite
                ? date => crud.veranstaltungen.openCreate({ status: 'entwurf', beginn: format(date, "yyyy-MM-dd'T'HH:mm") })
                : undefined
            }
          />
        }
      />
      {crud.surfaces}
    </div>
  );
}
