// src/components/shared/MoneyValue.tsx

import { brl } from '../../utils/calculations'

interface Props {
  value: number
  /** Se true, positivo = verde e negativo = vermelho */
  colored?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MoneyValue({ value, colored = false, className = '', size = 'sm' }: Props) {
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-base' : 'text-sm'

  let colorClass = 'text-slate-300'
  if (colored) {
    colorClass = value >= 0 ? 'text-emerald-400' : 'text-red-400'
  }

  return (
    <span className={`font-mono font-medium ${sizeClass} ${colorClass} ${className}`}>
      {brl(value)}
    </span>
  )
}
