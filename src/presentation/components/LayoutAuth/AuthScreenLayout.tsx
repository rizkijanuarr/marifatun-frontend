import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AppPaths } from '../../../core/common/AppPaths';

export const AuthScreenLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="canvas canvas--auth">
      <Link to={AppPaths.home} className="brand auth-brand">
        <img src="/assets/marifatun-mark.svg" alt="" className="brand__icon" width={48} height={48} />
        <span className="brand__name">Marifatun</span>
      </Link>
      <div className="auth-layout">
        <div className="auth-form-wrap">{children}</div>
        <div className="auth-photo-wrap" aria-hidden="true">
          <img src="/assets/auth-photo.png" alt="" className="auth-photo" />
        </div>
      </div>
    </div>
  );
};
