// src/App.tsx
import { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { ThemeProvider } from 'styled-components'
import { LayoutDashboard, CreditCard, Smartphone, Receipt, Settings, Table2, Sun, Moon, Tag } from 'lucide-react'
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
import { CategoryPage } from './components/pages/CategoryPage'
import { SettingsPage } from './components/pages/SettingsPage'

type Page = 'dashboard' | 'overview' | 'cards' | 'pix' | 'fixed' | 'categories' | 'settings'

const NAV: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',   label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
  { id: 'overview',    label: 'Planilha',      icon: <Table2 size={18} /> },
  { id: 'cards',       label: 'Cartões',       icon: <CreditCard size={18} /> },
  { id: 'pix',         label: 'PIX',           icon: <Smartphone size={18} /> },
  { id: 'fixed',       label: 'Contas Fixas',  icon: <Receipt size={18} /> },
  { id: 'categories',  label: 'Categorias',    icon: <Tag size={18} /> },
  { id: 'settings',    label: 'Config',        icon: <Settings size={18} /> },
]

const AppRoot    = styled.div`min-height: 100vh; display: flex; flex-direction: column; background: ${p => p.theme.bg.page};`
const Header     = styled.header`position: sticky; top: 0; z-index: 20; background: ${p => p.theme.bg.card}e0; backdrop-filter: blur(12px); border-bottom: 1px solid ${p => p.theme.border};`
const HeaderInner= styled.div`max-width: 1280px; margin: 0 auto; padding: 0 1rem; height: 3.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;`
const Logo       = styled.div`display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;`
const LogoText   = styled.span`font-weight: 700; font-size: 0.9375rem; color: ${p => p.theme.text.primary}; @media (max-width: 640px) { display: none; }`
const ThemeBtn   = styled.button`display: flex; align-items: center; justify-content: center; padding: 0.4rem; border: none; border-radius: ${p => p.theme.radius.md}; background: ${p => p.theme.bg.subtle}; color: ${p => p.theme.text.muted}; cursor: pointer; flex-shrink: 0; transition: all 0.15s; &:hover { color: ${p => p.theme.text.primary}; background: ${p => p.theme.bg.hover}; }`
const Body       = styled.div`display: flex; flex: 1; max-width: 1280px; width: 100%; margin: 0 auto;`
const Sidebar    = styled.aside`display: none; flex-direction: column; gap: 0.25rem; width: 11rem; flex-shrink: 0; padding: 1rem; border-right: 1px solid ${p => p.theme.border}; @media (min-width: 768px) { display: flex; }`
const NavItem    = styled.button<{ $active: boolean }>`display: flex; align-items: center; gap: 0.625rem; padding: 0.625rem 0.75rem; border: none; border-radius: ${p => p.theme.radius.md}; font-family: ${p => p.theme.font.sans}; font-size: 0.875rem; font-weight: 500; cursor: pointer; text-align: left; transition: all 0.15s; width: 100%; background: ${p => p.$active ? p.theme.accent : 'transparent'}; color: ${p => p.$active ? 'white' : p.theme.text.muted}; &:hover { background: ${p => p.$active ? p.theme.accent : p.theme.bg.hover}; color: ${p => p.$active ? 'white' : p.theme.text.primary}; }`
const Main       = styled.main`flex: 1; padding: 1rem; overflow: auto; @media (min-width: 768px) { padding: 1.5rem; }`
const BottomNav  = styled.nav`display: flex; border-top: 1px solid ${p => p.theme.border}; background: ${p => p.theme.bg.card}f0; backdrop-filter: blur(12px); position: sticky; bottom: 0; z-index: 20; overflow-x: auto; @media (min-width: 768px) { display: none; }`
const BottomItem = styled.button<{ $active: boolean }>`flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; padding: 0.625rem 0.75rem; font-size: 0.55rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border: none; background: transparent; cursor: pointer; font-family: ${p => p.theme.font.sans}; color: ${p => p.$active ? p.theme.accent : p.theme.text.muted}; transition: color 0.15s;`

export default function App() {
  const state = useStore()
  const { settings, updateSettings } = useStore()

  const [page, setPage] = useState<Page>('dashboard')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const isDark = settings.theme === 'dark'
  const theme  = useMemo(() => buildTheme(settings.accentColor || '#3b82f6', isDark), [settings.accentColor, isDark])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accentColor || '#3b82f6')
  }, [settings.accentColor])

  const summaries = useMemo(() => computeSummaries(state), [state])
  const validMonth = summaries.find(m => m.yearMonth === selectedMonth)
    ? selectedMonth : summaries[0]?.yearMonth ?? selectedMonth

  const showMonthBar = ['dashboard', 'overview', 'cards', 'pix', 'fixed', 'categories'].includes(page)

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
            {showMonthBar && <MonthBar months={summaries} selected={validMonth} onSelect={setSelectedMonth} />}
            <ThemeBtn onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })} title={isDark ? 'Tema claro' : 'Tema escuro'}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </ThemeBtn>
          </HeaderInner>
        </Header>

        <Body>
          <Sidebar>
            {NAV.map(item => (
              <NavItem key={item.id} $active={page === item.id} onClick={() => setPage(item.id)}>
                {item.icon}{item.label}
              </NavItem>
            ))}
          </Sidebar>
          <Main>
            {page === 'dashboard'   && <Dashboard selectedMonth={validMonth} summaries={summaries} />}
            {page === 'overview'    && <OverviewTable summaries={summaries} selectedMonth={validMonth} onSelectMonth={setSelectedMonth} />}
            {page === 'cards'       && <CardsPage selectedMonth={validMonth} />}
            {page === 'pix'         && <PixPage selectedMonth={validMonth} />}
            {page === 'fixed'       && <FixedBillsPage selectedMonth={validMonth} />}
            {page === 'categories'  && <CategoryPage selectedMonth={validMonth} />}
            {page === 'settings'    && <SettingsPage />}
          </Main>
        </Body>

        <BottomNav>
          {NAV.map(item => (
            <BottomItem key={item.id} $active={page === item.id} onClick={() => setPage(item.id)}>
              {item.icon}{item.label}
            </BottomItem>
          ))}
        </BottomNav>
      </AppRoot>
    </ThemeProvider>
  )
}
