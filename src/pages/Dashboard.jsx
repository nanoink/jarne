import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { services, specialists, plans } from '../data';
import { formatDate, isClosed, money, shortMoney } from '../domain';
import {
  Icon,
  Metric,
  PageTitle,
  Progress,
  RequestTable,
  SectionTitle,
  ServiceIcon,
  Status,
} from '../components';
import { Landscape } from '../App';

export default function Dashboard() {
  const { data, role, user, visibleRequests } = useStore();
  const active = visibleRequests.filter((r) => !isClosed(r.status));
  const done = visibleRequests.filter((r) => r.status === 'Concluído');
  const pending = visibleRequests.filter((r) =>
    ['Proposta recebida', 'Aguardando aprovação', 'Aguardando pagamento'].includes(r.status),
  );
  const plan = plans.find((p) => p.id === data.subscription.plan);
  const paid = data.invoices.filter((i) => i.status === 'Pago');
  const providerPaid = paid.filter((i) => visibleRequests.some((r) => r.id === i.request));
  const upcoming = [...active].sort((a, b) => a.due.localeCompare(b.due)).slice(0, 2);
  return (
    <>
      <PageTitle
        title={`Olá, ${(role === 'cliente' ? data.company.contact : user.name).split(' ')[0]} ${role === 'cliente' ? '☀' : ''}`}
        subtitle={
          role === 'cliente'
            ? 'Um novo dia para fazer sua empresa ir mais longe.'
            : role === 'admin'
              ? 'Acompanhe os negócios e mantenha a operação em movimento.'
              : 'Seu conhecimento transforma projetos. Vamos ao trabalho.'
        }
      >
        <span className="date-label">
          <Icon name="CalendarDays" size={17} />
          {new Date().toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </PageTitle>
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="eyebrow">
            {role === 'cliente'
              ? 'CRESCER É MELHOR COM APOIO'
              : role === 'admin'
                ? 'UMA VISÃO DO TODO'
                : 'ESPECIALISTAS QUE FAZEM A DIFERENÇA'}
          </span>
          <h2>
            {role === 'cliente' ? (
              <>
                Sua empresa cresce.
                <br />O futuro agradece.
              </>
            ) : role === 'admin' ? (
              <>
                Conexões que geram
                <br />
                novas possibilidades.
              </>
            ) : (
              <>
                Seu próximo projeto
                <br />
                começa por aqui.
              </>
            )}
          </h2>
          <p>
            {role === 'cliente'
              ? 'Da primeira proposta à próxima grande obra, encontre o apoio certo em cada etapa.'
              : role === 'admin'
                ? 'Empresas, especialistas e serviços conectados em uma operação mais simples.'
                : 'Organize suas demandas, envie propostas e acompanhe cada entrega em um só lugar.'}
          </p>
          <Link className="btn btn-primary" to={role === 'cliente' ? '/servicos' : '/solicitacoes'}>
            {role === 'cliente' ? 'Explorar serviços' : 'Acompanhar solicitações'}
            <Icon name="ArrowUpRight" size={17} />
          </Link>
        </div>
        <div className="banner-art">
          <span className="art-orbit orbit-one" />
          <span className="art-orbit orbit-two" />
          <Landscape />
          <div className="art-label">
            <Icon name="Sprout" size={18} />
            <span>
              Boas conexões.
              <br />
              <strong>Novos caminhos.</strong>
            </span>
          </div>
        </div>
      </section>
      <div className="metrics-grid">
        {role === 'cliente' ? (
          <>
            <Metric
              title="Solicitações ativas"
              value={active.length}
              icon="Layers"
              detail="movimentando sua empresa"
              color="green"
            />
            <Metric
              title="Aguardando sua ação"
              value={pending.length}
              icon="Clock3"
              detail="propostas e entregas"
              color="orange"
            />
            <Metric
              title="Obras ativas"
              value={data.works.filter((w) => w.progress < 100).length}
              icon="HardHat"
              detail="projetos sob controle"
              color="blue"
            />
            <Metric
              title="Serviços concluídos"
              value={done.length}
              icon="CircleCheck"
              detail="entregas aprovadas"
              color="purple"
            />
          </>
        ) : role === 'admin' ? (
          <>
            <Metric
              title="Empresas na plataforma"
              value={1 + (data.otherCompanies?.length || 0)}
              icon="Building2"
              detail="negócios conectados"
            />
            <Metric
              title="Recebimentos confirmados"
              value={shortMoney(paid.reduce((a, i) => a + i.value, 0))}
              icon="Wallet"
              detail="pagamentos demonstrativos"
              color="blue"
            />
            <Metric
              title="Solicitações ativas"
              value={active.length}
              icon="ClipboardList"
              detail="na operação"
              color="orange"
            />
            <Metric
              title="Especialistas parceiros"
              value={specialists.length}
              icon="Users"
              detail="em 7 áreas de atuação"
              color="purple"
            />
          </>
        ) : (
          <>
            <Metric
              title="Demandas ativas"
              value={active.length}
              icon="ClipboardList"
              detail="projetos em sua carteira"
            />
            <Metric
              title="Novas solicitações"
              value={visibleRequests.filter((r) => r.status === 'Em análise').length}
              icon="Inbox"
              detail="aguardando proposta"
              color="orange"
            />
            <Metric
              title="Remuneração prevista"
              value={shortMoney(providerPaid.reduce((a, i) => a + i.value * 0.8, 0))}
              icon="Wallet"
              detail="participação ilustrativa de 80%"
              color="blue"
            />
            <Metric
              title="Avaliação média"
              value="4,9"
              icon="Star"
              detail="rede de especialistas"
              color="purple"
            />
          </>
        )}
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-main">
          <section className="panel">
            <SectionTitle
              title={role === 'prestador' ? 'Sua carteira de projetos' : 'Solicitações recentes'}
              subtitle="Cada demanda, um passo à frente."
              to="/solicitacoes"
            />
            <RequestTable requests={visibleRequests.slice(0, 4)} compact />
            <Link
              to={role === 'cliente' ? '/solicitacoes/nova' : '/solicitacoes'}
              className="panel-bottom-link"
            >
              <Icon name={role === 'cliente' ? 'Plus' : 'ArrowRight'} size={16} />
              {role === 'cliente' ? 'Criar uma nova solicitação' : 'Ver todas as solicitações'}
            </Link>
          </section>
          <section className="services-section">
            <SectionTitle
              title={role === 'cliente' ? 'Apoio para cada desafio' : 'Nossa rede de soluções'}
              subtitle="Expertise de verdade para o seu setor."
              to={role === 'prestador' ? '/suporte' : '/servicos'}
              label={role === 'prestador' ? 'Falar com a equipe' : 'Conhecer todos'}
            />
            <div className="quick-services">
              {services.slice(0, 4).map((s) => (
                <Link
                  key={s.id}
                  to={role === 'prestador' ? '/solicitacoes' : `/servicos?categoria=${s.id}`}
                >
                  <ServiceIcon service={s} />
                  <h3>{s.name}</h3>
                  <p>{s.tagline}</p>
                  <Icon className="quick-arrow" name="ArrowUpRight" size={17} />
                </Link>
              ))}
            </div>
          </section>
        </div>
        <aside className="dashboard-side">
          {role === 'cliente' ? (
            <>
              <section className="plan-summary">
                <div className="plan-summary-top">
                  <span>
                    <Icon name="Sparkles" size={17} />
                    SEU PLANO
                  </span>
                  <Status>{data.subscription.active ? 'Ativo' : 'Cancelado'}</Status>
                </div>
                <h3>{data.subscription.active ? plan.name : 'Acesso avulso'}</h3>
                <p>O apoio que acompanha o seu ritmo.</p>
                <div className="plan-price">
                  {data.subscription.active ? money(plan.price) : money(0)}
                  <small>/mês</small>
                </div>
                <div className="plan-usage">
                  <span>
                    Consultas de orientação
                    <strong>
                      {data.subscription.active ? data.subscription.used : 0} de{' '}
                      {data.subscription.active ? plan.quota : 0}
                    </strong>
                  </span>
                  <Progress
                    value={
                      data.subscription.active && plan.quota
                        ? (data.subscription.used / plan.quota) * 100
                        : 0
                    }
                  />
                  <small>
                    {data.subscription.active && plan.quota
                      ? 'Franquia ilustrativa do mês atual'
                      : 'Consultas contratadas separadamente'}
                  </small>
                </div>
                <Link to="/planos" className="btn btn-outline-light btn-full">
                  Gerenciar meu plano
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </section>
              <section className="panel attention-panel">
                <SectionTitle title="No seu radar" />
                {upcoming.map((request) => (
                  <div className="agenda-item" key={request.id}>
                    <span className="agenda-date">
                      {new Date(`${request.due}T12:00:00`).getDate()}
                      <small>
                        {new Date(`${request.due}T12:00:00`)
                          .toLocaleDateString('pt-BR', { month: 'short' })
                          .replace('.', '')
                          .toUpperCase()}
                      </small>
                    </span>
                    <div>
                      <strong>{request.title}</strong>
                      <p>{request.status}</p>
                      <Link to={`/solicitacoes/${request.id}`}>
                        Acompanhar
                        <Icon name="ArrowRight" size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
                {!upcoming.length && (
                  <p className="radar-empty">Tudo em dia. Seus próximos prazos aparecerão aqui.</p>
                )}
              </section>
            </>
          ) : (
            <section className="panel attention-panel">
              <SectionTitle title="Próximas entregas" />
              {active.slice(0, 4).map((r) => (
                <Link className="deadline-link" key={r.id} to={`/solicitacoes/${r.id}`}>
                  <ServiceIcon service={r.service} small />
                  <div>
                    <strong>{r.title}</strong>
                    <small>
                      {r.id} · {formatDate(r.due)}
                    </small>
                  </div>
                  <Icon name="ChevronRight" size={16} />
                </Link>
              ))}
            </section>
          )}
          <div className="purpose-note">
            <Icon name="Leaf" size={23} />
            <p>
              Grandes transformações
              <br />
              começam com boas conexões.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
