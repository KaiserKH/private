import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";
import { useChatStore } from "./store/chat.store";
import { getSocket } from "./socket";
import { AuthLayout } from "./components/AuthLayout";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { RelationshipPage } from "./pages/RelationshipPage";
import { SearchUsersPage } from "./pages/SearchUsersPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

const Protected = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicOnly = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const loadNotifications = useChatStore((state) => state.loadNotifications);
  const loadAdminLogs = useChatStore((state) => state.loadAdminLogs);
  const loadFeatures = useChatStore((state) => state.loadFeatures);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socket.connect();
    loadConversations();
    loadNotifications();
    loadFeatures();
    if (user.isAdmin) loadAdminLogs();

    return () => {
      socket.disconnect();
    };
  }, [user, loadConversations, loadNotifications, loadFeatures, loadAdminLogs]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          </PublicOnly>
        }
      />
      <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />
      <Route
        path="/home"
        element={
          <Protected>
            <AppShell>
              <HomePage />
            </AppShell>
          </Protected>
        }
      />
      <Route path="/profile" element={<Protected><AppShell><ProfilePage /></AppShell></Protected>} />
      <Route path="/settings" element={<Protected><AppShell><SettingsPage /></AppShell></Protected>} />
      <Route path="/relationships" element={<Protected><AppShell><RelationshipPage /></AppShell></Protected>} />
      <Route path="/search" element={<Protected><AppShell><SearchUsersPage /></AppShell></Protected>} />
      <Route path="/notifications" element={<Protected><AppShell><NotificationsPage /></AppShell></Protected>} />
      <Route path="/admin" element={<Protected><AppShell><AdminDashboardPage /></AppShell></Protected>} />
      <Route path="*" element={<Navigate to={user ? "/home" : "/login"} replace />} />
    </Routes>
  );
}
