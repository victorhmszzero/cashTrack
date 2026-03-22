import { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { ThemeProvider } from 'styled-components'
import {
  LayoutDashboard, CreditCard, Smartphone,
  Receipt, Settings, Table2, Sun, Moon,
} from 'lucide-react'

import { useStore } from './store/useStore'
import { computeSummaries } from './utils/calculations'
import { buildTheme } from './styles/theme'
import { GlobalStyles } from './styles/GlobalStyles'
import { MonthBar } from './components/shared/MonthBar'
import { Dashboard } from './components/pages/Dashboard'
import { CardsPage } from './components/pages/CardsPage'
import { PixPage } from './components/pages/PixPage'
import { FixedBillsPage } from './components/pages/FixedBillsPage'
import { OverviewTable } from './components/pages/OverviewTable'
import { SettingsPage } from './components/pages/SettingsPage'

type Page = 'dashboard' | 'overview' | 'cards' | 'pix' | 'fixed' | 'settings'

const NAV: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
  { id: 'overview',  label: 'Planilha',     icon: <Table2 size={18} /> },
  { id: 'cards',     label: 'Cartões',      icon: <CreditCard size={18} /> },
  { id: 'pix',       label: 'PIX',          icon: <Smartphone size={18} /> },
  { id: 'fixed',     label: 'Contas Fixas', icon: <Receipt size={18} /> },
  { id: 'settings',  label: 'Config',       icon: <Settings size={18} /> },
]

// ─── Styled layout components ─────────────────────────────────────────────────

const AppRoot = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${p => p.theme.bg.page***REMOVED***
`

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: ${p => p.theme.bg.card}e0;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${p => p.theme.border***REMOVED***
`

const HeaderInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`

const LogoText = styled.span`
  font-weight: 700;
  font-size: 0.9375rem;
  color: ${p => p.theme.text.primary***REMOVED***
  @media (max-width: 640px) { display: none; }
`

const ThemeBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  border: none;
  border-radius: ${p => p.theme.radius.md***REMOVED***
  background: ${p => p.theme.bg.subtle***REMOVED***
  color: ${p => p.theme.text.muted***REMOVED***
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
  &:hover { color: ${p => p.theme.text.primary***REMOVED*** background: ${p => p.theme.bg.hover***REMOVED*** }
`

const Body = styled.div`
  display: flex;
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
`

const Sidebar = styled.aside`
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  width: 11rem;
  flex-shrink: 0;
  padding: 1rem;
  border-right: 1px solid ${p => p.theme.border***REMOVED***

  @media (min-width: 768px) { display: flex; }
`

const NavItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: ${p => p.theme.radius.md***REMOVED***
  font-family: ${p => p.theme.font.sans***REMOVED***
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  width: 100%;

  background: ${p => p.$active ? p.theme.accent : 'transparent'***REMOVED***
  color: ${p => p.$active ? 'white' : p.theme.text.muted***REMOVED***

  &:hover {
    background: ${p => p.$active ? p.theme.accent : p.theme.bg.hover***REMOVED***
    color: ${p => p.$active ? 'white' : p.theme.text.primary***REMOVED***
  }
`

const Main = styled.main`
  flex: 1;
  padding: 1rem;
  overflow: auto;

  @media (min-width: 768px) { padding: 1.5rem; }
`

const BottomNav = styled.nav`
  display: flex;
  border-top: 1px solid ${p => p.theme.border***REMOVED***
  background: ${p => p.theme.bg.card}f0;
  backdrop-filter: blur(12px);
  position: sticky;
  bottom: 0;
  z-index: 20;

  @media (min-width: 768px) { display: none; }
`

const BottomNavItem = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.75rem 0.5rem;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: ${p => p.theme.font.sans***REMOVED***
  color: ${p => p.$active ? p.theme.accent : p.theme.text.muted***REMOVED***
  transition: color 0.15s;
`

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const state = useStore()
  const { settings, updateSettings } = useStore()

  const [page, setPage] = useState<Page>('dashboard')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const isDark = settings.theme === 'dark'
  const theme = useMemo(
    () => buildTheme(settings.accentColor || '#3b82f6', isDark),
    [settings.accentColor, isDark]
  )

  const toggleTheme = () =>
    updateSettings({ theme: isDark ? 'light' : 'dark' })

  const summaries = useMemo(() => computeSummaries(state), [state])
  const validSelectedMonth = summaries.find(m => m.yearMonth === selectedMonth)
    ? selectedMonth
    : summaries[0]?.yearMonth ?? selectedMonth

  // Keep useEffect for any legacy code that might read CSS vars
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accentColor || '#3b82f6')
  }, [settings.accentColor])

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppRoot>
        <Header>
          <HeaderInner>
            <Logo>
              <span style={{ fontSize: '1.125rem' }}>💰</span>
              <LogoText>Contas</LogoText>
            </Logo>

            {['dashboard', 'overview', 'cards', 'pix', 'fixed'].includes(page) && (
              <MonthBar
                months={summaries}
                selected={validSelectedMonth}
                onSelect={setSelectedMonth}
              />
            )}

            <ThemeBtn onClick={toggleTheme} title={isDark ? 'Tema claro' : 'Tema escuro'}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </ThemeBtn>
          </HeaderInner>
        </Header>

        <Body>
          <Sidebar>
            {NAV.map(item => (
              <NavItem
                key={item.id}
                $active={page === item.id}
                onClick={() => setPage(item.id)}
              >
                {item.icon}
                {item.label}
              </NavItem>
            ))}
          </Sidebar>

          <Main>
            {page === 'dashboard' && <Dashboard selectedMonth={validSelectedMonth} summaries={summaries} />}
            {page === 'overview'  && <OverviewTable summaries={summaries} selectedMonth={validSelectedMonth} onSelectMonth={setSelectedMonth} />}
            {page === 'cards'     && <CardsPage selectedMonth={validSelectedMonth} />}
            {page === 'pix'       && <PixPage selectedMonth={validSelectedMonth} />}
            {page === 'fixed'     && <FixedBillsPage selectedMonth={validSelectedMonth} />}
            {page === 'settings'  && <SettingsPage />}
          </Main>
        </Body>

        <BottomNav>
          {NAV.map(item => (
            <BottomNavItem key={item.id} $active={page === item.id} onClick={() => setPage(item.id)}>
              {item.icon}
              {item.label}
            </BottomNavItem>
          ))}
        </BottomNav>
      </AppRoot>
    </ThemeProvider>
  )
}
