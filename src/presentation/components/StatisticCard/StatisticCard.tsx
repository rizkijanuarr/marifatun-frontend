import type { ReactNode } from 'react';

type StatisticCardProps = {
  title: string;
  value: string;
  icon?: ReactNode;
  meta?: ReactNode;
  extra?: ReactNode;
};

export const StatisticCard = ({ title, value, icon, meta, extra }: StatisticCardProps) => {
  return (
    <article className="card">
      <div className="card__head">
        <div>
          <div className="card__title">{title}</div>
          <div className="card__value">{value}</div>
        </div>
        {icon ? <span className="card__icon">{icon}</span> : null}
      </div>
      {extra}
      {meta ? <div className="card__meta">{meta}</div> : null}
    </article>
  );
};
