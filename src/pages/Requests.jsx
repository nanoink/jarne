import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { services, specialists, plans, dateOffset } from '../data';
import { useStore } from '../store';
import {
  calculatePrice,
  canTransition,
  formatDate,
  fullDate,
  isClosed,
  money,
  nextId,
  stageProgress,
} from '../domain';
import {
  Confirm,
  Empty,
  Icon,
  Modal,
  PageTitle,
  Progress,
  RequestTable,
  SearchInput,
  SectionTitle,
  ServiceIcon,
  Status,
  downloadDocument,
  downloadPDF,
  exportCSV,
  readUpload,
} from '../components';
import { Checkout } from './Billing';

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const { role, data } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos os serviços');
  const selected = services.find((s) => s.id === params.get('categoria'));
  const categories = [
    'Todos os serviços',
    'Técnico e jurídico',
    'Financeiro e seguros',
    'Gestão e crescimento',
  ];
  const groups = {
    'Técnico e jurídico': ['juridico', 'engenharia', 'obras'],
    'Financeiro e seguros': ['financeiro', 'seguros'],
    'Gestão e crescimento': ['marketing', 'comercial'],
  };
  const filtered = services.filter(
    (s) =>
      (!groups[filter] || groups[filter].includes(s.id)) &&
      `${s.name} ${s.description} ${s.items.join(' ')}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="CONHECIMENTO QUE IMPULSIONA"
        title="O apoio certo. No momento certo."
        subtitle="Especialistas que entendem o seu negócio e os desafios do setor ambiental."
      />
      <div className="catalog-banner">
        <span className="catalog-banner-icon">
          <Icon name="Handshake" size={30} />
        </span>
        <div>
          <strong>Você cuida do meio ambiente. A gente cuida dos próximos passos.</strong>
          <p>Contrate um serviço avulso ou aproveite as condições do seu plano.</p>
        </div>
        <Link className="text-link" to="/planos">
          Conhecer os planos
          <Icon name="ArrowUpRight" size={17} />
        </Link>
      </div>
      <div className="filter-toolbar">
        <div className="tabs">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={filter === c ? 'active' : ''}>
              {c}
            </button>
          ))}
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Qual apoio você precisa?" />
      </div>
      <div className="catalog-grid">
        {filtered.map((s) => (
          <article className="service-card" key={s.id}>
            <div className="service-card-head">
              <ServiceIcon service={s} size={26} />
              <span className="service-time">
                <Icon name="Clock3" size={13} />
                {s.deadline}
              </span>
            </div>
            <h2>{s.name}</h2>
            <p>{s.description}</p>
            <ul>
              {s.items.slice(0, 3).map((item) => (
                <li key={item}>
                  <Icon name="Check" size={14} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="service-card-bottom">
              <div>
                <small>{s.price ? 'A partir de' : 'Feito para sua empresa'}</small>
                <strong>{s.price ? money(s.price) : 'Sob consulta'}</strong>
              </div>
              <button className="btn btn-secondary" onClick={() => setParams({ categoria: s.id })}>
                Conhecer
                <Icon name="ArrowUpRight" size={16} />
              </button>
            </div>
          </article>
        ))}
        <article className="service-card custom-service">
          <Icon name="Sprout" size={38} />
          <h2>Seu desafio é único?</h2>
          <p>Vamos entender o que sua empresa precisa e encontrar o melhor caminho juntos.</p>
          <Link className="btn btn-primary" to="/suporte">
            Conversar com a Vereda
            <Icon name="ArrowUpRight" size={16} />
          </Link>
        </article>
      </div>
      {filtered.length === 0 && (
        <Empty
          title="Nenhum serviço encontrado"
          text="Tente buscar por orçamento, contratos, marketing ou obras."
        />
      )}
      {selected && (
        <Modal wide title={selected.name} subtitle={selected.tagline} onClose={() => setParams({})}>
          <div className="modal-body service-detail">
            <div>
              <ServiceIcon service={selected} size={30} />
              <p>{selected.description}</p>
              <h3>Como podemos apoiar</h3>
              <ul className="check-list">
                {selected.items.map((i) => (
                  <li key={i}>
                    <Icon name="Check" size={17} />
                    {i}
                  </li>
                ))}
              </ul>
              <h3>O que você recebe</h3>
              <ul className="check-list">
                {selected.deliverables.map((i) => (
                  <li key={i}>
                    <Icon name="FileCheck2" size={17} />
                    {i}
                  </li>
                ))}
              </ul>
              <div className="info-note">
                <Icon name="Info" size={18} />
                <p>{selected.note}</p>
              </div>
            </div>
            <aside className="service-detail-aside">
              <span className="eyebrow">CONTRATAÇÃO AVULSA</span>
              <h2>{selected.price ? money(selected.price) : 'Sob consulta'}</h2>
              <p>
                {selected.price
                  ? 'Valor inicial ilustrativo. O preço final é definido na proposta.'
                  : 'Receba uma proposta de acordo com sua necessidade.'}
              </p>
              <div className="detail-fact">
                <Icon name="Clock3" />
                <span>
                  Prazo estimado<strong>{selected.deadline}</strong>
                </span>
              </div>
              <div className="specialist-inline">
                <span className={`avatar tone-${selected.color}`}>
                  {specialists.find((p) => p.id === selected.specialist)?.initials}
                </span>
                <div>
                  <strong>{specialists.find((p) => p.id === selected.specialist)?.name}</strong>
                  <small>Especialista Vereda · ★ 4,9</small>
                </div>
              </div>
              {data.subscription.active && selected.price && (
                <div className="discount-note">
                  <Icon name="BadgePercent" size={20} />
                  Seu plano tem {plans.find((p) => p.id === data.subscription.plan).discount * 100}%
                  de desconto em serviços elegíveis.
                </div>
              )}
              <Link
                className="btn btn-primary btn-full"
                to={
                  role === 'cliente' ? `/solicitacoes/nova?servico=${selected.id}` : '/solicitacoes'
                }
              >
                {role === 'cliente' ? 'Solicitar este serviço' : 'Ver solicitações'}
                <Icon name="ArrowRight" size={16} />
              </Link>
              <small className="secure-note">
                <Icon name="CircleCheck" size={13} />
                Você aprova a proposta antes de contratar.
              </small>
            </aside>
          </div>
        </Modal>
      )}
    </>
  );
}

const extraFields = {
  engenharia: [
    { label: 'Área aproximada (m²)', type: 'number' },
    { label: 'Local de execução', type: 'text' },
  ],
  juridico: [
    { label: 'Tipo de documento', type: 'text' },
    { label: 'Quantidade de páginas', type: 'number' },
  ],
  financeiro: [
    { label: 'Crédito pretendido (R$)', type: 'number' },
    { label: 'Prazo pretendido (meses)', type: 'number' },
  ],
  seguros: [
    { label: 'Valor do contrato (R$)', type: 'number' },
    { label: 'Duração da obra (meses)', type: 'number' },
  ],
  marketing: [
    { label: 'Canais prioritários', type: 'text' },
    { label: 'Objetivo da campanha', type: 'text' },
  ],
  comercial: [
    { label: 'Segmento de clientes', type: 'text' },
    { label: 'Região de atuação', type: 'text' },
  ],
  obras: [
    { label: 'Local da obra', type: 'text' },
    { label: 'Orçamento da obra (R$)', type: 'number' },
  ],
};
export function NewRequest() {
  const { data, update, notify } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [service, setService] = useState(
    services.some((s) => s.id === params.get('servico')) ? params.get('servico') : 'engenharia',
  );
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const selected = services.find((s) => s.id === service);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const attachment = file ? await readUpload(file, data.documents) : null;
      const id = nextId(data.requests, 'VR', 1049);
      const extra = extraFields[service]
        .map((f) => `${f.label}: ${form.get(f.label) || 'Não informado'}`)
        .join('\n');
      const request = {
        id,
        company: 'c1',
        title: form.get('title').trim(),
        service,
        type: form.get('type'),
        status: 'Em análise',
        specialist: selected.specialist,
        priority: form.get('priority'),
        created: dateOffset(),
        due: form.get('due'),
        description: form.get('description').trim(),
        extra,
        value: 0,
        history: [
          {
            id: crypto.randomUUID(),
            text: 'Solicitação recebida e encaminhada ao especialista',
            date: dateOffset(),
          },
        ],
        messages: [],
      };
      update((current) => ({
        ...current,
        requests: [request, ...current.requests],
        documents: attachment
          ? [
              { ...attachment, category: selected.name, request: id, date: dateOffset() },
              ...current.documents,
            ]
          : current.documents,
      }));
      notify('Solicitação enviada! O especialista já pode preparar sua proposta.');
      navigate(`/solicitacoes/${id}`);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link className="back-link" to="/solicitacoes">
        <Icon name="ArrowLeft" size={16} />
        Voltar para solicitações
      </Link>
      <PageTitle
        title="Vamos dar o próximo passo?"
        subtitle="Conte um pouco sobre o que sua empresa precisa. Nós conectamos você ao apoio certo."
      />
      <div className="form-columns">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="form-section-heading">
            <span>01</span>
            <div>
              <h2>Escolha o serviço</h2>
              <p>Selecione a área e o tipo de apoio.</p>
            </div>
          </div>
          <label>
            Área de atendimento
            <select
              value={service}
              onChange={(e) => {
                setService(e.target.value);
              }}
              name="service"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo de serviço
            <select key={service} name="type">
              {selected.items.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <div className="form-section-heading">
            <span>02</span>
            <div>
              <h2>Sobre a sua demanda</h2>
              <p>Quanto mais contexto, melhor a proposta.</p>
            </div>
          </div>
          <label>
            Título da solicitação
            <input
              name="title"
              required
              minLength={5}
              maxLength={120}
              placeholder="Ex.: Orçamento de recuperação de taludes — BR-381"
            />
          </label>
          <label>
            Descreva o que você precisa
            <textarea
              name="description"
              rows={5}
              required
              minLength={20}
              maxLength={4000}
              placeholder="Conte sobre o projeto, os objetivos e os entregáveis esperados (mínimo de 20 caracteres)."
            />
          </label>
          <div className="form-row" key={`extras-${service}`}>
            {extraFields[service].map((field) => (
              <label key={field.label}>
                {field.label}
                <input
                  name={field.label}
                  type={field.type}
                  min={field.type === 'number' ? 1 : undefined}
                  maxLength={120}
                  placeholder="Opcional"
                />
              </label>
            ))}
          </div>
          <div className="form-row">
            <label>
              Prazo desejado
              <input
                name="due"
                type="date"
                min={dateOffset()}
                defaultValue={dateOffset(7)}
                required
              />
            </label>
            <label>
              Prioridade
              <select name="priority">
                <option>Normal</option>
                <option>Alta</option>
                <option>Baixa</option>
              </select>
            </label>
          </div>
          <label>
            Documento de referência <small>(opcional)</small>
            <span className="file-zone">
              <Icon name="UploadCloud" size={25} />
              <strong>{file ? file.name : 'Selecionar um arquivo'}</strong>
              <small>PDF, imagem ou documento · até 1 MB</small>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
            </span>
          </label>
          <div className="info-note">
            <Icon name="Info" size={18} />
            <p>
              Esta solicitação não gera cobrança. Você receberá uma proposta com valor e prazo para
              aprovar.
            </p>
          </div>
          <div className="form-footer">
            <Link className="btn btn-secondary" to="/solicitacoes">
              Cancelar
            </Link>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Enviando...' : 'Enviar solicitação'}
              <Icon name="ArrowRight" size={17} />
            </button>
          </div>
        </form>
        <aside>
          <div className="panel request-help">
            <ServiceIcon service={selected} size={28} />
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            <div className="detail-fact">
              <Icon name="Clock3" />
              <span>
                Prazo de referência<strong>{selected.deadline}</strong>
              </span>
            </div>
            <h3>Como funciona</h3>
            <ol className="numbered-list">
              <li>
                <span>1</span>Você descreve sua necessidade.
              </li>
              <li>
                <span>2</span>O especialista envia uma proposta.
              </li>
              <li>
                <span>3</span>Você aprova e simula o pagamento.
              </li>
              <li>
                <span>4</span>Acompanhe a execução e a entrega.
              </li>
            </ol>
            <small>{selected.note}</small>
          </div>
        </aside>
      </div>
    </>
  );
}

export function Requests() {
  const { visibleRequests, role } = useStore();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('Todas');
  const [category, setCategory] = useState('');
  const [view, setView] = useState('list');
  const [page, setPage] = useState(1);
  const filtered = visibleRequests.filter(
    (r) =>
      `${r.title} ${r.id}`.toLowerCase().includes(query.toLowerCase()) &&
      (!category || r.service === category) &&
      (tab === 'Todas' ||
        (tab === 'Em aberto'
          ? !isClosed(r.status)
          : tab === 'Concluídas'
            ? r.status === 'Concluído'
            : r.status === 'Cancelado')),
  );
  const paginated = filtered.slice((page - 1) * 6, page * 6);
  const filterChange = (action) => {
    action();
    setPage(1);
  };
  return (
    <>
      <PageTitle
        title={role === 'cliente' ? 'Minhas solicitações' : 'Solicitações'}
        subtitle="Tudo o que está acontecendo, do primeiro contato à entrega."
      >
        <button
          className="btn btn-secondary"
          onClick={() =>
            exportCSV('vereda-solicitacoes.csv', [
              ['Código', 'Solicitação', 'Serviço', 'Status', 'Prazo', 'Valor'],
              ...filtered.map((r) => [r.id, r.title, r.service, r.status, r.due, r.value]),
            ])
          }
        >
          <Icon name="Download" size={17} />
          Exportar
        </button>
        {role === 'cliente' && (
          <Link className="btn btn-primary" to="/solicitacoes/nova">
            <Icon name="Plus" size={18} />
            Nova solicitação
          </Link>
        )}
      </PageTitle>
      <section className="panel">
        <div className="list-tabs">
          {['Todas', 'Em aberto', 'Concluídas', 'Canceladas'].map((t) => (
            <button
              key={t}
              className={t === tab ? 'active' : ''}
              onClick={() => filterChange(() => setTab(t))}
            >
              {t}
              {t === 'Todas' && <span>{visibleRequests.length}</span>}
            </button>
          ))}
        </div>
        <div className="list-filters">
          <SearchInput
            value={query}
            onChange={(v) => filterChange(() => setQuery(v))}
            placeholder="Buscar por nome ou código..."
          />
          <select
            aria-label="Filtrar por serviço"
            value={category}
            onChange={(e) => filterChange(() => setCategory(e.target.value))}
          >
            <option value="">Todos os serviços</option>
            {services.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="view-switch">
            <button
              aria-label="Visualizar em lista"
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              <Icon name="List" size={18} />
            </button>
            <button
              aria-label="Visualizar em cartões"
              className={view === 'grid' ? 'active' : ''}
              onClick={() => setView('grid')}
            >
              <Icon name="LayoutGrid" size={18} />
            </button>
          </div>
        </div>
        {view === 'list' ? (
          <RequestTable requests={paginated} compact />
        ) : (
          <div className="request-grid">
            {paginated.map((r) => (
              <Link key={r.id} className="request-card" to={`/solicitacoes/${r.id}`}>
                <div>
                  <ServiceIcon service={r.service} />
                  <Status>{r.status}</Status>
                </div>
                <small>{r.id}</small>
                <h3>{r.title}</h3>
                <Progress value={stageProgress(r.status)} />
                <footer>
                  <span>Prazo · {formatDate(r.due)}</span>
                  <Icon name="ArrowUpRight" size={17} />
                </footer>
              </Link>
            ))}
            {!paginated.length && <Empty title="Nenhuma solicitação encontrada" />}
          </div>
        )}
        <div className="pagination">
          <span>
            {filtered.length
              ? `${(page - 1) * 6 + 1}–${Math.min(page * 6, filtered.length)} de ${filtered.length}`
              : '0 resultados'}{' '}
            solicitações
          </span>
          <div>
            <button
              className="icon-btn"
              aria-label="Página anterior"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <Icon name="ChevronLeft" size={17} />
            </button>
            <span>{page}</span>
            <button
              className="icon-btn"
              aria-label="Próxima página"
              disabled={page * 6 >= filtered.length}
              onClick={() => setPage(page + 1)}
            >
              <Icon name="ChevronRight" size={17} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export function RequestDetail() {
  const { id } = useParams();
  const { data, update, visibleRequests, role, user, notify, patchRequest } = useStore();
  const request = visibleRequests.find((r) => r.id === id);
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [uploading, setUploading] = useState(false);
  if (!request)
    return (
      <Empty
        title="Solicitação não encontrada"
        text="Ela pode não estar disponível para este perfil."
      >
        <Link className="btn btn-primary" to="/solicitacoes">
          Voltar às solicitações
        </Link>
      </Empty>
    );
  const service = services.find((s) => s.id === request.service);
  const specialist = specialists.find((p) => p.id === request.specialist);
  const documents = data.documents.filter((d) => d.request === id);
  const invoice = data.invoices.find((i) => i.request === id && i.status !== 'Cancelado');
  const isStaff = ['admin', 'prestador'].includes(role);
  function transition(status, patch, text) {
    if (!canTransition(request.status, status)) {
      notify('Esta ação não está disponível na etapa atual.', 'error');
      return;
    }
    patchRequest(id, { ...patch, status }, text);
    notify('Solicitação atualizada.');
    setModal(null);
  }
  function acceptProposal() {
    if (request.status !== 'Proposta recebida') return;
    const invoiceId = nextId(data.invoices, 'FAT', 2008);
    update((current) => ({
      ...current,
      requests: current.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Aguardando pagamento',
              history: [
                ...r.history,
                {
                  id: crypto.randomUUID(),
                  text: 'Proposta aprovada e aceite demonstrativo registrado',
                  date: dateOffset(),
                },
              ],
            }
          : r,
      ),
      invoices: [
        {
          id: invoiceId,
          company: request.company,
          request: id,
          title: request.title,
          value: request.proposal.value,
          status: 'Pendente',
          due: dateOffset(3),
          created: dateOffset(),
          kind: 'service',
        },
        ...current.invoices,
      ],
    }));
    notify('Proposta aprovada! Simule o pagamento para iniciar o serviço.');
    setModal(null);
  }
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    patchRequest(id, {
      messages: [
        ...request.messages,
        {
          id: crypto.randomUUID(),
          author: role === 'cliente' ? data.company.contact : user.name,
          role,
          text: message.trim(),
          date: dateOffset(),
        },
      ],
    });
    setMessage('');
    notify('Mensagem adicionada à conversa de demonstração.');
  };
  const attach = async (event) => {
    const input = event.target;
    const file = input.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const doc = await readUpload(file, data.documents);
      update((current) => ({
        ...current,
        documents: [
          { ...doc, request: id, category: service.name, date: dateOffset() },
          ...current.documents,
        ],
      }));
      notify('Arquivo anexado à solicitação.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setUploading(false);
      input.value = '';
    }
  };
  return (
    <>
      <Link className="back-link" to="/solicitacoes">
        <Icon name="ArrowLeft" size={16} />
        Voltar para solicitações
      </Link>
      <PageTitle
        eyebrow={`${id} · ${service.name.toUpperCase()}`}
        title={request.title}
        subtitle={`Criada em ${fullDate(request.created)} · ${request.company === 'c1' ? data.company.shortName : 'Verde Vivo Soluções Ambientais'}`}
      >
        <Status>{request.status}</Status>
      </PageTitle>
      {role === 'cliente' && request.status === 'Proposta recebida' && (
        <div className="action-banner">
          <Icon name="FileCheck2" size={24} />
          <div>
            <strong>Uma proposta pronta para o seu próximo passo.</strong>
            <p>Confira o escopo, o valor e o prazo antes de aprovar.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal('accept')}>
            Analisar proposta
            <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      )}
      {request.status === 'Aguardando pagamento' && role === 'cliente' && (
        <div className="action-banner">
          <Icon name="Wallet" size={24} />
          <div>
            <strong>Falta só confirmar o pagamento.</strong>
            <p>Use Pix, cartão ou boleto para simular a contratação.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal('checkout')}>
            Simular pagamento
          </button>
        </div>
      )}
      <div className="detail-columns">
        <div className="detail-main">
          <section className="panel detail-panel">
            <SectionTitle title="Sobre a solicitação" />
            <p className="preserve-lines">{request.description}</p>
            {request.extra && <div className="extra-details preserve-lines">{request.extra}</div>}
            <div className="detail-facts-grid">
              <div>
                <small>Tipo de serviço</small>
                <strong>{request.type}</strong>
              </div>
              <div>
                <small>Prioridade</small>
                <strong className={request.priority === 'Alta' ? 'text-orange' : ''}>
                  {request.priority}
                </strong>
              </div>
              <div>
                <small>Prazo desejado</small>
                <strong>{fullDate(request.due)}</strong>
              </div>
              <div>
                <small>Valor contratado / proposto</small>
                <strong>{request.value ? money(request.value) : 'A definir na proposta'}</strong>
              </div>
            </div>
          </section>
          {request.proposal && (
            <section className="panel detail-panel">
              <SectionTitle title="Proposta de atendimento" />
              <p>{request.proposal.description}</p>
              <div className="proposal-summary">
                <div>
                  <small>Investimento total</small>
                  <strong>{money(request.proposal.value)}</strong>
                </div>
                <div>
                  <small>Entrega prevista</small>
                  <strong>{fullDate(request.proposal.due)}</strong>
                </div>
              </div>
              {request.proposal.originalValue > request.proposal.value && (
                <p className="discount-text">
                  Desconto do plano aplicado:{' '}
                  {money(request.proposal.originalValue - request.proposal.value)}.
                </p>
              )}
              <button
                className="text-link"
                onClick={() =>
                  downloadPDF(
                    `Proposta-${id}`,
                    `PROPOSTA DEMONSTRATIVA ${id}\n${request.title}\n\n${request.proposal.description}\n\nValor: ${money(request.proposal.value)}\nPrazo: ${fullDate(request.proposal.due)}\nEspecialista: ${specialist?.name}\n\nAceite, assinatura e pagamento são simulados nesta versão.`,
                  )
                }
              >
                <Icon name="Download" size={16} />
                Baixar proposta em PDF
              </button>
            </section>
          )}
          {request.delivery && (
            <section className="panel detail-panel delivery-panel">
              <SectionTitle title="Entrega do especialista" />
              <div className="delivery-note">
                <Icon name="PackageCheck" size={25} />
                <p className="preserve-lines">{request.delivery}</p>
              </div>
              {request.status === 'Aguardando aprovação' && role === 'cliente' && (
                <div className="inline-actions">
                  <button className="btn btn-primary" onClick={() => setModal('approve')}>
                    Aprovar entrega
                  </button>
                  <button className="btn btn-secondary" onClick={() => setModal('revision')}>
                    Solicitar ajuste
                  </button>
                </div>
              )}
              {request.rating && (
                <div className="rating-display">
                  {'★'.repeat(request.rating)}
                  <span>Entrega avaliada pela empresa</span>
                </div>
              )}
            </section>
          )}
          <section className="panel detail-panel">
            <SectionTitle title="Documentos da solicitação" />
            <div className="document-list">
              {documents.map((d) => (
                <div key={d.id} className="document-row">
                  <span className="file-icon">
                    <Icon name="FileText" size={20} />
                  </span>
                  <div>
                    <strong>{d.name}</strong>
                    <small>
                      {d.size} · {formatDate(d.date)}
                    </small>
                  </div>
                  <button
                    className="icon-btn"
                    aria-label={`Baixar ${d.name}`}
                    onClick={() => downloadDocument(d)}
                  >
                    <Icon name="Download" size={18} />
                  </button>
                </div>
              ))}
              {!documents.length && <p className="muted">Nenhum documento anexado.</p>}
            </div>
            {!isClosed(request.status) && (
              <label className="upload-button btn btn-secondary">
                <Icon name="Paperclip" size={16} />
                {uploading ? 'Anexando...' : 'Anexar arquivo'}
                <input
                  disabled={uploading}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
                  onChange={attach}
                />
              </label>
            )}
          </section>
          <section className="panel detail-panel">
            <SectionTitle
              title="Conversa com o especialista"
              subtitle="Mensagens salvas apenas nesta demonstração, sem envio externo."
            />
            <div className="messages">
              {!request.messages.length && (
                <div className="message-empty">
                  <Icon name="MessagesSquare" size={25} />
                  <p>
                    Uma boa conversa é o começo de tudo.
                    <br />
                    Deixe sua primeira mensagem.
                  </p>
                </div>
              )}
              {request.messages.map((m) => (
                <div key={m.id} className={`message ${m.role === role ? 'message-own' : ''}`}>
                  <div>
                    <strong>{m.author}</strong>
                    <small>{formatDate(m.date)}</small>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            {!isClosed(request.status) && (
              <form className="message-form" onSubmit={sendMessage}>
                <input
                  aria-label="Sua mensagem"
                  placeholder="Escreva sua mensagem..."
                  maxLength={1500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <button
                  className="btn btn-primary"
                  aria-label="Enviar mensagem"
                  disabled={!message.trim()}
                >
                  <Icon name="Send" size={18} />
                </button>
              </form>
            )}
          </section>
        </div>
        <aside>
          <section className="panel detail-panel">
            <h3>Seu especialista</h3>
            <div className="specialist-profile">
              <span className={`avatar avatar-lg tone-${service.color}`}>
                {specialist?.initials}
              </span>
              <h3>{specialist?.name || 'Em definição'}</h3>
              <p>{specialist?.role}</p>
              <span className="star-rating">
                ★ {specialist?.rating} <small>· {specialist?.projects} projetos</small>
              </span>
            </div>
            <div className="specialist-credential">
              <Icon name="BadgeCheck" size={16} />
              {specialist?.credential}
            </div>
          </section>
          <section className="panel detail-panel">
            <h3>Acompanhe cada etapa</h3>
            <div className="detail-progress">
              <span>
                Progresso da solicitação<strong>{stageProgress(request.status)}%</strong>
              </span>
              <Progress value={stageProgress(request.status)} />
            </div>
            <ol className="timeline">
              {request.history.map((event, index) => (
                <li
                  key={event.id}
                  className={index === request.history.length - 1 ? 'current' : ''}
                >
                  <i />
                  <div>
                    <strong>{event.text}</strong>
                    <small>{formatDate(event.date)}</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          {isStaff && !isClosed(request.status) && (
            <section className="panel detail-panel staff-actions">
              <h3>Ações do {role === 'admin' ? 'administrador' : 'prestador'}</h3>
              {request.status === 'Em análise' && (
                <button className="btn btn-primary btn-full" onClick={() => setModal('proposal')}>
                  Enviar proposta
                  <Icon name="FilePlus2" size={17} />
                </button>
              )}
              {request.status === 'Contratado' && (
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => transition('Em andamento', {}, `${user.name} iniciou a execução`)}
                >
                  Iniciar execução
                </button>
              )}
              {request.status === 'Em andamento' && (
                <button className="btn btn-primary btn-full" onClick={() => setModal('delivery')}>
                  Registrar entrega
                  <Icon name="PackageCheck" size={17} />
                </button>
              )}
              {['Proposta recebida', 'Aguardando pagamento', 'Aguardando aprovação'].includes(
                request.status,
              ) && (
                <p className="muted">
                  Aguardando a próxima ação da empresa. Troque para o perfil Empresa para continuar
                  o fluxo.
                </p>
              )}
            </section>
          )}
          {role === 'cliente' &&
            ['Em análise', 'Proposta recebida', 'Aguardando pagamento'].includes(
              request.status,
            ) && (
              <button
                className="text-link text-danger cancel-request"
                onClick={() => setModal('cancel')}
              >
                Cancelar solicitação
              </button>
            )}
        </aside>
      </div>
      {modal === 'accept' && (
        <Modal title="Aprovar proposta" onClose={() => setModal(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              acceptProposal();
            }}
          >
            <div className="modal-body">
              <div className="proposal-summary">
                <div>
                  <small>Valor total</small>
                  <strong>{money(request.proposal.value)}</strong>
                </div>
                <div>
                  <small>Entrega</small>
                  <strong>{fullDate(request.proposal.due)}</strong>
                </div>
              </div>
              <p>{request.proposal.description}</p>
              <label>
                Nome do responsável pelo aceite
                <input required minLength={3} defaultValue={data.company.contact} />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" required />
                Li o escopo e registro o aceite demonstrativo desta proposta.
              </label>
              <div className="info-note">
                <Icon name="Info" size={18} />
                <p>O aceite e a assinatura são simulados e não têm validade contratual.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
                Voltar
              </button>
              <button className="btn btn-primary">Aprovar e continuar</button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'checkout' && invoice && (
        <Checkout invoice={invoice} onClose={() => setModal(null)} />
      )}
      {modal === 'proposal' && (
        <Modal
          title="Enviar proposta"
          subtitle="Defina os entregáveis, o investimento e o prazo."
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const values = new FormData(e.currentTarget);
              const originalValue = Number(values.get('value'));
              const discount =
                data.subscription.active && request.company === 'c1' && service.price
                  ? plans.find((p) => p.id === data.subscription.plan).discount
                  : 0;
              const value = calculatePrice(originalValue, discount);
              transition(
                'Proposta recebida',
                {
                  value,
                  due: values.get('due'),
                  proposal: {
                    value,
                    originalValue,
                    due: values.get('due'),
                    description: values.get('description').trim(),
                  },
                },
                `${user.name} enviou uma proposta de ${money(value)}`,
              );
            }}
          >
            <div className="modal-body">
              <label>
                Escopo e entregáveis
                <textarea
                  name="description"
                  required
                  minLength={15}
                  maxLength={3000}
                  rows={4}
                  placeholder="Descreva o que será entregue e os limites do atendimento."
                />
              </label>
              <div className="form-row">
                <label>
                  Valor bruto (R$)
                  <input
                    type="number"
                    name="value"
                    min="1"
                    max="10000000"
                    step="0.01"
                    defaultValue={service.price || 500}
                    required
                  />
                </label>
                <label>
                  Prazo de entrega
                  <input
                    type="date"
                    name="due"
                    min={dateOffset()}
                    defaultValue={request.due < dateOffset() ? dateOffset(7) : request.due}
                    required
                  />
                </label>
              </div>
              <p className="muted">
                O desconto do plano será aplicado automaticamente aos serviços elegíveis. Preços
                demonstrativos.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Enviar proposta</button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'delivery' && (
        <Modal
          title="Registrar entrega"
          subtitle="Descreva o resultado e anexe os materiais na solicitação."
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const delivery = new FormData(e.currentTarget).get('delivery').trim();
              transition(
                'Aguardando aprovação',
                { delivery },
                `${user.name} registrou a entrega para aprovação`,
              );
            }}
          >
            <div className="modal-body">
              <label>
                Resumo da entrega
                <textarea
                  name="delivery"
                  rows={5}
                  required
                  minLength={20}
                  maxLength={4000}
                  placeholder="Conte o que foi executado e indique os materiais disponíveis."
                />
              </label>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
                Voltar
              </button>
              <button className="btn btn-primary">Enviar para aprovação</button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'approve' && (
        <Modal
          title="Tudo certo com a entrega?"
          subtitle="Sua avaliação ajuda nossa rede a ir mais longe."
          onClose={() => setModal(null)}
        >
          <div className="modal-body">
            <div className="star-selector" role="group" aria-label="Avaliação do serviço">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  aria-label={`${n} estrelas`}
                  aria-pressed={rating === n}
                  onClick={() => setRating(n)}
                  className={n <= rating ? 'selected' : ''}
                >
                  <Icon name="Star" size={33} />
                </button>
              ))}
            </div>
            <p className="center muted">
              Ao aprovar, a solicitação será concluída nesta demonstração.
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setModal(null)}>
              Voltar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => transition('Concluído', { rating }, 'Entrega aprovada pela empresa')}
            >
              Aprovar e concluir
            </button>
          </div>
        </Modal>
      )}
      {modal === 'revision' && (
        <Modal title="Solicitar um ajuste" onClose={() => setModal(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = new FormData(e.currentTarget).get('revision').trim();
              transition(
                'Em andamento',
                {
                  messages: [
                    ...request.messages,
                    {
                      id: crypto.randomUUID(),
                      author: data.company.contact,
                      role,
                      text: `Ajuste solicitado: ${text}`,
                      date: dateOffset(),
                    },
                  ],
                },
                'A empresa solicitou ajustes na entrega',
              );
            }}
          >
            <div className="modal-body">
              <label>
                O que precisa de ajuste?
                <textarea name="revision" required minLength={10} rows={4} maxLength={2000} />
              </label>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
                Voltar
              </button>
              <button className="btn btn-primary">Enviar solicitação de ajuste</button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'cancel' && (
        <Confirm
          title="Cancelar esta solicitação?"
          text="A solicitação será encerrada e eventuais faturas pendentes vinculadas a ela serão canceladas. Pagamentos já realizados não são alterados."
          danger
          label="Cancelar solicitação"
          onClose={() => setModal(null)}
          onConfirm={() => {
            update((current) => ({
              ...current,
              requests: current.requests.map((r) =>
                r.id === id
                  ? {
                      ...r,
                      status: 'Cancelado',
                      history: [
                        ...r.history,
                        {
                          id: crypto.randomUUID(),
                          text: 'Solicitação cancelada pela empresa',
                          date: dateOffset(),
                        },
                      ],
                    }
                  : r,
              ),
              invoices: current.invoices.map((i) =>
                i.request === id && i.status === 'Pendente' ? { ...i, status: 'Cancelado' } : i,
              ),
            }));
            notify('Solicitação cancelada.');
          }}
        />
      )}
    </>
  );
}
