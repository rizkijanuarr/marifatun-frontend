import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export const FilterDrawer = ({ open, title, onClose, children, footer }: Props) => {
  return (
    <>
      <div className={`overlay-backdrop ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden={!open} />
      <aside className={`filter-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="filter-drawer__header">
          <h3 className="filter-drawer__title">{title}</h3>
          <button type="button" className="filter-drawer__close" onClick={onClose} aria-label="close">✕</button>
        </div>
        <div className="filter-drawer__body">{children}</div>
        {footer ? <div className="filter-drawer__footer">{footer}</div> : null}
      </aside>
    </>
  );
};
