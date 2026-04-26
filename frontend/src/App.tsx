import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import CloudBackground from './components/CloudBackground';
import LoginPage from './pages/LoginPage';
import CirclesPage from './pages/CirclesPage';
import CreateCirclePage from './pages/CreateCirclePage';
import JoinCirclePage from './pages/JoinCirclePage';
import MapPage from './pages/MapPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ProfileEditPage from './pages/ProfileEditPage';
import StampPage from './pages/StampPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/circles" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <CloudBackground />
      <Routes>
        {/* ルート: 認証状態によってリダイレクト */}
        <Route
          path="/"
          element={<Navigate to="/circles" replace />}
        />

        {/* 未認証ページ */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* 認証が必要なページ */}
        <Route
          path="/circles"
          element={
            <ProtectedRoute>
              <CirclesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circles/new"
          element={
            <ProtectedRoute>
              <CreateCirclePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circles/join"
          element={
            <ProtectedRoute>
              <JoinCirclePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circles/:circleId"
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circles/:circleId/stamp"
          element={
            <ProtectedRoute>
              <StampPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circles/:circleId/profile/setup"
          element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circles/:circleId/profile/edit"
          element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
