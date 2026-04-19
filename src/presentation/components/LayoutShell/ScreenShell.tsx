import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle: string;
  children?: ReactNode;
};

export const ScreenShell = ({ title, subtitle, children }: Props) => {
  return (
    <main style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>{title}</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>{subtitle}</p>
      {children}
    </main>
  );
};
