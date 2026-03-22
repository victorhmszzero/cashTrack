// src/utils/calculations.ts
import { format, addMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AppState, MonthSummary, Purchase, PixItem } from '../types'

export function isActiveInMonth(startMonth: string, endMonth: string | null, yearMonth: string): boolean {
  return startMonth <= yearMonth && (endMonth === null || endMonth >= yearMonth)
}

/** Valor de uma Purchase no mês (considera override) */
function purchaseAmountInMonth(p: Purchase, yearMonth: string): number {
  return p.overrides?.[yearMonth] ?? p.amountPerMonth
}

function sumActiveItems(items: PixItem[], yearMonth: string): number {
  return items
    .filter(i => isActiveInMonth(i.startMonth, i.endMonth, yearMonth))
    .reduce((sum, i) => sum + i.amountPerMonth, 0)
}

function sumActivePurchases(purchases: Purchase[], yearMonth: string): number {
  return purchases
    .filter(p => isActiveInMonth(p.startMonth, p.endMonth, yearMonth))
    .reduce((sum, p) => sum + purchaseAmountInMonth(p, yearMonth), 0)
}

export function formatMonthLabel(yearMonth: string): string {
  const date = parseISO(yearMonth + '-01')
  return format(date, "MMM'/'yy", { locale: ptBR })
    .replace(/^\w/, c => c.toUpperCase())
}

export function brl(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: 2,
  }).format(value)
}

export function generateMonths(state: AppState): string[] {
  const today = new Date()
  const startYM = format(today, 'yyyy-MM')
  let lastYM = format(addMonths(today, 12), 'yyyy-MM')

  for (const card of state.cards)
    for (const p of card.purchases)
      if (p.endMonth && p.endMonth > lastYM) lastYM = p.endMonth

  for (const person of state.pixPeople)
    for (const item of person.items)
      if (item.endMonth && item.endMonth > lastYM) lastYM = item.endMonth

  const months: string[] = []
  let current = parseISO(startYM + '-01')
  const end = parseISO(lastYM + '-01')
  while (current <= end) {
    months.push(format(current, 'yyyy-MM'))
    current = addMonths(current, 1)
  }
  return months
}

export function computeSummaries(state: AppState): MonthSummary[] {
  const months = generateMonths(state)
  const { settings, cards, fixedBills, pixPeople, categories } = state

  return months.map(ym => {
    // Totais por cartão (com overrides)
    const cardTotals = cards.map(card => ({
      cardId: card.id,
      cardName: card.name,
      total: sumActivePurchases(card.purchases, ym),
    }))

    // Contas fixas (com overrides)
    const fixedTotal = fixedBills
      .filter(b => b.active)
      .reduce((s, b) => s + (b.overrides?.[ym] ?? b.amount), 0)

    const totalToPay = cardTotals.reduce((s, c) => s + c.total, 0) + fixedTotal

    // PIX breakdown
    const pixBreakdown = pixPeople.map(person => {
      const itemsTotal = sumActiveItems(person.items, ym)
      const purchasesTotal = cards.reduce((cs, card) =>
        cs + card.purchases
          .filter(p => (p.paidBy === person.id || p.paidBy === person.name) && isActiveInMonth(p.startMonth, p.endMonth, ym))
          .reduce((ps, p) => ps + purchaseAmountInMonth(p, ym), 0)
      , 0)
      return { personId: person.id, personName: person.name, total: itemsTotal + purchasesTotal }
    }).filter(p => p.total > 0).sort((a, b) => b.total - a.total)

    const pixReceivable = pixBreakdown.reduce((s, p) => s + p.total, 0)
    const netToPay = Math.max(0, totalToPay - pixReceivable)
    const balance = settings.salary - netToPay
    const toInvest = balance > 0 ? balance * (settings.investPercent / 100) : 0
    const toLazer = balance > 0 ? balance * ((100 - settings.investPercent) / 100) : 0

    // Category breakdown — inclui bucket "sem categoria"
    const UNCATEGORIZED_ID = '__uncategorized__'
    const catMap: Record<string, number> = {}
    for (const card of cards) {
      for (const p of card.purchases) {
        if (!isActiveInMonth(p.startMonth, p.endMonth, ym)) continue
        const key = p.categoryId || UNCATEGORIZED_ID
        catMap[key] = (catMap[key] ?? 0) + purchaseAmountInMonth(p, ym)
      }
    }
    for (const bill of fixedBills) {
      if (!bill.active) continue
      const key = bill.categoryId || UNCATEGORIZED_ID
      catMap[key] = (catMap[key] ?? 0) + (bill.overrides?.[ym] ?? bill.amount)
    }

    const categoryBreakdown = [
      ...(categories ?? [])
        .map(cat => ({
          categoryId: cat.id,
          categoryName: cat.name,
          color: cat.color,
          emoji: cat.emoji,
          total: catMap[cat.id] ?? 0,
        }))
        .filter(c => c.total > 0),
      // Sem categoria — sempre por último
      ...(catMap[UNCATEGORIZED_ID]
        ? [{ categoryId: UNCATEGORIZED_ID, categoryName: 'Sem categoria', color: '#94a3b8', emoji: '❓', total: catMap[UNCATEGORIZED_ID] }]
        : []),
    ].sort((a, b) => a.categoryId === UNCATEGORIZED_ID ? 1 : b.categoryId === UNCATEGORIZED_ID ? -1 : b.total - a.total)

    return {
      yearMonth: ym, label: formatMonthLabel(ym),
      cardTotals, fixedTotal, totalToPay,
      pixReceivable, pixBreakdown, categoryBreakdown,
      netToPay, balance, toInvest, toLazer,
    }
  })
}

export function getCurrentInstallment(startMonth: string, refMonth: string): number {
  const start = parseISO(startMonth + '-01')
  const ref   = parseISO(refMonth + '-01')
  return (ref.getFullYear() - start.getFullYear()) * 12 + (ref.getMonth() - start.getMonth()) + 1
}