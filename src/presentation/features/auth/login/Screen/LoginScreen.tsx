import { useEffect } from 'react';
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom';
import { AppPaths } from '../../../../../core/common/AppPaths';
import { useToast } from '../../../../components/Toast/useToast';
import { AuthScreenLayout } from '../../../../components/LayoutAuth/AuthScreenLayout';
import { PasswordInput } from '../../../../components/PasswordInput/PasswordInput';
import { useLoginViewModel } from '../ViewModel/LoginViewModel';
import { useI18n } from '../../../../components/i18n/useI18n';

const WELCOME_SESSION_KEY = 'marifatun:welcome-login-toast';
const SKIP_WELCOME_ONCE_KEY = 'marifatun:login_skip_welcome_once';

type LoginLocationState = {
  authFlash?: 'register_ok' | 'reset_ok';
  /** Diset oleh RequireAuth saat akses dashboard tanpa token. */
  from?: Location;
};

export const LoginScreen = () => {
  const { t } = useI18n();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, login } = useLoginViewModel();

  useEffect(() => {
    // if (isMockAuthenticated()) {
    //   navigate(AppPaths.dashboard, { replace: true });
    //   return;
    // }

    const state = location.state as LoginLocationState | null;
    const flash = state?.authFlash;

    if (state?.from) {
      sessionStorage.setItem(SKIP_WELCOME_ONCE_KEY, '1');
    }

    if (flash === 'register_ok') {
      sessionStorage.setItem(SKIP_WELCOME_ONCE_KEY, '1');
      toast.success(t('front-desk.auth-login.toast.after_register'));
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }
    if (flash === 'reset_ok') {
      sessionStorage.setItem(SKIP_WELCOME_ONCE_KEY, '1');
      toast.success(t('front-desk.auth-login.toast.after_reset'));
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    const tid = window.setTimeout(() => {
      if (sessionStorage.getItem(SKIP_WELCOME_ONCE_KEY) === '1') {
        sessionStorage.removeItem(SKIP_WELCOME_ONCE_KEY);
        return;
      }
      if (sessionStorage.getItem(WELCOME_SESSION_KEY) === '1') return;
      sessionStorage.setItem(WELCOME_SESSION_KEY, '1');
      toast.info(t('front-desk.auth-login.toast.welcome'));
    }, 450);
    return () => window.clearTimeout(tid);
  }, [location.pathname, location.state, navigate, t, toast]);

  return (
    <AuthScreenLayout>
      <form
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get('email') ?? '').trim();
          const password = String(fd.get('password') ?? '');
          if (!email) {
            toast.error(t('front-desk.auth-login.toast.email_required'));
            return;
          }
          if (password.length < 6) {
            toast.info(t('front-desk.auth-login.toast.password_min'));
            return;
          }
          const res = await login(email, password);
          if (res.ok) {
            toast.success(res.message);
            const st = location.state as LoginLocationState | null;
            const dest = st?.from;
            navigate(dest ?? AppPaths.dashboard, { replace: true });
            return;
          }
          toast.error(res.message);
        }}
      >
        <header className="auth-form__head">
          <h1 className="auth-form__title">{t('front-desk.auth-login.form.title')}</h1>
          <p className="auth-form__subtitle">{t('front-desk.auth-login.form.subtitle')}</p>
        </header>
        <label className="auth-field">
          <input type="email" name="email" autoComplete="email" placeholder={t('front-desk.auth-login.form.email_placeholder')} />
        </label>
        <PasswordInput name="password" placeholder={t('front-desk.auth-login.form.password_placeholder')} ariaLabel={t('front-desk.auth-login.form.eye_show_label')} />
        <p className="auth-forgot">
          <Link to={AppPaths.forgotPassword} className="auth-forgot__link">
            {t('front-desk.auth-login.form.forgot_link')}
          </Link>
        </p>
        <button type="submit" className="auth-submit" disabled={loading} aria-busy={loading}>
          {t('front-desk.auth-login.form.submit')}
        </button>
        <p className="auth-switch">
          <span className="auth-switch__text">
            <span>{t('front-desk.auth-login.switch.prose')}</span>{' '}
            <Link to={AppPaths.register} className="auth-switch__link">
              {t('front-desk.auth-login.switch.link')}
            </Link>
          </span>
        </p>
      </form>
    </AuthScreenLayout>
  );
};
