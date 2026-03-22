import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthSummary } from '@/types'

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
  border-radius: ${p => p.theme.radius.sm***REMOVED***
  background: transparent;
  color: ${p => p.theme.text.muted***REMOVED***
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;

  &:hover:not(:disabled) { background: ${p => p.theme.bg.hover***REMOVED*** color: ${p => p.theme.text.primary***REMOVED*** }
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
  border-radius: ${p => p.theme.radius.sm***REMOVED***
  font-family: ${p => p.theme.font.sans***REMOVED***
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  background: ${p =>
    p.$selected ? p.theme.accent
    : p.$negative ? p.theme.danger + '18'
    : p.theme.bg.subtle***REMOVED***

  color: ${p =>
    p.$selected ? 'white'
    : p.$negative ? p.theme.danger
    : p.theme.text.muted***REMOVED***

  box-shadow: ${p => p.$selected ? `0 2px 8px ${p.theme.accent}44` : 'none'***REMOVED***

  &:hover {
    background: ${p =>
      p.$selected ? p.theme.accent
      : p.$negative ? p.theme.danger + '28'
      : p.theme.bg.hover***REMOVED***
    color: ${p => p.$selected ? 'white' : p.theme.text.primary***REMOVED***
  }
`

export function MonthBar({ months, selected, onSelect }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const idx = months.findIndex(m => m.yearMonth === selected)

  useEffect(() => {
    refs.current[idx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selected, months, idx])

  return (
    <Wrapper>
      <ArrowBtn
        disabled={idx === 0}
        onClick={() => idx > 0 && onSelect(months[idx - 1].yearMonth)}
      >
        <ChevronLeft size={17} />
      </ArrowBtn>

      <Strip>
        {months.map((m, i) => (
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
        disabled={idx === months.length - 1}
        onClick={() => idx < months.length - 1 && onSelect(months[idx + 1].yearMonth)}
      >
        <ChevronRight size={17} />
      </ArrowBtn>
    </Wrapper>
  )
}
