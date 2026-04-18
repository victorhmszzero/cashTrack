import { useState , useEffect, useRef } from 'react'

import { ChevronLeft, ChevronRight, History } from 'lucide-react'
import styled from 'styled-components'

import type { MonthSummary } from '@/types'

interface Props {
  months: MonthSummary[]
  selected: string
  onSelect: (ym: string) => void
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`

const ArrowBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border: none;
  border-radius: ${p => p.theme.radius.sm};
  background: transparent;
  color: ${p => p.theme.text.muted};
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;

  &:hover:not(:disabled) { background: ${p => p.theme.bg.hover}; color: ${p => p.theme.text.primary}; }
  &:disabled { opacity: 0.3; cursor: default; }
`

const Strip = styled.div`
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  max-width: 560px;
  padding-bottom: 2px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`

const MonthBtn = styled.button<{ $selected: boolean; $negative: boolean }>`
  flex-shrink: 0;
  padding: 0.3rem 0.75rem;
  border: none;
  border-radius: ${p => p.theme.radius.sm};
  font-family: ${p => p.theme.font.sans};
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  background: ${p =>
    p.$selected ? p.theme.accent
    : p.$negative ? `${p.theme.danger}18`
    : p.theme.bg.subtle};

  color: ${p =>
    p.$selected ? 'white'
    : p.$negative ? p.theme.danger
    : p.theme.text.muted};

  box-shadow: ${p => p.$selected ? `0 2px 8px ${p.theme.accent}44` : 'none'};

  &:hover {
    background: ${p =>
      p.$selected ? p.theme.accent
      : p.$negative ? `${p.theme.danger}28`
      : p.theme.bg.hover};
    color: ${p => p.$selected ? 'white' : p.theme.text.primary};
  }
`

export function MonthBar({ months, selected, onSelect }: Props) {
  const [showPast, setShowPast] = useState(false) // Estado para controlar o histórico
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  
  // Pegamos a data atual para saber o que é "passado"
  const now = new Date()
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Filtramos os meses: se showPast for falso, removemos os meses anteriores ao atual
  // mas mantemos o selecionado caso ele seja um mês antigo
  const visibleMonths = months.filter(m => {
    if (showPast) return true
    return m.yearMonth >= currentYM || m.yearMonth === selected
  })

  const idx = visibleMonths.findIndex(m => m.yearMonth === selected)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (idx !== -1) {
      refs.current[idx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [selected, visibleMonths, idx])

  return (
    <Wrapper>
      {/* Botão de Histórico Sutil */}
      <ArrowBtn 
        onClick={() => setShowPast(!showPast)} 
        title="Mostrar meses anteriores"
        style={{ color: showPast ? 'var(--accent)' : undefined }}
      >
        <History size={16} strokeWidth={showPast ? 3 : 2} />
      </ArrowBtn>

      <ArrowBtn
        disabled={idx <= 0}
        onClick={() => idx > 0 && onSelect(visibleMonths[idx - 1].yearMonth)}
      >
        <ChevronLeft size={17} />
      </ArrowBtn>

      <Strip>
        {visibleMonths.map((m, i) => (
          <MonthBtn
            key={m.yearMonth}
            ref={el => (refs.current[i] = el)}
            $selected={m.yearMonth === selected}
            $negative={m.balance < 0}
            onClick={() => onSelect(m.yearMonth)}
          >
            {m.label}
          </MonthBtn>
        ))}
      </Strip>

      <ArrowBtn
        disabled={idx === visibleMonths.length - 1}
        onClick={() => idx < visibleMonths.length - 1 && onSelect(visibleMonths[idx + 1].yearMonth)}
      >
        <ChevronRight size={17} />
      </ArrowBtn>
    </Wrapper>
  )
}

