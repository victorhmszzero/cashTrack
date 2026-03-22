# 💰 Contas

App web para controle financeiro pessoal — replica e melhora a planilha Excel de controle de faturas, PIX e saldo.

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm (vem junto com o Node)

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo desenvolvimento
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

## Como fazer o build para produção

```bash
npm run build
```

Os arquivos ficam em `/dist`. Pode hospedar em qualquer servidor estático (Netlify, Vercel, GitHub Pages, etc).

## Funcionalidades

| Tela | O que faz |
|---|---|
| **Dashboard** | KPIs do mês selecionado + gráfico dos próximos 12 meses |
| **Planilha** | Tabela geral com todos os meses (igual à aba Home do Excel) |
| **Cartões** | Gerenciar cartões e compras parceladas/recorrentes |
| **PIX** | Controlar quem deve pagar PIX e quanto por mês |
| **Contas Fixas** | Enel, Água, etc — com toggle ativo/inativo |
| **Configurações** | Salário, percentual de investimento |

## Tecnologias

- **React 18** + **TypeScript**
- **Vite** (build rápido)
- **Zustand** (estado global, salvo no localStorage)
- **Tailwind CSS** (estilo)
- **Recharts** (gráficos)
- **date-fns** (datas)

## Dados

Os dados iniciais (`export const initialData = {`) foram importados diretamente da planilha Excel.
Qualquer edição feita no app é salva automaticamente no **localStorage** do navegador.
Para voltar aos dados iniciais, use **Configurações → Resetar**.
