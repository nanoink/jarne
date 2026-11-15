import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePrice,
  canTransition,
  nextId,
  nextMonth,
  settleInvoice,
  stageProgress,
} from '../src/domain.js';
import { createSeed, plans, services } from '../src/data.js';

test('O catálogo contém as sete áreas e os preços dos planos do escopo', () => {
  assert.equal(services.length, 7);
  assert.deepEqual(
    plans.map((plan) => plan.price),
    [297, 797, 1997],
  );
  assert.equal(services.filter((service) => service.price === null).length, 2);
});
test('Os descontos dos planos arredondam valores monetários', () => {
  assert.equal(calculatePrice(850, 0.1), 765);
  assert.equal(calculatePrice(199.99, 0.15), 169.99);
  assert.equal(calculatePrice(650), 650);
});
test('Não permite saltar diretamente de solicitação para execução', () => {
  assert.equal(canTransition('Em análise', 'Em andamento'), false);
  assert.equal(canTransition('Em análise', 'Proposta recebida'), true);
  assert.equal(canTransition('Aguardando aprovação', 'Em andamento'), true);
  assert.equal(canTransition('Concluído', 'Em andamento'), false);
});
test('Os identificadores continuam a sequência mesmo após reordenar registros', () => {
  assert.equal(nextId([{ id: 'VR-1053' }, { id: 'VR-1050' }], 'VR', 1049), 'VR-1054');
  assert.equal(nextId([], 'FAT', 2008), 'FAT-2009');
});
test('O pagamento atualiza fatura e solicitação atomicamente, sem mutar os dados', () => {
  const state = createSeed();
  const request = state.requests[0];
  request.status = 'Aguardando pagamento';
  state.invoices[1].status = 'Pendente';
  const next = settleInvoice(state, state.invoices[1].id, 'Pix', '2026-11-14');
  assert.equal(state.invoices[1].status, 'Pendente');
  assert.equal(next.invoices[1].status, 'Pago');
  assert.equal(next.invoices[1].paidAt, '2026-11-14');
  assert.equal(next.requests[0].status, 'Contratado');
  assert.equal(next.requests[0].history.length, state.requests[0].history.length + 1);
});
test('Pagar uma fatura já paga ou cancelada não duplica o pagamento', () => {
  const state = createSeed();
  assert.equal(settleInvoice(state, 'FAT-2007', 'Pix', '2026-11-14'), state);
  state.invoices[0].status = 'Cancelado';
  assert.equal(settleInvoice(state, 'FAT-2008', 'Pix', '2026-11-14'), state);
  assert.equal(settleInvoice(state, 'inexistente', 'Pix', '2026-11-14'), state);
});
test('O progresso cobre todas as etapas, incluindo cancelamento', () => {
  assert.equal(stageProgress('Concluído'), 100);
  assert.equal(stageProgress('Cancelado'), 0);
  assert.ok(stageProgress('Em andamento') > stageProgress('Contratado'));
});
test('A mensalidade respeita meses curtos e conserva o ciclo no pagamento antecipado', () => {
  assert.equal(nextMonth('2026-01-31'), '2026-02-28');
  assert.equal(nextMonth('2028-01-31'), '2028-02-29');
  assert.equal(nextMonth('2026-12-15'), '2027-01-15');
  const state = createSeed();
  state.invoices[0].due = '2026-01-31';
  const next = settleInvoice(state, 'FAT-2008', 'Boleto', '2026-01-20');
  assert.equal(next.subscription.nextBilling, '2026-02-28');
});
