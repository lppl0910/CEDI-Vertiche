import { useEffect, useState } from 'react';
import AppShell from './shared/components/layout/AppShell';
import AnalisisFlujo from './features/monitoreo/pages/AnalisisFlujo';
import Dashboard from './features/monitoreo/pages/Dashboard';
import SicatRfid from './features/rfid/pages/SicatRfid';
import Ventas from './features/ventas/pages/Ventas';
import UserProfile from './shared/pages/UserProfile';

function getTabFromPath() {
  if (typeof window === 'undefined') return 'flujo';
  if (window.location.pathname.startsWith('/dashboard')) return 'dashboard';
  return 'flujo';
}

function getInterfaceFromPath() {
  if (typeof window === 'undefined') return 'monitoreo';
  if (window.location.pathname.startsWith('/sicat')) return 'rfid';
  if (window.location.pathname.startsWith('/ventas')) return 'ventas';
  return 'monitoreo';
}

export default function App() {
  const [currentTab,       setCurrentTab]       = useState(getTabFromPath);
  const [currentInterface, setCurrentInterface] = useState(getInterfaceFromPath);
  const [ventasSection,    setVentasSection]    = useState('tendencias');
  const [ventasFilters,    setVentasFilters]    = useState({ period: '30d', zona: 'all', temporada: 'all' });
  const [showProfile,      setShowProfile]      = useState(false);

  useEffect(() => {
    const syncTab = () => setCurrentTab(getTabFromPath());
    window.addEventListener('popstate', syncTab);
    return () => window.removeEventListener('popstate', syncTab);
  }, []);

  const handleTabChange = tab => {
    setCurrentTab(tab);
    if (typeof window === 'undefined') return;
    const nextPath = tab === 'dashboard' ? '/dashboard/preregistro' : '/';
    window.history.pushState({}, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleInterfaceChange = id => {
    setCurrentInterface(id);
    if (typeof window === 'undefined') return;
    if (id === 'rfid') {
      window.history.pushState({}, '', '/sicat');
    } else if (id === 'ventas') {
      window.history.pushState({}, '', '/ventas');
    } else {
      window.history.pushState({}, '', '/');
      setCurrentTab('flujo');
    }
  };

  if (showProfile) {
    return <UserProfile onBack={() => setShowProfile(false)} />;
  }

  if (currentInterface === 'rfid') {
    return <SicatRfid onInterfaceChange={handleInterfaceChange} onProfileOpen={() => setShowProfile(true)} />;
  }

  if (currentInterface === 'ventas') {
    return (
      <AppShell
        currentTab={currentTab}
        onTabChange={handleTabChange}
        currentInterface={currentInterface}
        onInterfaceChange={handleInterfaceChange}
        ventasSection={ventasSection}
        onVentasSectionChange={setVentasSection}
        ventasFilters={ventasFilters}
        onVentasFilterChange={setVentasFilters}
        onProfileOpen={() => setShowProfile(true)}
      >
        <Ventas section={ventasSection} filters={ventasFilters} />
      </AppShell>
    );
  }

  const renderPage = () => {
    switch (currentTab) {
      case 'flujo':     return <AnalisisFlujo />;
      case 'dashboard': return <Dashboard />;
      default:          return <AnalisisFlujo />;
    }
  };

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={handleTabChange}
      currentInterface={currentInterface}
      onInterfaceChange={handleInterfaceChange}
      ventasSection={ventasSection}
      onVentasSectionChange={setVentasSection}
      ventasFilters={ventasFilters}
      onVentasFilterChange={setVentasFilters}
      onProfileOpen={() => setShowProfile(true)}
    >
      {renderPage()}
    </AppShell>
  );
}
