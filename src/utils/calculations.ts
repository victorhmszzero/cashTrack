// src/utils/calculations.ts

import { format, addMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AppState, MonthSummary, Purchase, PixItem } from '../types'

/** Retorna true se o item está ativo no mês dado */
export function isActiveInMonth(
  startMonth: string,
  endMonth: string | null,
  yearMonth: string
): boolean {
  return startMonth <= yearMonth && (endMonth === null || endMonth >= yearMonth)
}

/** Soma os itens ativos de uma lista de parcelas no mês */
function sumActive(items: Array<Purchase | PixItem>, yearMonth: string): number {
  return items
    .filter((item) => isActiveInMonth(item.startMonth, item.endMonth, yearMonth))
    .reduce((sum, item) => sum + item.amountPerMonth, 0)
}

/** Converte "2026-03" → "Mar/26" */
export function formatMonthLabel(yearMonth: string): string {
  const date = parseISO(yearMonth + '-01')
  return format(date, "MMM'/'yy", { locale: ptBR })
    .replace(/^\w/, (c) => c.toUpperCase())
}

/** Formata valor em BRL */
export function brl(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * Gera lista de meses de hoje até o último mês com alguma parcela ativa
 * (no mínimo 12 meses).
 */
export function generateMonths(state: AppState): string[] {
  const today = new Date()
  const startYM = format(today, 'yyyy-MM')

  // Encontrar o último mês com algum dado
  let lastYM = format(addMonths(today, 12), 'yyyy-MM') // mínimo 12 meses

  for (const card of state.cards) {
    for (const p of card.purchases) {
      if (p.endMonth && p.endMonth > lastYM) lastYM = p.endMonth
    }
  }
  for (const person of state.pixPeople) {
    for (const item of person.items) {
      if (item.endMonth && item.endMonth > lastYM) lastYM = item.endMonth
    }
  }

  const months: string[] = []
  let current = parseISO(startYM + '-01')
  const end = parseISO(lastYM + '-01')

  while (current <= end) {
    months.push(format(current, 'yyyy-MM'))
    current = addMonths(current, 1)
  }

  return months
}

/** Calcula o resumo de todos os meses */
export function computeSummaries(state: AppState): MonthSummary[] {
  const months = generateMonths(state)
  const { settings, cards, fixedBills, pixPeople } = state

  return months.map((ym) => {
    // Totais por cartão
    const cardTotals = cards.map((card) => ({
      cardId: card.id,
      cardName: card.name,
      total: sumActive(card.purchases, ym),
    }))

    // Total de contas fixas lendo o override do mês
    const fixedTotal = fixedBills
      .filter((b) => b.active)
      .reduce((s, b) => {
        const monthValue = b.overrides?.[ym] !== undefined ? b.overrides[ym] : b.amount
        return s + monthValue
      }, 0)

    const totalToPay = cardTotals.reduce((s, c) => s + c.total, 0) + fixedTotal

    // Detalhamento de quem deve no PIX este mês
    const pixBreakdown = pixPeople.map((person) => {
      const itemsTotal = sumActive(person.items, ym)
      const purchasesTotal = cards.reduce((cSum, card) => {
        return cSum + card.purchases
          .filter((p) => (p.paidBy === person.id || p.paidBy === person.name) && isActiveInMonth(p.startMonth, p.endMonth, ym))
          .reduce((pSum, p) => pSum + p.amountPerMonth, 0)
      }, 0)
      return { personId: person.id, personName: person.name, total: itemsTotal + purchasesTotal }
    }).filter(p => p.total > 0).sort((a, b) => b.total - a.total)

    const pixReceivable = pixBreakdown.reduce((sum, p) => sum + p.total, 0)
    const netToPay = Math.max(0, totalToPay - pixReceivable)
    const balance = settings.salary - netToPay
    const toInvest = balance > 0 ? balance * (settings.investPercent / 100) : 0
    const toLazer = balance > 0 ? balance * ((100 - settings.investPercent) / 100) : 0

    return {
      yearMonth: ym,
      label: formatMonthLabel(ym),
      cardTotals,
      fixedTotal,
      totalToPay,
      pixReceivable,
      pixBreakdown,
      netToPay,
      balance,
      toInvest,
      toLazer,
    }
  })
}

/** Retorna quantas parcelas totais e qual é a corrente dado start/end */
export function getInstallmentInfo(
  startMonth: string,
  endMonth: string | null
): { total: number | null; description: string } {
  if (!endMonth) return { total: null, description: 'Recorrente' }

  const start = parseISO(startMonth + '-01')
  const end = parseISO(endMonth + '-01')
  const total =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) + 1

  return { total, description: `${total}x de ${brl(0)}` }
}

/** Número da parcela atual (mês de referência) */
export function getCurrentInstallment(
  startMonth: string,
  refMonth: string
): number {
  const start = parseISO(startMonth + '-01')
  const ref = parseISO(refMonth + '-01')
  return (
    (ref.getFullYear() - start.getFullYear()) * 12 +
    (ref.getMonth() - start.getMonth()) + 1
  )
}
