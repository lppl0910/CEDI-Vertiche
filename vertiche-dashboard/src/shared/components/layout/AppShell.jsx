import TopNav from './TopNav';

export default function AppShell({
  currentTab, onTabChange,
  currentInterface, onInterfaceChange,
  ventasSection, onVentasSectionChange,
  ventasFilters, onVentasFilterChange,
  onProfileOpen,
  children,
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      <TopNav
        currentTab={currentTab}
        onTabChange={onTabChange}
        currentInterface={currentInterface}
        onInterfaceChange={onInterfaceChange}
        ventasSection={ventasSection}
        onVentasSectionChange={onVentasSectionChange}
        ventasFilters={ventasFilters}
        onVentasFilterChange={onVentasFilterChange}
        onProfileOpen={onProfileOpen}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
