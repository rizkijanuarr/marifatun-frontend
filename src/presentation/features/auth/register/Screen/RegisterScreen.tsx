import { Link, useNavigate } from 'react-router-dom';
import { AppPaths } from '../../../../../core/common/AppPaths';
import { useToast } from '../../../../components/Toast/useToast';
import { AuthScreenLayout } from '../../../../components/LayoutAuth/AuthScreenLayout';
import { PasswordInput } from '../../../../components/PasswordInput/PasswordInput';
import { useRegisterViewModel } from '../ViewModel/RegisterViewModel';
import { useI18n } from '../../../../components/i18n/useI18n';

export const RegisterScreen = () => {
  const { t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const { loading, register } = useRegisterViewModel();

  return (
    <AuthScreenLayout>
      <form
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = String(fd.get('name') ?? '').trim();
          const email = String(fd.get('email') ?? '').trim();
          const password = String(fd.get('password') ?? '');
          const password_confirmation = String(fd.get('password_confirmation') ?? '');

          if (!name) {
            toast.error(t('front-desk.auth-register.toast.name_required'));
            return;
          }
          if (!email) {
            toast.error(t('front-desk.auth-register.toast.email_required'));
            return;
          }
          if (password.length < 6) {
            toast.info(t('front-desk.auth-register.toast.password_min'));
            return;
          }
          if (password !== password_confirmation) {
            toast.error(t('front-desk.auth-register.toast.password_mismatch'));
            return;
          }

          const res = await register({ name, email, password, password_confirmation });
          if (res.ok) {
            toast.success(res.message);
            navigate(AppPaths.dashboard, { replace: true });
            return;
          }
          toast.error(res.message);
        }}
      >
        <header className="auth-form__head">
          <h1 className="auth-form__title">{t('front-desk.auth-register.form.title')}</h1>
          <p className="auth-form__subtitle">{t('front-desk.auth-register.form.subtitle')}</p>
        </header>
        <label className="auth-field">
          <input type="text" name="name" autoComplete="name" placeholder={t('front-desk.auth-register.form.name_placeholder')} />
        </label>
        <label className="auth-field">
          <input type="email" name="email" autoComplete="email" placeholder={t('front-desk.auth-register.form.email_placeholder')} />
        </label>
        <PasswordInput
          name="password"
          placeholder={t('front-desk.auth-register.form.password_placeholder')}
          ariaLabel={t('front-desk.auth-register.form.eye_show_label')}
        />
        <PasswordInput
          name="password_confirmation"
          placeholder={t('front-desk.auth-register.form.password_confirm_placeholder')}
          ariaLabel={t('front-desk.auth-register.form.eye_show_label')}
        />
        <button type="submit" className="auth-submit" disabled={loading} aria-busy={loading}>
          {t('front-desk.auth-register.form.submit')}
        </button>
        <p className="auth-switch">
          <span className="auth-switch__text">
            <span>{t('front-desk.auth-register.switch.prose')}</span>{' '}
            <Link to={AppPaths.login} className="auth-switch__link">
              {t('front-desk.auth-register.switch.link')}
            </Link>
          </span>
        </p>
      </form>
    </AuthScreenLayout>
  );
};
