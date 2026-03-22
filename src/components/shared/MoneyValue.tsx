import { MonoText } from '@/styles/ui'
import { brl } from '@/utils/calculations'

interface Props {
  value: number
  colored?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
}

export function MoneyValue({ value, colored = false, className = '', size = 'sm', style }: Props) {
  return (
    <MonoText
      className={className}
      $size={size}
      $positive={colored && value >= 0}
      $negative={colored && value < 0}
      $muted={!colored}
    >
      {brl(value)}
    </MonoText>
  )
}
