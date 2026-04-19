import { Link, useNavigate } from 'react-router-dom';
import { AppPaths } from '../../../../../core/common/AppPaths';
import { useToast } from '../../../../components/Toast/useToast';
import { AuthScreenLayout } from '../../../../components/LayoutAuth/AuthScreenLayout';
import { PasswordInput } from '../../../../components/PasswordInput/PasswordInput';
import { useForgotPasswordViewModel } from '../ViewModel/ForgotPasswordViewModel';
import { useI18n } from '../../../../components/i18n/useI18n';

export const ForgotPasswordScreen = () => {
  const { t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const { loading, submit } = useForgotPasswordViewModel();

  return (
    <AuthScreenLayout>
      <form
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get('email') ?? '').trim();
          const newPassword = String(fd.get('new_password') ?? '');

          if (!email) {
            toast.error(t('front-desk.auth-forgot-password.toast.email_required'));
            return;
          }
          if (newPassword.length < 6) {
            toast.info(t('front-desk.auth-forgot-password.toast.password_min'));
            return;
          }

          const res = await submit(email, newPassword);
          if (res.ok) {
            toast.success(res.message);
            navigate(AppPaths.login, { replace: true });
            return;
          }
          toast.error(res.message);
        }}
      >
        <header className="auth-form__head">
          <h1 className="auth-form__title">{t('front-desk.auth-forgot-password.form.title')}</h1>
          <p className="auth-form__subtitle">{t('front-desk.auth-forgot-password.form.subtitle')}</p>
        </header>
        <label className="auth-field">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t('front-desk.auth-forgot-password.form.email_placeholder')}
          />
        </label>
        <PasswordInput
          name="new_password"
          placeholder={t('front-desk.auth-forgot-password.form.new_password_placeholder')}
          ariaLabel={t('front-desk.auth-forgot-password.form.eye_show_label')}
        />
        <button type="submit" className="auth-submit" disabled={loading} aria-busy={loading}>
          {t('front-desk.auth-forgot-password.form.submit')}
        </button>
        <p className="auth-switch">
          <span className="auth-switch__text">
            <span>{t('front-desk.auth-forgot-password.switch.prose')}</span>{' '}
            <Link to={AppPaths.login} className="auth-switch__link">
              {t('front-desk.auth-forgot-password.switch.link')}
            </Link>
          </span>
        </p>
      </form>
    </AuthScreenLayout>
  );
};
