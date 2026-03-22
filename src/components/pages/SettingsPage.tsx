// src/components/pages/SettingsPage.tsx

import { useState, useRef } from 'react'
import { Save, RotateCcw, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { useStore } from '../../store/useStore'

const PRESET_COLORS = [
  { name: 'Azul', color: '#3b82f6' },
  { name: 'Rosa', color: '#ec4899' },
  { name: 'Roxo', color: '#8b5cf6' },
  { name: 'Amarelo', color: '#f59e0b' },
  { name: 'Verde', color: '#10b981' },
  { name: 'Preto', color: '#0f172a' },
]

export function SettingsPage() {
  const { settings, updateSettings, resetToInitial, importData } = useStore()
  const [salary, setSalary] = useState(settings.salary.toString())
  const [investPct, setInvestPct] = useState(settings.investPercent.toString())
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const save = () => {
    updateSettings({
      salary: parseFloat(salary) || 0,
      investPercent: Math.min(100, Math.max(0, parseFloat(investPct) || 0)),
    })
  }

  const exportJSON = () => {
    const fullState = useStore.getState()
    const data = {
      settings: fullState.settings,
      cards: fullState.cards,
      fixedBills: fullState.fixedBills,
      pixPeople: fullState.pixPeople,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mae-contas-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string
        importData(json)
        setImportStatus('ok')
        setImportMsg('Dados importados com sucesso!')
      } catch (err: unknown) {
        setImportStatus('error')
        setImportMsg(err instanceof Error ? err.message : 'Erro ao importar')
      }
      // Reset input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <h2 className="text-base font-semibold text-slate-200">Configurações</h2>
   <header>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-slate-500">Personalize o visual e gerencie seus dados.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aparência */}
        <section className="card p-6 flex flex-col gap-6">
          <h3 className="font-bold flex items-center gap-2">🎨 Aparência</h3>
          
          <div>
            <label className="label">Cor de Destaque</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => updateSettings({ accentColor: c.color })}
                  className={`w-10 h-10 rounded-full border-4 transition-transform hover:scale-110 ${
                    settings.accentColor === c.color ? 'border-slate-300' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="label">Modo</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.theme === 'light' ? 'bg-white shadow-sm' : ''}`}
              >
                CLARO
              </button>
              <button 
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.theme === 'dark' ? 'bg-slate-700 text-white' : ''}`}
              >
                ESCURO
              </button>
            </div>
          </div>
        </section>
        </div>
        
      {/* Financeiro */}
      <div className="card p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-300">Financeiro</h3>

        <div>
          <label className="label">Salário mensal (R$)</label>
          <input
            className="input"
            type="number"
            step="100"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>

        <div>
          <label className="label">% para investir do saldo livre</label>
          <div className="flex items-center gap-3">
            <input
              className="input"
              type="range"
              min={0}
              max={100}
              value={investPct}
              onChange={(e) => setInvestPct(e.target.value)}
            />
            <span className="text-sm font-mono text-accent-blue w-12 text-right">
              {investPct}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            O restante ({100 - parseFloat(investPct || '0')}%) vai para lazer.
          </p>
        </div>

        <button className="btn-primary w-fit" onClick={save}>
          <Save size={15} /> Salvar configurações
        </button>
      </div>

      {/* Backup JSON */}
      <div className="card p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-300">Backup de Dados</h3>
        <p className="text-xs text-slate-500">
          Exporte um arquivo <code className="bg-surface-700 px-1 rounded text-xs">.json</code> com
          todos os seus dados para guardar como segurança, e importe de volta quando precisar.
        </p>

        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={exportJSON}>
            <Download size={15} /> Exportar JSON
          </button>

          <button
            className="btn-ghost border border-surface-600 flex items-center gap-2"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={15} /> Importar JSON
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {importStatus !== 'idle' && (
          <div
            className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
              importStatus === 'ok'
                ? 'bg-emerald-950/50 text-emerald-400'
                : 'bg-red-950/50 text-red-400'
            }`}
          >
            {importStatus === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {importMsg}
          </div>
        )}
      </div>

      {/* Zona de perigo */}
      <div className="card p-5 border-red-900/50 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-red-400">Zona de perigo</h3>
        <p className="text-xs text-slate-500">
          Isso vai apagar todos os dados editados e voltar ao estado inicial importado do Excel.
          Considere exportar um backup antes.
        </p>
        <button
          className="btn-danger w-fit flex items-center gap-2"
          onClick={() => {
            if (confirm('Tem certeza? Todos os dados voltarão ao padrão inicial.')) {
              resetToInitial()
            }
          }}
        >
          <RotateCcw size={15} /> Resetar para dados iniciais
        </button>
      </div>
    </div>
  )
}

