import { useEffect, useState } from 'react';
import AppShell from './shared/components/layout/AppShell';
import AnalisisFlujo from './features/monitoreo/pages/AnalisisFlujo';
import Dashboard from './features/monitoreo/pages/Dashboard';
import SicatRfid from './features/rfid/pages/SicatRfid';
import Ventas from './features/ventas/pages/Ventas';
import UserProfile from './shared/pages/UserProfile';
import Login from './features/auth/Login';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import AdminPanel from './features/admin/AdminPanel';
import { getSession, logout, onAuthStateChange } from './features/auth/authService';

function getTabFromPath() {
  if (typeof window === 'undefined') return 'flujo';
  if (window.location.pathname.startsWith('/dashboard')) return 'dashboard';
  return 'flujo';
}

function getInterfaceFromPath(allowedPanels) {
  if (typeof window === 'undefined') return allowedPanels[0] ?? 'monitoreo';
  if (window.location.pathname.startsWith('/sicat'))  return 'rfid';
  if (window.location.pathname.startsWith('/ventas')) return 'ventas';
  const fromPath = 'monitoreo';
  return allowedPanels.includes(fromPath) ? fromPath : allowedPanels[0] ?? 'monitoreo';
}

export default function App() {
  const [user,         setUser]         = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);
  const [currentPath,  setCurrentPath]  = useState(() => window.location.pathname);
  const [currentTab,   setCurrentTab]   = useState(getTabFromPath);
  const [currentInterface, setCurrentInterface] = useState('monitoreo');
  const [ventasSection,    setVentasSection]    = useState('tendencias');
  const [ventasFilters,    setVentasFilters]    = useState({ period: '30d', zona: 'all', temporada: 'all' });
  const [showProfile,      setShowProfile]      = useState(false);

  useEffect(() => {
    getSession().then(session => {
      if (session) {
        setUser(session);
        setCurrentInterface(getInterfaceFromPath(session.panels));
      }
      setAuthLoading(false);
    });

    const unsubscribe = onAuthStateChange(session => {
      setUser(session);
      if (session) setCurrentInterface(getInterfaceFromPath(session.panels));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      setCurrentPath(window.location.pathname);
      setCurrentTab(getTabFromPath());
    };
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  const handleLogin = session => {
    setUser(session);
    setCurrentInterface(getInterfaceFromPath(session.panels));
    setCurrentPath('/');
    window.history.pushState({}, '', '/');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowProfile(false);
    setCurrentPath('/');
    window.history.pushState({}, '', '/');
  };

  // Rutas públicas (sin auth)
  if (currentPath === '/forgot-password') return <ForgotPassword />;
  if (currentPath === '/reset-password')  return <ResetPassword />;

  // Carga inicial
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)', fontSize: 13, color: '#6B6B6B' }}>
        Cargando…
      </div>
    );
  }

  if (!user) return <Login onLogin={handleLogin} />;

  const allowedPanels = user.panels ?? [];

  const handleTabChange = tab => {
    setCurrentTab(tab);
    const nextPath = tab === 'dashboard' ? '/dashboard/preregistro' : '/';
    setCurrentPath(nextPath);
    window.history.pushState({}, '', nextPath);
  };

  const handleInterfaceChange = id => {
    if (!allowedPanels.includes(id)) return;
    setCurrentInterface(id);
    if (id === 'rfid')         { setCurrentPath('/sicat');  window.history.pushState({}, '', '/sicat'); }
    else if (id === 'ventas')  { setCurrentPath('/ventas'); window.history.pushState({}, '', '/ventas'); }
    else                       { setCurrentPath('/'); window.history.pushState({}, '', '/'); setCurrentTab('flujo'); }
  };

  // Panel de admin (solo superadmin)
  if (currentPath === '/admin' && user.role === 'superadmin') {
    return <AdminPanel user={user} onBack={() => { setCurrentPath('/'); window.history.pushState({}, '', '/'); }} onLogout={handleLogout} />;
  }

  if (showProfile) {
    return <UserProfile user={user} onBack={() => setShowProfile(false)} onLogout={handleLogout} />;
  }

  if (currentInterface === 'rfid') {
    return <SicatRfid
      onInterfaceChange={handleInterfaceChange}
      onProfileOpen={() => setShowProfile(true)}
      onAdminOpen={() => setCurrentPath('/admin')}
      allowedPanels={allowedPanels}
      user={user}
    />;
  }

  const shellProps = {
    currentTab, onTabChange: handleTabChange,
    currentInterface, onInterfaceChange: handleInterfaceChange,
    ventasSection, onVentasSectionChange: setVentasSection,
    ventasFilters, onVentasFilterChange: setVentasFilters,
    onProfileOpen: () => setShowProfile(true),
    onAdminOpen: () => setCurrentPath('/admin'),
    allowedPanels,
    user,
  };

  if (currentInterface === 'ventas') {
    return <AppShell {...shellProps}><Ventas section={ventasSection} filters={ventasFilters} /></AppShell>;
  }

  const renderPage = () => {
    switch (currentTab) {
      case 'flujo':     return <AnalisisFlujo />;
      case 'dashboard': return <Dashboard />;
      default:          return <AnalisisFlujo />;
    }
  };

  return <AppShell {...shellProps}>{renderPage()}</AppShell>;
}
