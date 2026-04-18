// src\App.tsx
import { useState, useMemo, useEffect } from 'react'

import { LayoutDashboard, CreditCard, Smartphone, Receipt, Settings, Table2, Sun, Moon, Tag } from 'lucide-react'

import { ThemeProvider } from 'styled-components'

import { MonthBar } from './components/shared/MonthBar'
import { Dashboard } from './components/pages/Dashboard'
import { CardsPage } from './components/pages/CardsPage'
import { PixPage } from './components/pages/PixPage'
import { FixedBillsPage } from './components/pages/FixedBillsPage'
import { OverviewTable } from './components/pages/OverviewTable'
import { CategoryPage } from './components/pages/CategoryPage'
import { SettingsPage } from './components/pages/SettingsPage'

import { buildTheme } from './styles/theme'
import { GlobalStyles } from './styles/GlobalStyles'

import { useStore } from './store/useStore'

import { computeSummaries } from './utils/calculations'

import * as S from './App.styled'
//                                                                                                                             //

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
      <S.AppRoot>
        <S.Header>
          <S.HeaderInner>
            <S.Logo>
              <span style={{ fontSize: '1.125rem' }}>💰</span>
              <S.LogoText>Contas</S.LogoText>
            </S.Logo>
            {showMonthBar && <MonthBar months={summaries} selected={validMonth} onSelect={setSelectedMonth} />}
            <S.ThemeBtn onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })} title={isDark ? 'Tema claro' : 'Tema escuro'}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </S.ThemeBtn>
          </S.HeaderInner>
        </S.Header>

        <S.Body>
          <S.Sidebar>
            {NAV.map(item => (
              <S.NavItem key={item.id} $active={page === item.id} onClick={() => setPage(item.id)}>
                {item.icon}{item.label}
              </S.NavItem>
            ))}
          </S.Sidebar>
          <S.Main>
            {page === 'dashboard'   && <Dashboard selectedMonth={validMonth} summaries={summaries} />}
            {page === 'overview'    && <OverviewTable summaries={summaries} selectedMonth={validMonth} onSelectMonth={setSelectedMonth} />}
            {page === 'cards'       && <CardsPage selectedMonth={validMonth} />}
            {page === 'pix'         && <PixPage selectedMonth={validMonth} />}
            {page === 'fixed'       && <FixedBillsPage selectedMonth={validMonth} />}
            {page === 'categories'  && <CategoryPage selectedMonth={validMonth} />}
            {page === 'settings'    && <SettingsPage />}
          </S.Main>
        </S.Body>

        <S.BottomNav>
          {NAV.map(item => (
            <S.BottomItem key={item.id} $active={page === item.id} onClick={() => setPage(item.id)}>
              {item.icon}{item.label}
            </S.BottomItem>
          ))}
        </S.BottomNav>
      </S.AppRoot>
    </ThemeProvider>
  )
}
