import { lazy } from 'react';

export const LandingScreen = lazy(() =>
  import('../presentation/features/landing/Screen/LandingScreen').then((m) => ({ default: m.LandingScreen })),
);

export const LoginScreen = lazy(() =>
  import('../presentation/features/auth/login/Screen/LoginScreen').then((m) => ({ default: m.LoginScreen })),
);

export const RegisterScreen = lazy(() =>
  import('../presentation/features/auth/register/Screen/RegisterScreen').then((m) => ({ default: m.RegisterScreen })),
);

export const ForgotPasswordScreen = lazy(() =>
  import('../presentation/features/auth/forgot-password/Screen/ForgotPasswordScreen').then((m) => ({
    default: m.ForgotPasswordScreen,
  })),
);

export const DashboardScreen = lazy(() =>
  import('../presentation/features/dashboard/dashboard/Screen/DashboardScreen').then((m) => ({
    default: m.DashboardScreen,
  })),
);

export const UserScreen = lazy(() =>
  import('../presentation/features/dashboard/user/Screen/UserScreen').then((m) => ({ default: m.UserManagementScreen })),
);

export const ContentScreen = lazy(() =>
  import('../presentation/features/dashboard/content/Screen/ContentScreen').then((m) => ({ default: m.ContentManagementScreen })),
);

export const ForbiddenScreen = lazy(() =>
  import('../presentation/features/error/ForbiddenScreen').then((m) => ({ default: m.ForbiddenScreen })),
);

export const NotFoundScreen = lazy(() =>
  import('../presentation/features/error/NotFoundScreen').then((m) => ({ default: m.NotFoundScreen })),
);

export const ServerErrorScreen = lazy(() =>
  import('../presentation/features/error/ServerErrorScreen').then((m) => ({ default: m.ServerErrorScreen })),
);
