export const money = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
export const shortMoney = (value) =>
  new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
    style: 'currency',
    currency: 'BRL',
  }).format(value);
export const formatDate = (value) =>
  value
    ? new Date(`${value.slice(0, 10)}T12:00:00`)
        .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        .replace('.', '')
    : '—';
export const fullDate = (value) =>
  value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR') : '—';
export const isClosed = (status) => ['Concluído', 'Cancelado'].includes(status);
export const stageProgress = (status) =>
  ({
    'Em análise': 12,
    'Proposta recebida': 25,
    'Aguardando pagamento': 35,
    Contratado: 45,
    'Em andamento': 65,
    'Aguardando aprovação': 90,
    Concluído: 100,
    Cancelado: 0,
  })[status] || 0;
export function calculatePrice(value, discount = 0) {
  return Math.round(Number(value) * (1 - discount) * 100) / 100;
}
export function nextMonth(date) {
  const value = new Date(`${date}T12:00:00`);
  const day = value.getDate();
  value.setDate(1);
  value.setMonth(value.getMonth() + 1);
  const lastDay = new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate();
  value.setDate(Math.min(day, lastDay));
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}
export function nextId(items, prefix, start) {
  return `${prefix}-${Math.max(start, ...items.map((i) => Number(i.id.split('-').at(-1)) || 0)) + 1}`;
}
export function canTransition(from, to) {
  const transitions = {
    'Em análise': ['Proposta recebida', 'Cancelado'],
    'Proposta recebida': ['Aguardando pagamento', 'Cancelado'],
    'Aguardando pagamento': ['Contratado', 'Cancelado'],
    Contratado: ['Em andamento'],
    'Em andamento': ['Aguardando aprovação'],
    'Aguardando aprovação': ['Concluído', 'Em andamento'],
  };
  return transitions[from]?.includes(to) || false;
}
export function settleInvoice(state, invoiceId, method, today) {
  const invoice = state.invoices.find((item) => item.id === invoiceId);
  if (!invoice || invoice.status !== 'Pendente') return state;
  return {
    ...state,
    invoices: state.invoices.map((item) =>
      item.id === invoiceId ? { ...item, status: 'Pago', method, paidAt: today } : item,
    ),
    subscription:
      invoice.kind === 'subscription'
        ? {
            ...state.subscription,
            nextBilling: nextMonth(invoice.due),
          }
        : state.subscription,
    requests: state.requests.map((item) =>
      item.id === invoice.request && item.status === 'Aguardando pagamento'
        ? {
            ...item,
            status: 'Contratado',
            history: [
              ...item.history,
              {
                id: crypto.randomUUID(),
                text: `Pagamento demonstrativo confirmado via ${method}`,
                date: today,
              },
            ],
          }
        : item,
    ),
  };
}
