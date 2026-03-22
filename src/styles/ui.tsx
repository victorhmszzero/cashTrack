/**
 * ui.tsx — Biblioteca de componentes reutilizáveis
 *
 * Importe o que precisar:
 *   import { Card, PrimaryButton, Input, Flex, Table, Th, Td, Tr } from '@/styles/ui'
 */

import styled, { css } from 'styled-components'

// ─── Layout ──────────────────────────────────────────────────────────────────

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const Flex = styled.div<{
  $gap?: number       // em rem * 0.25  (ex: $gap={4} = 1rem)
  $align?: string
  $justify?: string
  $wrap?: boolean
  $col?: boolean
  $shrink0?: boolean
}>`
  display: flex;
  flex-direction: ${p => p.$col ? 'column' : 'row'};
  gap: ${p => p.$gap !== undefined ? `${p.$gap * 0.25}rem` : '0'};
  align-items: ${p => p.$align || 'stretch'};
  justify-content: ${p => p.$justify || 'flex-start'};
  flex-wrap: ${p => p.$wrap ? 'wrap' : 'nowrap'};
  flex-shrink: ${p => p.$shrink0 ? '0' : '1'};
`

export const Grid = styled.div<{
  $cols?: number
  $mdCols?: number
  $gap?: number
}>`
  display: grid;
  gap: ${p => (p.$gap ?? 4) * 0.25}rem;
  grid-template-columns: repeat(${p => p.$cols ?? 1}, 1fr);

  @media (min-width: 768px) {
    grid-template-columns: repeat(${p => p.$mdCols ?? p.$cols ?? 1}, 1fr);
  }
`

export const Divider = styled.div<{ $vertical?: boolean }>`
  ${p =>
    p.$vertical
      ? css`width: 1px; align-self: stretch; background: ${p.theme.border}; flex-shrink: 0;`
      : css`height: 1px; width: 100%; background: ${p.theme.border};`}
`

// ─── Card ─────────────────────────────────────────────────────────────────────

export const Card = styled.div`
  background: ${p => p.theme.bg.card};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius.lg};
  box-shadow: ${p => p.theme.shadow};
  overflow: hidden;
`

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${p => p.theme.border};
`

export const CardBody = styled.div<{ $p?: number }>`
  padding: ${p => (p.$p ?? 5) * 0.25}rem;
`

export const CardSection = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${p => p.theme.bg.hover};
  border-bottom: 1px solid ${p => p.theme.border};
`

// ─── Typography ───────────────────────────────────────────────────────────────

export const PageTitle = styled.h2`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${p => p.theme.text.primary};
  margin: 0;
`

export const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${p => p.theme.text.secondary};
  margin: 0;
`

export const Muted = styled.span<{ $size?: 'xs' | 'sm' }>`
  color: ${p => p.theme.text.muted};
  font-size: ${p => p.$size === 'xs' ? '0.6875rem' : '0.75rem'};
`

export const MonoText = styled.span<{
  $size?: 'sm' | 'md' | 'lg'
  $positive?: boolean
  $negative?: boolean
  $muted?: boolean
}>`
  font-family: ${p => p.theme.font.mono};
  font-weight: 500;
  font-size: ${p =>
    p.$size === 'lg' ? '1.5rem' : p.$size === 'md' ? '1rem' : '0.875rem'};
  color: ${p =>
    p.$positive ? p.theme.success
    : p.$negative ? p.theme.danger
    : p.$muted ? p.theme.text.muted
    : p.theme.text.primary};
`

// ─── Buttons ─────────────────────────────────────────────────────────────────

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border: none;
  cursor: pointer;
  font-family: ${p => p.theme.font.sans};
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: ${p => p.theme.radius.md};
  transition: all 0.15s ease;
  white-space: nowrap;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

export const PrimaryButton = styled.button`
  ${buttonBase}
  padding: 0.5rem 1rem;
  background: ${p => p.theme.accent};
  color: white;

  &:hover:not(:disabled) { opacity: 0.88; }
  &:active:not(:disabled) { transform: scale(0.97); }
`

export const SmallPrimaryButton = styled(PrimaryButton)`
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
`

export const GhostButton = styled.button`
  ${buttonBase}
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: ${p => p.theme.text.muted};

  &:hover:not(:disabled) {
    background: ${p => p.theme.bg.hover};
    color: ${p => p.theme.text.primary};
  }
`

export const DangerButton = styled.button`
  ${buttonBase}
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: ${p => p.theme.danger};

  &:hover:not(:disabled) {
    background: ${p => p.theme.danger}18;
  }
`

export const IconButton = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border: none;
  cursor: pointer;
  border-radius: ${p => p.theme.radius.sm};
  background: transparent;
  color: ${p => p.$danger ? p.theme.danger : p.theme.text.muted};
  transition: all 0.15s;
  font-family: inherit;

  &:hover {
    background: ${p => p.$danger ? p.theme.danger + '18' : p.theme.bg.hover};
    color: ${p => p.$danger ? p.theme.danger : p.theme.text.primary};
  }
`

// ─── Toggle button (claro/escuro) ────────────────────────────────────────────

export const ThemeToggle = styled.div<{ $dark: boolean }>`
  display: flex;
  background: ${p => p.theme.bg.subtle};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius.md};
  padding: 3px;
  gap: 2px;
`

export const ThemeToggleOption = styled.button<{ $active: boolean }>`
  ${buttonBase}
  padding: 0.375rem 0.875rem;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: ${p => p.theme.radius.sm};
  background: ${p => p.$active ? p.theme.accent : 'transparent'};
  color: ${p => p.$active ? 'white' : p.theme.text.muted};
`

// ─── Form ─────────────────────────────────────────────────────────────────────

export const Label = styled.label`
  display: block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${p => p.theme.text.muted};
  margin-bottom: 0.3rem;
`

const inputBase = css`
  width: 100%;
  background: ${p => p.theme.bg.subtle};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius.md};
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: ${p => p.theme.text.primary};
  font-family: ${p => p.theme.font.sans};
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder { color: ${p => p.theme.text.faint}; }

  &:focus {
    outline: none;
    border-color: ${p => p.theme.accent};
    box-shadow: 0 0 0 3px ${p => p.theme.accentSoft};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const Input = styled.input`${inputBase}`
export const Select = styled.select`${inputBase} cursor: pointer;`

export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`

// ─── Table ────────────────────────────────────────────────────────────────────

export const TableWrapper = styled.div`
  overflow-x: auto;
`

export const Table = styled.table`
  width: 100%;
  font-size: 0.875rem;
  border-collapse: collapse;
  white-space: nowrap;
`

export const Thead = styled.thead``

export const Tbody = styled.tbody``

export const Tfoot = styled.tfoot``

export const Th = styled.th<{ $align?: string; $clickable?: boolean; $sticky?: boolean }>`
  text-align: ${p => p.$align || 'left'};
  padding: 0.625rem 1rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${p => p.theme.text.muted};
  border-bottom: 1px solid ${p => p.theme.border};
  cursor: ${p => p.$clickable ? 'pointer' : 'default'};
  background: ${p => p.theme.bg.card};

  ${p => p.$sticky && css`
    position: sticky;
    left: 0;
    z-index: 10;
  `}

  ${p => p.$clickable && css`
    user-select: none;
    &:hover { color: ${p.theme.text.primary}; }
  `}
`

export const Td = styled.td<{
  $align?: string
  $muted?: boolean
  $mono?: boolean
  $sticky?: boolean
}>`
  text-align: ${p => p.$align || 'left'};
  padding: 0.625rem 1rem;
  color: ${p => p.$muted ? p.theme.text.muted : p.theme.text.primary};
  border-bottom: 1px solid ${p => p.theme.border}55;
  font-size: 0.875rem;
  font-family: ${p => p.$mono ? p.theme.font.mono : 'inherit'};

  ${p => p.$sticky && css`
    position: sticky;
    left: 0;
    z-index: 5;
    background: ${p.theme.bg.card};
  `}
`

export const Tr = styled.tr<{
  $faded?: boolean
  $clickable?: boolean
  $selected?: boolean
  $negative?: boolean
}>`
  transition: background 0.1s;
  opacity: ${p => p.$faded ? 0.38 : 1};
  cursor: ${p => p.$clickable ? 'pointer' : 'default'};

  background: ${p =>
    p.$selected ? p.theme.accent + '15'
    : p.$negative ? p.theme.danger + '08'
    : 'transparent'};

  &:hover {
    background: ${p =>
      p.$selected ? p.theme.accent + '20'
      : p.theme.bg.hover};
  }
`

// ─── Badge ────────────────────────────────────────────────────────────────────

export const Badge = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: ${p => p.$color ? p.$color + '18' : p.theme.bg.subtle};
  color: ${p => p.$color || p.theme.text.muted};
`

// ─── Alert ────────────────────────────────────────────────────────────────────

export const Alert = styled.div<{ $variant: 'success' | 'error' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: ${p => p.theme.radius.md};
  font-size: 0.875rem;
  background: ${p =>
    p.$variant === 'success' ? p.theme.success + '18'
    : p.$variant === 'error' ? p.theme.danger + '18'
    : p.theme.accent + '18'};
  color: ${p =>
    p.$variant === 'success' ? p.theme.success
    : p.$variant === 'error' ? p.theme.danger
    : p.theme.accent};
`

// ─── Modal overlay ────────────────────────────────────────────────────────────

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  padding: 1rem;
`

// ─── Progress bar ─────────────────────────────────────────────────────────────

export const ProgressTrack = styled.div`
  height: 6px;
  background: ${p => p.theme.bg.subtle};
  border: 1px solid ${p => p.theme.border};
  border-radius: 99px;
  overflow: hidden;
`

export const ProgressFill = styled.div<{ $pct: number; $color?: string }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${p => p.$color || p.theme.accent};
  border-radius: 99px;
  transition: width 0.4s ease;
`

// ─── Color swatch ────────────────────────────────────────────────────────────

export const ColorSwatch = styled.button<{ $color: string; $active: boolean }>`
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 3px solid ${p => p.$active ? 'white' : 'transparent'};
  outline: ${p => p.$active ? `2px solid ${p.$color}` : 'none'};
  background: ${p => p.$color};
  cursor: pointer;
  transition: transform 0.15s;
  flex-shrink: 0;

  &:hover { transform: scale(1.12); }
  &:active { transform: scale(0.96); }
`
