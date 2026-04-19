import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  BarElement,
  PointElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line, PolarArea, Radar } from 'react-chartjs-2';
import { type ReactNode } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
);

export type ChartPreset =
  | 'line'
  | 'bar'
  | 'doughnut'
  | 'user-growth'
  | 'revenue-monthly'
  | 'plan-doughnut'
  | 'category-radar'
  | 'user-signups'
  | 'user-status'
  | 'user-plan'
  | 'user-retention';

type Props = {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  badge?: ReactNode;
  preset?: ChartPreset;
  labels?: string[];
  values?: number[];
};

export const StatisticChart = ({
  title,
  subtitle,
  icon,
  badge,
  preset = 'line',
  labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values = [10, 14, 13, 18, 16, 19, 21],
}: Props) => {
  const isDonutLike = preset === 'doughnut' || preset === 'plan-doughnut';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: isDonutLike } },
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        borderColor: '#dd3404',
        backgroundColor: 'rgba(221,52,4,0.16)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: 'rgba(221,52,4,0.75)',
        borderRadius: 8,
      },
    ],
  };

  const doughnutPalette = ['#ff7249', '#dd3404', '#b32a03', '#f59e0b', '#ea580c', '#92400e', '#fb923c', '#fdba74'];
  const doughnutValues = values.length ? values : [55, 25, 20];
  const doughnutLabels = labels.length ? labels : ['Explore', 'Maniac', 'Enterprise'];
  const doughnutData = {
    labels: doughnutLabels,
    datasets: [
      {
        label: title,
        data: doughnutValues.length ? doughnutValues : [55, 25, 20],
        backgroundColor: doughnutValues.map((_, i) => doughnutPalette[i % doughnutPalette.length]),
        borderWidth: 0,
      },
    ],
  };

  const radarData = {
    labels: ['Akhlak', 'Sejarah', 'Hadits', 'Quran', 'Motivasi'],
    datasets: [
      {
        label: title,
        data: [88, 75, 69, 81, 73],
        borderColor: '#dd3404',
        backgroundColor: 'rgba(221,52,4,0.2)',
      },
    ],
  };

  const retentionData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    datasets: [
      {
        label: 'Retention',
        data: [82, 84, 86, 88, 87, 90],
        borderColor: '#dd3404',
        backgroundColor: 'rgba(221,52,4,0.18)',
        fill: true,
      },
      {
        label: 'Churn',
        data: [18, 16, 14, 12, 13, 10],
        borderColor: '#b32a03',
        backgroundColor: 'rgba(179,42,3,0.08)',
        fill: true,
      },
    ],
  };

  return (
    <article className="chart-card">
      <div className="chart-card__header">
        <div className="chart-card__title-group">
          <h3 className="chart-card__title">
            {icon}
            {title}
          </h3>
          <span className="chart-card__subtitle">{subtitle}</span>
        </div>
        {badge}
      </div>
      <div className="chart-card__canvas">
        {preset === 'line' || preset === 'user-growth' || preset === 'user-signups' ? (
          <Line data={lineData} options={commonOptions} />
        ) : null}
        {preset === 'bar' || preset === 'revenue-monthly' || preset === 'user-status' ? <Bar data={barData} options={commonOptions} /> : null}
        {preset === 'doughnut' || preset === 'plan-doughnut' ? <Doughnut data={doughnutData} options={commonOptions} /> : null}
        {preset === 'category-radar' ? <Radar data={radarData} options={commonOptions} /> : null}
        {preset === 'user-plan' ? <PolarArea data={doughnutData} options={commonOptions} /> : null}
        {preset === 'user-retention' ? <Line data={retentionData} options={commonOptions} /> : null}
      </div>
    </article>
  );
};
