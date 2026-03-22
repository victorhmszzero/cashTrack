// src/App.tsx

import { useState, useMemo, useEffect } from 'react'
import {
  LayoutDashboard,
  CreditCard,
  Smartphone,
  Receipt,
  Settings,
  Table2,
  Sun,
  Moon,
} from 'lucide-react'
import { useStore } from './store/useStore'
import { computeSummaries } from './utils/calculations'
import { MonthBar } from './components/shared/MonthBar'
import { Dashboard } from './components/pages/Dashboard'
import { CardsPage } from './components/pages/CardsPage'
import { PixPage } from './components/pages/PixPage'
import { FixedBillsPage } from './components/pages/FixedBillsPage'
import { OverviewTable } from './components/pages/OverviewTable'
import { SettingsPage } from './components/pages/SettingsPage'

type Page = 'dashboard' | 'overview' | 'cards' | 'pix' | 'fixed' | 'settings'

const NAV: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'overview', label: 'Planilha', icon: <Table2 size={18} /> },
  { id: 'cards', label: 'Cartões', icon: <CreditCard size={18} /> },
  { id: 'pix', label: 'PIX', icon: <Smartphone size={18} /> },
  { id: 'fixed', label: 'Contas Fixas', icon: <Receipt size={18} /> },
  { id: 'settings', label: 'Config', icon: <Settings size={18} /> },
]

export default function App() {
  const state = useStore()
  const { settings, updateSettings } = useStore() // Pegar do Zustand
  const [page, setPage] = useState<Page>('dashboard')
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const isLight = settings.theme === 'light'
  
  const toggleTheme = () => {
    updateSettings({ theme: isLight ? 'dark' : 'light' })
  }

  // Sincroniza o Tema e a Cor de Destaque
  useEffect(() => {
    const root = document.documentElement;
    
    // CORREÇÃO AQUI: Adiciona a classe 'dark' se o tema for dark
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Aplica a cor de destaque escolhida
    root.style.setProperty('--accent', settings.accentColor || '#3b82f6');
    // Cria uma versão transparente para fundos e hover
    root.style.setProperty('--accent-soft', (settings.accentColor || '#3b82f6') + '20');
  }, [settings.theme, settings.accentColor])

  const summaries = useMemo(() => computeSummaries(state), [state])


  // Validate selectedMonth is in summaries
  const validSelectedMonth = summaries.find((m) => m.yearMonth === selectedMonth)
    ? selectedMonth
    : summaries[0]?.yearMonth ?? selectedMonth

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-surface-600 sticky top-0 z-20 bg-surface-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg">💰</span>
            <span className="font-semibold text-slate-100 hidden sm:block">Contas</span>
          </div>

          {/* Month selector — only on relevant pages */}
          {['dashboard', 'overview', 'cards', 'pix', 'fixed'].includes(page) && (
            <MonthBar
              months={summaries}
              selected={validSelectedMonth}
              onSelect={setSelectedMonth}
            />
          )}

    <button
      onClick={toggleTheme}
      className="btn-ghost p-2 flex-shrink-0"
      title={isLight ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
    >
      {isLight ? <Moon size={17} /> : <Sun size={17} />}
    </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-1 w-48 flex-shrink-0 p-4 border-r border-surface-600">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                ${page === item.id
                  ? 'bg-accent-blue text-white'
                  : 'text-slate-400 hover:bg-surface-700 hover:text-slate-200'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {page === 'dashboard' && (
            <Dashboard selectedMonth={validSelectedMonth} summaries={summaries} />
          )}
          {page === 'overview' && (
            <OverviewTable
              summaries={summaries}
              selectedMonth={validSelectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          )}
          {page === 'cards' && <CardsPage selectedMonth={validSelectedMonth} />}
          {page === 'pix' && <PixPage selectedMonth={validSelectedMonth} />}
          {page === 'fixed' && <FixedBillsPage selectedMonth={validSelectedMonth} />}
          {page === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="md:hidden border-t border-surface-600 bg-surface-900/90 backdrop-blur-md sticky bottom-0 z-20">
        <div className="flex justify-around">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-3 text-[10px] font-medium transition-colors
                ${page === item.id ? 'text-accent-blue' : 'text-slate-500'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
