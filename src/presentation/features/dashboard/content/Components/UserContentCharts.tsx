import { StatisticChart } from '../../../../components/StatisticChart/StatisticChart';
import { overviewChartIcons } from '../../shared/dashboardIcons';
import { useI18n } from '../../../../components/i18n/useI18n';
import { TONE_VALUES, VIDEO_PLATFORMS } from '../Model/ContentModel';
import type { UserContentChartStatistics } from '../Response/ContentResponse';

type Props = {
  stats: UserContentChartStatistics;
};

const LABEL_CONTENT_TYPE: Record<string, string> = {
  linkedin: 'LinkedIn',
  x: 'X',
  thread: 'Threads',
  facebook: 'Facebook',
  email_marketing: 'Email Marketing',
  video_script: 'Video script',
};

function labelContentType(key: string): string {
  return LABEL_CONTENT_TYPE[key] ?? key;
}

const isKnownTone = (tone: string): tone is (typeof TONE_VALUES)[number] =>
  (TONE_VALUES as readonly string[]).includes(tone);

const isKnownVideoPlatform = (p: string): p is (typeof VIDEO_PLATFORMS)[number] =>
  (VIDEO_PLATFORMS as readonly string[]).includes(p);

export function UserContentCharts({ stats }: Props) {
  const { t } = useI18n();

  const toneLabel = (tone: string): string => {
    if (tone === 'unknown') return t('back-desk.feature-content.charts.tone_unknown');
    if (isKnownTone(tone)) return t(`back-desk.feature-content.enum.tone.${tone}`);
    return tone;
  };

  const platformLabel = (platform: string): string => {
    if (platform === 'unknown') return t('back-desk.feature-content.charts.platform_unknown');
    if (isKnownVideoPlatform(platform)) return t(`back-desk.feature-content.form.video_platform_${platform}`);
    return platform;
  };

  const typeLabels = (stats.content_by_type ?? []).map((r) => labelContentType(r.content_type));
  const typeValues = (stats.content_by_type ?? []).map((r) => r.total);

  const toneLabels = (stats.content_by_tone ?? []).map((r) => toneLabel(r.tone));
  const toneValues = (stats.content_by_tone ?? []).map((r) => r.total);

  const monthLabels = (stats.created_by_month ?? []).map((r) => r.label);
  const monthValues = (stats.created_by_month ?? []).map((r) => r.total);

  const platformRows = stats.content_by_video_platform ?? [];
  const platformLabels = platformRows.map((r) => platformLabel(r.platform));
  const platformValues = platformRows.map((r) => r.total);
  const badgeVideoScripts = platformValues.reduce((a, b) => a + b, 0);

  const badgeTotal = typeValues.reduce((a, b) => a + b, 0);

  return (
    <section className="charts-grid content-user-charts" aria-label={t('back-desk.feature-content.charts.section_aria')}>
      <StatisticChart
        title={t('back-desk.feature-content.charts.by_type_title')}
        subtitle={t('back-desk.feature-content.charts.by_type_subtitle')}
        icon={overviewChartIcons['plan-doughnut']}
        preset="plan-doughnut"
        labels={typeLabels.length ? typeLabels : ['—']}
        values={typeValues.length ? typeValues : [0]}
        badge={
          <span className="badge badge--primary">{badgeTotal}</span>
        }
      />
      <StatisticChart
        title={t('back-desk.feature-content.charts.by_tone_title')}
        subtitle={t('back-desk.feature-content.charts.by_tone_subtitle')}
        icon={overviewChartIcons['revenue-monthly']}
        preset="revenue-monthly"
        labels={toneLabels.length ? toneLabels : ['—']}
        values={toneValues.length ? toneValues : [0]}
      />
      <StatisticChart
        title={t('back-desk.feature-content.charts.by_month_title')}
        subtitle={t('back-desk.feature-content.charts.by_month_subtitle')}
        icon={overviewChartIcons['user-growth']}
        preset="user-growth"
        labels={monthLabels.length ? monthLabels : ['—']}
        values={monthValues.length ? monthValues : [0]}
      />
      <StatisticChart
        title={t('back-desk.feature-content.charts.by_video_platform_title')}
        subtitle={t('back-desk.feature-content.charts.by_video_platform_subtitle')}
        icon={overviewChartIcons['plan-doughnut']}
        preset="plan-doughnut"
        labels={platformLabels.length ? platformLabels : ['—']}
        values={platformValues.length ? platformValues : [0]}
        badge={<span className="badge badge--muted">{badgeVideoScripts}</span>}
      />
    </section>
  );
}
