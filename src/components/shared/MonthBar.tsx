// src/components/shared/MonthBar.tsx

import { useEffect, useRef } from "react"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthSummary } from '../../types'

interface Props {
  months: MonthSummary[]
  selected: string
  onSelect: (ym: string) => void
}
export function MonthBar({ months, selected, onSelect }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const idx = months.findIndex((m) => m.yearMonth === selected)
  
  useEffect(() => {
    const idx = months.findIndex((m) => m.yearMonth === selected)
    const el = refs.current[idx]

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center", // 👈 centraliza (pode usar "start" também)
        block: "nearest"
      })
    }
  }, [selected, months])


  return (
    <div className="flex items-center gap-2 MonthBar" >
      <button
        className="btn-ghost p-1"
        onClick={() => idx > 0 && onSelect(months[idx - 1].yearMonth)}
        disabled={idx === 0}
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex gap-1 overflow-x-auto max-w-[600px] scrollbar-hide pb-1">
        {months.map((m, i) => {
          const isSelected = m.yearMonth === selected
          const isNegative = m.balance < 0
          return (
            <button
              key={m.yearMonth}
              onClick={() => onSelect(m.yearMonth)}
                            ref={(el) => (refs.current[i] = el)}

              className={`
                flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${isSelected
                  ? 'bg-accent-blue text-white shadow-lg shadow-blue-900/40'
                  : isNegative
                  ? 'bg-red-950/50 text-red-400 hover:bg-red-900/50'
                  : 'bg-surface-700 text-slate-400 hover:bg-surface-600 hover:text-slate-200'}
              `}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      <button
        className="btn-ghost p-1"
        onClick={() => idx < months.length - 1 && onSelect(months[idx + 1].yearMonth)}
        disabled={idx === months.length - 1}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
