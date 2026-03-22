import { useState, useRef } from 'react'
import { Save, RotateCcw, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import {
  Card, CardBody, Flex, Grid, PageTitle, SectionTitle, Muted,
  PrimaryButton, GhostButton, DangerButton,
  FormRow, Label, Input, Alert, ColorSwatch, Divider,
  ThemeToggle, ThemeToggleOption,
} from '@/styles/ui'
import styled from 'styled-components'

const PRESET_COLORS = [
  { name: 'Azul',     color: '#3b82f6' },
  { name: 'Rosa',     color: '#ec4899' },
  { name: 'Roxo',     color: '#8b5cf6' },
  { name: 'Verde',    color: '#10b981' },
  { name: 'Amarelo',  color: '#f59e0b' },
  { name: 'Laranja',  color: '#f97316' },
  { name: 'Ciano',    color: '#06b6d4' },
  { name: 'Índigo',   color: '#6366f1' },
  { name: 'Preto',    color: '#0f172a' },
]

const DangerZone = styled(Card)`
  border-color: ${p => p.theme.danger}44;
`

const CustomColorLabel = styled.label`
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 2px dashed ${p => p.theme.border***REMOVED***
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  color: ${p => p.theme.text.muted***REMOVED***
  flex-shrink: 0;
  transition: border-color 0.15s;
  &:hover { border-color: ${p => p.theme.accent***REMOVED*** }
`

const CodeChip = styled.code`
  background: ${p => p.theme.bg.subtle***REMOVED***
  border: 1px solid ${p => p.theme.border***REMOVED***
  border-radius: 4px;
  padding: 0.1rem 0.4rem;
  font-size: 0.75rem;
  font-family: ${p => p.theme.font.mono***REMOVED***
`

export function SettingsPage() {
  const { settings, updateSettings, resetToInitial, importData } = useStore()
  const [salary, setSalary] = useState(settings.salary.toString())
  const [investPct, setInvestPct] = useState(settings.investPercent.toString())
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const currentAccent = settings.accentColor || '#3b82f6'

  const save = () => {
    updateSettings({
      salary: parseFloat(salary) || 0,
      investPercent: Math.min(100, Math.max(0, parseFloat(investPct) || 0)),
    })
  }

  const exportJSON = () => {
    const { settings: s, cards, fixedBills, pixPeople } = useStore.getState()
    const blob = new Blob([JSON.stringify({ settings: s, cards, fixedBills, pixPeople }, null, 2)], { type: 'application/json' })
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
    reader.onload = ev => {
      try {
        importData(ev.target?.result as string)
        setImportStatus('ok'); setImportMsg('Dados importados com sucesso!')
      } catch (err: unknown) {
        setImportStatus('error'); setImportMsg(err instanceof Error ? err.message : 'Erro ao importar')
      }
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <Flex $col $gap={5} style={{ maxWidth: '36rem' }}>
      <div>
        <PageTitle>Configurações</PageTitle>
        <Muted>Personalize o visual e gerencie seus dados.</Muted>
      </div>

      {/* Aparência */}
      <Card>
        <CardBody>
          <SectionTitle style={{ marginBottom: '1.25rem' }}>🎨 Aparência</SectionTitle>

          <Flex $col $gap={5}>
            {/* Tema */}
            <FormRow>
              <Label>Modo</Label>
              <ThemeToggle $dark={settings.theme === 'dark'}>
                <ThemeToggleOption $active={settings.theme === 'light'} onClick={() => updateSettings({ theme: 'light' })}>
                  ☀️ Claro
                </ThemeToggleOption>
                <ThemeToggleOption $active={settings.theme === 'dark'} onClick={() => updateSettings({ theme: 'dark' })}>
                  🌙 Escuro
                </ThemeToggleOption>
              </ThemeToggle>
            </FormRow>

            <Divider />

            {/* Cor de destaque */}
            <FormRow>
              <Label>Cor de destaque</Label>
              <Flex $gap={2} $wrap style={{ marginTop: '0.4rem' }}>
                {PRESET_COLORS.map(c => (
                  <ColorSwatch
                    key={c.color}
                    $color={c.color}
                    $active={currentAccent === c.color}
                    title={c.name}
                    onClick={() => updateSettings({ accentColor: c.color })}
                  />
                ))}
                <CustomColorLabel title="Cor personalizada">
                  <span>＋</span>
                  <input
                    type="color"
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    value={currentAccent}
                    onChange={e => updateSettings({ accentColor: e.target.value })}
                  />
                </CustomColorLabel>
              </Flex>
              {/* Preview */}
              <Flex $align="center" $gap={3} style={{ marginTop: '0.75rem' }}>
                <PrimaryButton style={{ pointerEvents: 'none', fontSize: '0.75rem', padding: '0.35rem 0.875rem' }}>
                  Exemplo
                </PrimaryButton>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: currentAccent }}>
                  Texto destacado
                </span>
              </Flex>
            </FormRow>
          </Flex>
        </CardBody>
      </Card>

      {/* Financeiro */}
      <Card>
        <CardBody>
          <SectionTitle style={{ marginBottom: '1.25rem' }}>💰 Financeiro</SectionTitle>
          <Flex $col $gap={4}>
            <FormRow>
              <Label>Salário mensal (R$)</Label>
              <Input type="number" step="100" value={salary} onChange={e => setSalary(e.target.value)} />
            </FormRow>

            <FormRow>
              <Label>% do saldo livre para investir</Label>
              <Flex $align="center" $gap={3}>
                <Input
                  type="range" min={0} max={100}
                  value={investPct}
                  onChange={e => setInvestPct(e.target.value)}
                  style={{ padding: '0.25rem 0' }}
                />
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: currentAccent, minWidth: '2.5rem', textAlign: 'right' }}>
                  {investPct}%
                </span>
              </Flex>
              <Muted $size="xs">O restante ({100 - parseFloat(investPct || '0')}%) vai para lazer.</Muted>
            </FormRow>

            <PrimaryButton style={{ width: 'fit-content' }} onClick={save}>
              <Save size={15} /> Salvar configurações
            </PrimaryButton>
          </Flex>
        </CardBody>
      </Card>

      {/* Backup */}
      <Card>
        <CardBody>
          <SectionTitle style={{ marginBottom: '0.5rem' }}>💾 Backup de Dados</SectionTitle>
          <Muted style={{ display: 'block', marginBottom: '1rem' }}>
            Exporte um arquivo <CodeChip>.json</CodeChip> com todos os seus dados para segurança. Importe de volta quando precisar.
          </Muted>

          <Flex $gap={3} $wrap>
            <PrimaryButton onClick={exportJSON}>
              <Download size={15} /> Exportar JSON
            </PrimaryButton>
            <GhostButton onClick={() => fileRef.current?.click()} style={{ border: '1px solid' }}>
              <Upload size={15} /> Importar JSON
            </GhostButton>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </Flex>

          {importStatus !== 'idle' && (
            <Alert $variant={importStatus === 'ok' ? 'success' : 'error'} style={{ marginTop: '0.75rem' }}>
              {importStatus === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {importMsg}
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* Danger zone */}
      <DangerZone>
        <CardBody>
          <SectionTitle style={{ marginBottom: '0.5rem', color: '#ef4444' }}>⚠️ Zona de Perigo</SectionTitle>
          <Muted style={{ display: 'block', marginBottom: '1rem' }}>
            Apaga todos os dados editados e volta ao estado inicial do Excel. Exporte um backup antes.
          </Muted>
          <DangerButton onClick={() => {
            if (confirm('Tem certeza? Todos os dados voltarão ao padrão inicial.')) resetToInitial()
          }}>
            <RotateCcw size={15} /> Resetar para dados iniciais
          </DangerButton>
        </CardBody>
      </DangerZone>
    </Flex>
  )
}
