import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppPaths } from '../core/common/AppPaths';
import { DocumentTitle } from './DocumentTitle';
import {
  DashboardScreen,
  ForbiddenScreen,
  ForgotPasswordScreen,
  LandingScreen,
  LoginScreen,
  NotFoundScreen,
  RegisterScreen,
  ServerErrorScreen,
  UserScreen,
  ContentScreen,
} from './lazyScreens';
import { ContentTotalBadgeProvider } from '../presentation/features/dashboard/shared/ContentTotalBadgeContext';
import { UserTotalBadgeProvider } from '../presentation/features/dashboard/shared/UserTotalBadgeContext';
import { RequireAuth } from './RequireAuth';
import { RequireAdmin } from './RequireAdmin';

export function AppRouter() {
  return (
    <Suspense fallback={null}>
      <DocumentTitle />
      <Routes>
        <Route path={AppPaths.home} element={<LandingScreen />} />
        <Route path={AppPaths.login} element={<LoginScreen />} />
        <Route path={AppPaths.register} element={<RegisterScreen />} />
        <Route path={AppPaths.forgotPassword} element={<ForgotPasswordScreen />} />
        <Route element={(
          <UserTotalBadgeProvider>
            <ContentTotalBadgeProvider>
              <RequireAuth />
            </ContentTotalBadgeProvider>
          </UserTotalBadgeProvider>
        )}
        >
          <Route path={AppPaths.dashboard} element={<DashboardScreen />} />
          <Route path={AppPaths.content} element={<ContentScreen />} />
          <Route element={<RequireAdmin />}>
            <Route path={AppPaths.user} element={<UserScreen />} />
          </Route>
        </Route>
        <Route path={AppPaths.forbidden} element={<ForbiddenScreen />} />
        <Route path={AppPaths.serverError} element={<ServerErrorScreen />} />
        <Route path="/404" element={<NotFoundScreen />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
