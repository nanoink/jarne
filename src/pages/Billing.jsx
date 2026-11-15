import { useState } from 'react';
import { Link } from 'react-router-dom';
import { plans, dateOffset } from '../data';
import { useStore } from '../store';
import { formatDate, money, nextId, nextMonth, settleInvoice } from '../domain';
import {
  Confirm,
  Empty,
  Icon,
  InvoiceDownload,
  Metric,
  Modal,
  PageTitle,
  SearchInput,
  Status,
  downloadPDF,
  exportCSV,
} from '../components';

export function Checkout({ invoice, plan, onClose }) {
  const { data, update, notify } = useStore();
  const [method, setMethod] = useState('Pix');
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const value = plan?.price ?? invoice.value;
  function pay() {
    if (confirmed) return;
    if (plan)
      update((current) => ({
        ...current,
        subscription: {
          ...current.subscription,
          plan: plan.id,
          active: true,
          method,
          nextBilling: nextMonth(dateOffset()),
          used: Math.min(current.subscription.used, plan.quota),
        },
        invoices: [
          {
            id: nextId(current.invoices, 'FAT', 2008),
            company: 'c1',
            title: `Plano ${plan.name} · adesão demonstrativa`,
            value: plan.price,
            status: 'Pago',
            due: dateOffset(),
            paidAt: dateOffset(),
            created: dateOffset(),
            method,
            kind: 'subscription',
          },
          ...current.invoices.map((i) =>
            i.kind === 'subscription' && i.status === 'Pendente'
              ? { ...i, status: 'Cancelado' }
              : i,
          ),
        ],
      }));
    else update((current) => settleInvoice(current, invoice.id, method, dateOffset()));
    setConfirmed(true);
    notify(
      plan ? 'Seu plano foi atualizado na demonstração.' : 'Pagamento demonstrativo confirmado.',
    );
  }
  return (
    <Modal
      title={confirmed ? 'Pronto para seguir em frente.' : 'Um passo para começar'}
      subtitle={
        confirmed ? 'Pagamento simulado com sucesso.' : 'Escolha como deseja simular seu pagamento.'
      }
      onClose={onClose}
    >
      {confirmed ? (
        <div className="modal-body payment-success">
          <span>
            <Icon name="Check" size={37} />
          </span>
          <h2>Deu tudo certo!</h2>
          <p>
            {plan
              ? `O plano ${plan.name} está ativo para sua empresa.`
              : 'Sua fatura foi marcada como paga. Você já pode acompanhar a próxima etapa.'}
          </p>
          <strong>{money(value)}</strong>
          <small>Via {method} · Nenhum valor foi cobrado.</small>
          <button className="btn btn-primary btn-full" onClick={onClose}>
            Continuar na plataforma
            <Icon name="ArrowRight" size={17} />
          </button>
        </div>
      ) : (
        <>
          <div className="modal-body">
            <div className="checkout-summary">
              <div>
                <small>{plan ? 'ASSINATURA MENSAL' : invoice.id}</small>
                <strong>{plan ? `Plano ${plan.name}` : invoice.title}</strong>
              </div>
              <b>{money(value)}</b>
            </div>
            <div className="payment-tabs" role="group" aria-label="Forma de pagamento">
              {[
                { name: 'Pix', icon: 'QrCode' },
                { name: 'Cartão de crédito', icon: 'CreditCard' },
                { name: 'Boleto', icon: 'Barcode' },
              ].map((m) => (
                <button
                  className={method === m.name ? 'active' : ''}
                  key={m.name}
                  onClick={() => setMethod(m.name)}
                >
                  <Icon name={m.icon} size={22} />
                  {m.name === 'Cartão de crédito' ? 'Cartão' : m.name}
                </button>
              ))}
            </div>
            {method === 'Pix' && (
              <div className="pix-demo">
                <div className="qr-placeholder">
                  <Icon name="QrCode" size={92} />
                  <span>DEMONSTRAÇÃO</span>
                </div>
                <div>
                  <h3>Pix demonstrativo</h3>
                  <p>
                    Este símbolo não contém uma cobrança real. Confirme abaixo para testar o fluxo.
                  </p>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          'VEREDA-DEMONSTRACAO-SEM-VALOR-FINANCEIRO',
                        );
                        setCopied(true);
                      } catch {
                        notify('Código: VEREDA-DEMONSTRACAO-SEM-VALOR-FINANCEIRO', 'error');
                      }
                    }}
                  >
                    <Icon name="Copy" size={15} />
                    {copied ? 'Código copiado' : 'Copiar código de teste'}
                  </button>
                </div>
              </div>
            )}
            {method === 'Cartão de crédito' && (
              <div className="card-demo">
                <div className="fake-card">
                  <Icon name="CreditCard" size={29} />
                  <strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; 4242</strong>
                  <div>
                    <span>VEREDA DEMO</span>
                    <span>12/30</span>
                  </div>
                </div>
                <p className="muted">
                  Cartão fictício pré-configurado. Não informe dados bancários reais.
                </p>
                {!plan && (
                  <label>
                    Parcelamento ilustrativo
                    <select>
                      <option>1x de {money(value)} sem juros</option>
                      <option>2x de {money(value / 2)} sem juros</option>
                      <option>3x de {money(value / 3)} sem juros</option>
                    </select>
                  </label>
                )}
              </div>
            )}
            {method === 'Boleto' && (
              <div className="boleto-demo">
                <Icon name="Barcode" size={64} />
                <h3>Boleto de demonstração</h3>
                <p>Você pode baixar um documento de exemplo. Ele não é pagável.</p>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    downloadPDF(
                      'Boleto-demonstrativo',
                      `BOLETO DEMONSTRATIVO — NÃO PAGÁVEL\nVereda Plataforma Ambiental\nValor ilustrativo: ${money(value)}\nServiço: ${plan ? plan.name : invoice.title}\n\nSEM CÓDIGO BANCÁRIO. NÃO EFETUAR PAGAMENTO.\nEste documento existe apenas para demonstrar a interface.`,
                    )
                  }
                >
                  <Icon name="Download" size={16} />
                  Baixar exemplo de boleto
                </button>
              </div>
            )}
            <label className="checkbox-label">
              <input type="checkbox" checked readOnly />
              Entendo que este é um pagamento de demonstração.
            </label>
            {plan && (
              <p className="payment-terms">
                Plano de {money(value)}/mês. Na demonstração, a alteração é imediata, sem pró-rata.
                A cobrança pendente do plano anterior é cancelada. Cancelamento disponível na tela
                de planos.
              </p>
            )}
            <div className="info-note">
              <Icon name="FlaskConical" size={18} />
              <p>Nenhuma transação, cobrança ou transferência real será realizada.</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={pay}>
              Confirmar pagamento simulado
              <Icon name="ArrowRight" size={16} />
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export function Finance() {
  const { data, role, visibleRequests } = useStore();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('Todas');
  const [checkout, setCheckout] = useState(null);
  const invoices = data.invoices.filter(
    (i) =>
      role === 'admin' ||
      (role === 'prestador' ? visibleRequests.some((r) => r.id === i.request) : i.company === 'c1'),
  );
  const paid = invoices.filter((i) => i.status === 'Pago');
  const pending = invoices.filter((i) => i.status === 'Pendente');
  const totalPaid = paid.reduce((a, i) => a + i.value, 0);
  const filtered = invoices.filter(
    (i) =>
      `${i.title} ${i.id}`.toLowerCase().includes(query.toLowerCase()) &&
      (tab === 'Todas' || i.status === tab),
  );
  const provider = role === 'prestador';
  return (
    <>
      <PageTitle
        title={provider ? 'Minha remuneração' : 'Financeiro'}
        subtitle={
          provider
            ? 'Transparência para acompanhar o resultado dos seus projetos.'
            : 'Mais clareza para cuidar dos próximos passos do seu negócio.'
        }
      >
        <button
          className="btn btn-secondary"
          onClick={() =>
            exportCSV('vereda-financeiro.csv', [
              ['Fatura', 'Descrição', 'Valor', 'Status', 'Vencimento', 'Meio'],
              ...filtered.map((i) => [
                i.id,
                i.title,
                provider ? i.value * 0.8 : i.value,
                i.status,
                i.due,
                i.method,
              ]),
            ])
          }
        >
          <Icon name="Download" size={17} />
          Exportar extrato
        </button>
      </PageTitle>
      <div className="metrics-grid three">
        <Metric
          title={provider ? 'Remuneração prevista' : 'Total pago'}
          value={money(provider ? totalPaid * 0.8 : totalPaid)}
          icon="CircleCheck"
          detail={
            provider
              ? '80% dos serviços pagos · ilustrativo'
              : `${paid.length} pagamentos confirmados`
          }
        />
        <Metric
          title={provider ? 'Taxa ilustrativa da plataforma' : 'Em aberto'}
          value={money(provider ? totalPaid * 0.2 : pending.reduce((a, i) => a + i.value, 0))}
          icon={provider ? 'Percent' : 'Clock3'}
          color="orange"
          detail={
            provider
              ? '20% sobre os serviços · sem repasse real'
              : `${pending.length} fatura(s) para acompanhar`
          }
        />
        <Metric
          title={provider ? 'Projetos concluídos' : 'Próximo vencimento'}
          value={
            provider
              ? visibleRequests.filter((r) => r.status === 'Concluído').length
              : pending.length
                ? formatDate([...pending].sort((a, b) => a.due.localeCompare(b.due))[0].due)
                : 'Tudo em dia'
          }
          icon="CalendarDays"
          color="blue"
          detail={provider ? 'entregas aprovadas pela empresa' : 'organize-se com tranquilidade'}
        />
      </div>
      {provider && (
        <div className="info-note finance-note">
          <Icon name="Info" />
          <p>
            Os percentuais de remuneração são exemplos para demonstrar o painel. Nenhum repasse é
            realizado nesta versão.
          </p>
        </div>
      )}
      <section className="panel">
        <div className="list-tabs">
          {['Todas', 'Pago', 'Pendente', 'Cancelado'].map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {{ Pago: 'Pagas', Pendente: 'Pendentes', Cancelado: 'Canceladas' }[t] || t}
            </button>
          ))}
        </div>
        <div className="list-filters">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar fatura ou descrição..."
          />
          <span className="muted">{filtered.length} registros</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Vencimento</th>
                <th>{provider ? 'Remuneração (80%)' : 'Valor'}</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div className="table-description">
                      <span className="file-icon">
                        <Icon name={i.kind === 'subscription' ? 'Sparkles' : 'Receipt'} size={19} />
                      </span>
                      <span>
                        <strong>{i.title}</strong>
                        <small>
                          {i.id} {i.method ? `· ${i.method}` : ''}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td className="nowrap">{formatDate(i.due)}</td>
                  <td className="money-cell">{money(provider ? i.value * 0.8 : i.value)}</td>
                  <td>
                    <Status>{i.status}</Status>
                  </td>
                  <td>
                    <div className="table-actions">
                      {i.status === 'Pendente' && role === 'cliente' && (
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => setCheckout(i)}
                        >
                          Pagar
                        </button>
                      )}
                      <InvoiceDownload invoice={i} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <Empty
              title="Nenhuma fatura encontrada"
              text="As cobranças e os pagamentos aparecerão aqui."
            />
          )}
        </div>
      </section>
      <div className="billing-help">
        <Icon name="ShieldCheck" size={22} />
        <div>
          <strong>Você está no controle.</strong>
          <p>
            Faturas e comprovantes desta versão são demonstrativos, sem valor fiscal.{' '}
            <Link to="/suporte">Precisa de ajuda?</Link>
          </p>
        </div>
      </div>
      {checkout && <Checkout invoice={checkout} onClose={() => setCheckout(null)} />}
    </>
  );
}

export function Plans() {
  const { data, role, update, notify } = useStore();
  const [selected, setSelected] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const current = plans.find((p) => p.id === data.subscription.plan);
  return (
    <>
      <PageTitle
        eyebrow="CRESÇA NO SEU RITMO"
        title="Um plano para cada momento."
        subtitle="Uma rede de apoio para sua empresa ir mais longe, com previsibilidade e confiança."
      />
      {role === 'cliente' && (
        <div className="subscription-banner">
          <span className="subscription-icon">
            <Icon name="Sparkles" size={26} />
          </span>
          <div>
            <small>SEU PLANO ATUAL</small>
            <strong>{data.subscription.active ? current.name : 'Acesso avulso'}</strong>
            <p>
              {data.subscription.active
                ? `Próxima mensalidade: ${formatDate(data.subscription.nextBilling)} · ${money(current.price)}`
                : 'Sua assinatura foi cancelada. Você pode continuar contratando serviços avulsos.'}
            </p>
          </div>
          <Status>{data.subscription.active ? 'Ativo' : 'Cancelado'}</Status>
        </div>
      )}
      <div className="pricing-heading">
        <span className="eyebrow">MENOS COMPLICAÇÃO. MAIS POSSIBILIDADES.</span>
        <h2>Boas conexões fazem sua empresa crescer.</h2>
        <p>Assinaturas mensais ou contratação avulsa. Você escolhe o melhor caminho.</p>
      </div>
      <div className="pricing-grid">
        {plans.map((p) => (
          <article
            className={`pricing-card ${p.id === 'profissional' ? 'featured' : ''}`}
            key={p.id}
          >
            {p.id === 'profissional' && (
              <div className="pricing-recommended">
                <Icon name="Sparkles" size={14} />O MAIS ESCOLHIDO
              </div>
            )}
            <span className="pricing-icon">
              <Icon
                name={
                  p.id === 'essencial'
                    ? 'Sprout'
                    : p.id === 'profissional'
                      ? 'TreeDeciduous'
                      : 'Trees'
                }
                size={30}
              />
            </span>
            <h2>{p.name}</h2>
            <p>{p.subtitle}</p>
            <div className="pricing-price">
              {money(p.price)}
              <small>/mês</small>
            </div>
            <button
              className={`btn btn-full ${p.id === 'profissional' ? 'btn-primary' : 'btn-secondary'}`}
              disabled={
                role === 'admin' || (data.subscription.active && data.subscription.plan === p.id)
              }
              onClick={() => setSelected(p)}
            >
              {role === 'admin'
                ? 'Plano disponível no catálogo'
                : data.subscription.active && data.subscription.plan === p.id
                  ? 'Seu plano atual'
                  : `Escolher ${p.name}`}
              <Icon
                name={
                  data.subscription.active && data.subscription.plan === p.id
                    ? 'Check'
                    : 'ArrowRight'
                }
                size={17}
              />
            </button>
            <div className="pricing-divider" />
            <h4>PARA SEGUIR COM CONFIANÇA</h4>
            <ul>
              {p.features.map((f) => (
                <li key={f}>
                  <Icon name="Check" size={16} />
                  {f}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="plan-footnotes">
        <p>
          Valores e franquias ilustrativos para apresentação. Consultas são orientações de até 30
          minutos; projetos, ART, honorários de terceiros, seguros, crédito e mídia paga recebem
          condições próprias. Descontos aplicam-se a serviços profissionais elegíveis e constam na
          proposta.
        </p>
        {role === 'cliente' && data.subscription.active && (
          <button className="text-link text-danger" onClick={() => setCancelOpen(true)}>
            Cancelar minha assinatura
          </button>
        )}
      </div>
      <div className="panel plan-faq">
        <h2>Um pouco mais de clareza.</h2>
        {[
          {
            q: 'Posso contratar sem assinatura?',
            a: 'Sim. Escolha um serviço no catálogo, descreva sua demanda e receba uma proposta. Você só contrata depois de aprovar o escopo e o valor.',
          },
          {
            q: 'Como funciona a mudança de plano?',
            a: 'Nesta demonstração, a mudança é imediata após o pagamento simulado. O valor integral do novo plano é usado como exemplo, sem cálculo proporcional.',
          },
          {
            q: 'O plano inclui crédito ou seguro?',
            a: 'O plano organiza o acesso e o acompanhamento. O crédito é contratado com a instituição financeira e o seguro com o parceiro habilitado, conforme suas condições.',
          },
          {
            q: 'Posso cancelar quando precisar?',
            a: 'Sim. Na demonstração, o cancelamento encerra a assinatura imediatamente e cancela a mensalidade pendente. Os serviços avulsos continuam disponíveis.',
          },
        ].map((f) => (
          <details key={f.q}>
            <summary>
              {f.q}
              <Icon name="Plus" size={17} />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      {selected && <Checkout plan={selected} onClose={() => setSelected(null)} />}
      {cancelOpen && (
        <Confirm
          title="Cancelar sua assinatura?"
          text="O plano será desativado imediatamente nesta demonstração. Mensalidades pendentes serão canceladas e os serviços avulsos continuarão disponíveis."
          danger
          label="Cancelar assinatura"
          onClose={() => setCancelOpen(false)}
          onConfirm={() => {
            update((current) => ({
              ...current,
              subscription: { ...current.subscription, active: false },
              invoices: current.invoices.map((i) =>
                i.kind === 'subscription' && i.status === 'Pendente'
                  ? { ...i, status: 'Cancelado' }
                  : i,
              ),
            }));
            notify('Assinatura cancelada na demonstração.');
          }}
        />
      )}
    </>
  );
}
