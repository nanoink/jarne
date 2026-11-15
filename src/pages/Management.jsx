import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { dateOffset, plans, services, specialists } from '../data';
import { formatDate, fullDate, money, nextId, shortMoney } from '../domain';
import {
  Confirm,
  Empty,
  Icon,
  Metric,
  Modal,
  PageTitle,
  Progress,
  SearchInput,
  SectionTitle,
  ServiceIcon,
  Status,
  downloadDocument,
  exportCSV,
  readUpload,
} from '../components';

export function Documents() {
  const { data, role, visibleRequests, update, notify } = useStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [modal, setModal] = useState(false);
  const [remove, setRemove] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const visible = data.documents.filter(
    (d) =>
      role === 'admin' ||
      visibleRequests.some((r) => r.id === d.request) ||
      (!d.request && role === 'cliente'),
  );
  const filtered = visible.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) && (!category || d.category === category),
  );
  async function upload(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const doc = await readUpload(form.get('file'), data.documents);
      update((current) => ({
        ...current,
        documents: [
          {
            ...doc,
            request: form.get('request'),
            category: form.get('category'),
            date: dateOffset(),
          },
          ...current.documents,
        ],
      }));
      notify('Documento adicionado à demonstração.');
      setModal(false);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle title="Documentos" subtitle="O que você precisa, organizado e sempre à mão.">
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Icon name="Upload" size={17} />
          Adicionar documento
        </button>
      </PageTitle>
      <div className="document-overview">
        <div>
          <span className="file-icon">
            <Icon name="Files" size={25} />
          </span>
          <strong>
            {visible.length}
            <small>documentos disponíveis</small>
          </strong>
        </div>
        <div>
          <span className="file-icon">
            <Icon name="Folders" size={25} />
          </span>
          <strong>
            {new Set(visible.map((d) => d.category)).size}
            <small>categorias organizadas</small>
          </strong>
        </div>
        <p>
          <Icon name="Info" size={17} />
          Arquivos de até 1 MB · armazenamento temporário nesta aba
        </p>
      </div>
      <section className="panel">
        <div className="list-filters">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar documento..." />
          <select
            aria-label="Categoria do documento"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {[...new Set(visible.map((d) => d.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome do arquivo</th>
                <th>Categoria</th>
                <th>Solicitação</th>
                <th>Adicionado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <button className="document-name" onClick={() => setPreview(d)}>
                      <span className="file-icon">
                        <Icon
                          name={/\.(jpg|jpeg|png)$/i.test(d.name) ? 'Image' : 'FileText'}
                          size={21}
                        />
                      </span>
                      <span>
                        <strong>{d.name}</strong>
                        <small>{d.size}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className="category-pill">{d.category}</span>
                  </td>
                  <td>
                    {d.request ? (
                      <Link className="text-link" to={`/solicitacoes/${d.request}`}>
                        {d.request}
                      </Link>
                    ) : (
                      'Institucional'
                    )}
                  </td>
                  <td className="nowrap">{formatDate(d.date)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-btn"
                        aria-label={`Baixar ${d.name}`}
                        onClick={() => downloadDocument(d)}
                      >
                        <Icon name="Download" size={17} />
                      </button>
                      <button
                        className="icon-btn text-danger"
                        aria-label={`Excluir ${d.name}`}
                        onClick={() => setRemove(d)}
                      >
                        <Icon name="Trash2" size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <Empty
              title="Nenhum documento encontrado"
              text="Adicione um arquivo ou experimente outra busca."
            />
          )}
        </div>
      </section>
      {modal && (
        <Modal
          title="Adicionar documento"
          subtitle="Organize os materiais da sua empresa e dos seus projetos."
          onClose={() => setModal(false)}
        >
          <form onSubmit={upload}>
            <div className="modal-body">
              <label>
                Arquivo
                <input
                  name="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
                  required
                />
              </label>
              <label>
                Categoria
                <select name="category">
                  {[
                    'Institucional',
                    'Engenharia',
                    'Jurídico',
                    'Financeiro',
                    'Seguros',
                    'Marketing',
                    'Comercial',
                    'Obras',
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Vincular à solicitação
                <select name="request" required={role === 'prestador'}>
                  {role !== 'prestador' && <option value="">Documento institucional</option>}
                  {visibleRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} · {r.title}
                    </option>
                  ))}
                </select>
              </label>
              <p className="muted">
                Até 1 MB por arquivo e aproximadamente 2 MB de arquivos no total. Os dados são
                temporários.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" disabled={busy}>
                {busy ? 'Adicionando...' : 'Salvar documento'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {preview && (
        <Modal
          title={preview.name}
          subtitle={`${preview.category} · ${preview.size}`}
          onClose={() => setPreview(null)}
        >
          <div className="modal-body">
            {preview.content ? (
              <div className="document-preview preserve-lines">{preview.content}</div>
            ) : preview.dataUrl?.startsWith('data:image/') ? (
              <img className="image-preview" src={preview.dataUrl} alt={preview.name} />
            ) : (
              <div className="empty">
                <Icon name="FileText" size={40} />
                <p>Baixe o arquivo para visualizar o conteúdo.</p>
              </div>
            )}
            <button className="btn btn-primary" onClick={() => downloadDocument(preview)}>
              <Icon name="Download" size={17} />
              Baixar documento
            </button>
          </div>
        </Modal>
      )}
      {remove && (
        <Confirm
          title="Excluir este documento?"
          text={`O arquivo “${remove.name}” será removido desta demonstração.`}
          label="Excluir documento"
          danger
          onClose={() => setRemove(null)}
          onConfirm={() => {
            update((current) => ({
              ...current,
              documents: current.documents.filter((d) => d.id !== remove.id),
            }));
            notify('Documento excluído.');
          }}
        />
      )}
    </>
  );
}

export function Works() {
  const { data, update, notify } = useStore();
  const [query, setQuery] = useState('');
  const [edit, setEdit] = useState(null);
  const [detail, setDetail] = useState(null);
  const work = data.works.find((w) => w.id === detail);
  const filtered = data.works.filter((w) =>
    `${w.name} ${w.location}`.toLowerCase().includes(query.toLowerCase()),
  );
  function save(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const item = {
      id: edit.id || crypto.randomUUID(),
      name: form.get('name').trim(),
      location: form.get('location').trim(),
      type: form.get('type'),
      manager: form.get('manager').trim(),
      due: form.get('due'),
      budget: Number(form.get('budget')),
      spent: Number(form.get('spent')),
      progress: Number(form.get('progress')),
      notes: form.get('notes').trim(),
      logs: edit.logs || [],
      status: Number(form.get('progress')) === 100 ? 'Concluído' : 'Em andamento',
    };
    update((current) => ({
      ...current,
      works: edit.id
        ? current.works.map((w) => (w.id === edit.id ? item : w))
        : [item, ...current.works],
    }));
    setEdit(null);
    notify('Obra salva. Tudo sob controle.');
  }
  return (
    <>
      <PageTitle
        title="Minhas obras"
        subtitle="Do planejamento ao último metro quadrado. Acompanhe cada etapa."
      >
        <button className="btn btn-primary" onClick={() => setEdit({})}>
          <Icon name="Plus" size={18} />
          Nova obra
        </button>
      </PageTitle>
      <div className="metrics-grid three">
        <Metric
          title="Obras em execução"
          value={data.works.filter((w) => w.progress < 100).length}
          icon="HardHat"
          detail="projetos ativos"
        />
        <Metric
          title="Orçamento total"
          value={shortMoney(data.works.reduce((a, w) => a + w.budget, 0))}
          icon="Wallet"
          detail="soma dos projetos cadastrados"
          color="blue"
        />
        <Metric
          title="Custos registrados"
          value={shortMoney(data.works.reduce((a, w) => a + w.spent, 0))}
          icon="ChartColumn"
          detail="execução financeira acumulada"
          color="orange"
        />
      </div>
      <div className="filter-toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar obra ou localização..."
        />
        <span className="muted">{filtered.length} obras</span>
      </div>
      <div className="works-grid">
        {filtered.map((w) => (
          <article className="panel work-card" key={w.id}>
            <div className="work-card-cover">
              <div className="work-pattern" />
              <Icon name={w.type === 'Hidrossemeadura' ? 'Trees' : 'Mountain'} size={62} />
              <span className="work-cover-tag">{w.type}</span>
            </div>
            <div className="work-card-content">
              <div className="work-card-title">
                <h2>{w.name}</h2>
                <button
                  className="icon-btn"
                  aria-label={`Editar ${w.name}`}
                  onClick={() => setEdit(w)}
                >
                  <Icon name="Pencil" size={17} />
                </button>
              </div>
              <p className="location-line">
                <Icon name="MapPin" size={14} />
                {w.location}
              </p>
              <div className="work-progress-label">
                <span>Avanço físico</span>
                <strong>{w.progress}%</strong>
              </div>
              <Progress value={w.progress} label={`Avanço de ${w.name}`} />
              <div className="work-finance">
                <div>
                  <small>Orçamento</small>
                  <strong>{money(w.budget)}</strong>
                </div>
                <div>
                  <small>Realizado</small>
                  <strong className={w.spent > w.budget ? 'text-danger' : ''}>
                    {money(w.spent)}
                  </strong>
                </div>
              </div>
              <div className="work-card-footer">
                <span>
                  <Icon name="CalendarDays" size={15} />
                  Até {formatDate(w.due)}
                </span>
                <button className="text-link" onClick={() => setDetail(w.id)}>
                  Acompanhar
                  <Icon name="ArrowUpRight" size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <Empty
          title="Seu próximo projeto começa aqui"
          text="Cadastre uma obra para acompanhar prazos, custos e execução."
        />
      )}
      {edit && (
        <Modal
          wide
          title={edit.id ? 'Editar obra' : 'Cadastrar nova obra'}
          onClose={() => setEdit(null)}
        >
          <form onSubmit={save}>
            <div className="modal-body">
              <label>
                Nome da obra
                <input
                  name="name"
                  defaultValue={edit.name}
                  required
                  minLength={4}
                  maxLength={120}
                />
              </label>
              <div className="form-row">
                <label>
                  Localização
                  <input name="location" defaultValue={edit.location} required maxLength={100} />
                </label>
                <label>
                  Tipo de serviço
                  <select name="type" defaultValue={edit.type}>
                    <option>Hidrossemeadura</option>
                    <option>Recuperação ambiental</option>
                    <option>Consultoria ambiental</option>
                    <option>Terraplanagem</option>
                    <option>Outro</option>
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Responsável
                  <input
                    name="manager"
                    defaultValue={edit.manager || data.company.contact}
                    required
                    maxLength={80}
                  />
                </label>
                <label>
                  Previsão de conclusão
                  <input
                    name="due"
                    type="date"
                    defaultValue={edit.due || dateOffset(30)}
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Orçamento (R$)
                  <input
                    type="number"
                    name="budget"
                    min="1"
                    max="1000000000"
                    step="0.01"
                    defaultValue={edit.budget || ''}
                    required
                  />
                </label>
                <label>
                  Custos acumulados (R$)
                  <input
                    type="number"
                    name="spent"
                    min="0"
                    max="1000000000"
                    step="0.01"
                    defaultValue={edit.spent || 0}
                    required
                  />
                </label>
                <label>
                  Avanço físico (%)
                  <input
                    type="number"
                    name="progress"
                    min="0"
                    max="100"
                    defaultValue={edit.progress || 0}
                    required
                  />
                </label>
              </div>
              <label>
                Observações
                <textarea name="notes" rows={3} defaultValue={edit.notes} maxLength={2000} />
              </label>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setEdit(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Salvar obra</button>
            </div>
          </form>
        </Modal>
      )}
      {work && (
        <Modal wide title={work.name} subtitle={work.location} onClose={() => setDetail(null)}>
          <div className="modal-body">
            <div className="work-progress-label">
              <span>Avanço físico</span>
              <strong>{work.progress}%</strong>
            </div>
            <Progress value={work.progress} />
            <p>{work.notes}</p>
            <div className="detail-facts-grid">
              <div>
                <small>Responsável</small>
                <strong>{work.manager}</strong>
              </div>
              <div>
                <small>Previsão de conclusão</small>
                <strong>{fullDate(work.due)}</strong>
              </div>
              <div>
                <small>Orçamento</small>
                <strong>{money(work.budget)}</strong>
              </div>
              <div>
                <small>Saldo previsto</small>
                <strong>{money(work.budget - work.spent)}</strong>
              </div>
            </div>
            <h3>Diário de obra</h3>
            <div className="work-logs">
              {work.logs.map((l) => (
                <div key={l.id}>
                  <small>{formatDate(l.date)}</small>
                  <p>{l.text}</p>
                </div>
              ))}
              {!work.logs.length && <p className="muted">Nenhum registro adicionado.</p>}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget;
                const form = new FormData(input);
                update((current) => ({
                  ...current,
                  works: current.works.map((w) =>
                    w.id === work.id
                      ? {
                          ...w,
                          logs: [
                            {
                              id: crypto.randomUUID(),
                              date: dateOffset(),
                              text: form.get('log').trim(),
                            },
                            ...w.logs,
                          ],
                        }
                      : w,
                  ),
                }));
                input.reset();
                notify('Registro adicionado ao diário de obra.');
              }}
            >
              <label>
                Adicionar registro
                <textarea
                  name="log"
                  rows={3}
                  minLength={10}
                  maxLength={2000}
                  required
                  placeholder="Registre equipes, trechos executados, consumo de insumos, medições ou pendências."
                />
              </label>
              <button className="btn btn-primary">
                <Icon name="Plus" size={16} />
                Salvar registro
              </button>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}

const stages = ['Prospecção', 'Proposta', 'Negociação', 'Fechado'];
export function Commercial() {
  const { data, update, notify } = useStore();
  const [edit, setEdit] = useState(null);
  const [query, setQuery] = useState('');
  const [remove, setRemove] = useState(null);
  const open = data.leads.filter((l) => l.stage !== 'Fechado');
  function save(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const lead = {
      id: edit.id || crypto.randomUUID(),
      name: form.get('name').trim(),
      company: form.get('company').trim(),
      contact: form.get('contact').trim(),
      value: Number(form.get('value')),
      stage: form.get('stage'),
      date: form.get('date'),
    };
    update((current) => ({
      ...current,
      leads: edit.id
        ? current.leads.map((l) => (l.id === edit.id ? lead : l))
        : [lead, ...current.leads],
    }));
    setEdit(null);
    notify('Oportunidade salva no seu funil.');
  }
  return (
    <>
      <PageTitle title="Gestão comercial" subtitle="Boas oportunidades merecem o próximo passo.">
        <button
          className="btn btn-secondary"
          onClick={() =>
            exportCSV('vereda-oportunidades.csv', [
              ['Oportunidade', 'Empresa', 'Contato', 'Valor', 'Etapa', 'Próximo contato'],
              ...data.leads.map((l) => [l.name, l.company, l.contact, l.value, l.stage, l.date]),
            ])
          }
        >
          <Icon name="Download" size={17} />
          Exportar
        </button>
        <button className="btn btn-primary" onClick={() => setEdit({})}>
          <Icon name="Plus" size={18} />
          Nova oportunidade
        </button>
      </PageTitle>
      <div className="metrics-grid three">
        <Metric
          title="Valor em negociação"
          value={shortMoney(open.reduce((a, l) => a + l.value, 0))}
          icon="ChartNoAxesCombined"
          detail={`${open.length} oportunidades em aberto`}
        />
        <Metric
          title="Negócios conquistados"
          value={shortMoney(
            data.leads.filter((l) => l.stage === 'Fechado').reduce((a, l) => a + l.value, 0),
          )}
          icon="Trophy"
          color="orange"
          detail="valor das oportunidades fechadas"
        />
        <Metric
          title="Taxa de fechamento"
          value={`${data.leads.length ? Math.round((data.leads.filter((l) => l.stage === 'Fechado').length / data.leads.length) * 100) : 0}%`}
          icon="Target"
          color="blue"
          detail="fechadas / total cadastrado"
        />
      </div>
      <div className="filter-toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar oportunidade ou empresa..."
        />
        <span className="muted">
          <Icon name="Info" size={14} />
          Use o seletor para mover entre etapas
        </span>
      </div>
      <div className="kanban">
        {stages.map((stage, index) => {
          const leads = data.leads.filter(
            (l) =>
              l.stage === stage &&
              `${l.name} ${l.company}`.toLowerCase().includes(query.toLowerCase()),
          );
          return (
            <section className={`kanban-column stage-${index}`} key={stage}>
              <div className="kanban-heading">
                <h3>
                  <i />
                  {stage}
                  <span>{leads.length}</span>
                </h3>
                <small>{money(leads.reduce((a, l) => a + l.value, 0))}</small>
              </div>
              {leads.map((l) => (
                <article className="lead-card" key={l.id}>
                  <div className="lead-company">
                    <Icon name="Building2" size={13} />
                    {l.company}
                    <button aria-label={`Editar ${l.name}`} onClick={() => setEdit(l)}>
                      <Icon name="Pencil" size={14} />
                    </button>
                  </div>
                  <h3>{l.name}</h3>
                  <strong className="lead-value">{money(l.value)}</strong>
                  <span className="lead-contact">
                    <Icon name="UserRound" size={13} />
                    {l.contact}
                  </span>
                  <div className="lead-footer">
                    <span>
                      <Icon name="CalendarDays" size={13} />
                      {formatDate(l.date)}
                    </span>
                    <button
                      className="icon-btn text-danger"
                      aria-label={`Excluir ${l.name}`}
                      onClick={() => setRemove(l)}
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                  <select
                    aria-label={`Etapa de ${l.name}`}
                    value={l.stage}
                    onChange={(e) => {
                      const stage = e.target.value;
                      update((current) => ({
                        ...current,
                        leads: current.leads.map((item) =>
                          item.id === l.id ? { ...item, stage } : item,
                        ),
                      }));
                      notify(`Oportunidade movida para ${stage.toLowerCase()}.`);
                    }}
                  >
                    {stages.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </article>
              ))}
              {!leads.length && (
                <div className="kanban-empty">O próximo negócio pode estar aqui.</div>
              )}
              <button className="add-lead" onClick={() => setEdit({ stage })}>
                <Icon name="Plus" size={15} />
                Adicionar oportunidade
              </button>
            </section>
          );
        })}
      </div>
      {edit && (
        <Modal
          title={edit.id ? 'Editar oportunidade' : 'Uma nova oportunidade'}
          onClose={() => setEdit(null)}
        >
          <form onSubmit={save}>
            <div className="modal-body">
              <label>
                Nome da oportunidade
                <input
                  name="name"
                  defaultValue={edit.name}
                  minLength={4}
                  maxLength={100}
                  required
                />
              </label>
              <div className="form-row">
                <label>
                  Empresa
                  <input name="company" defaultValue={edit.company} maxLength={100} required />
                </label>
                <label>
                  Contato
                  <input name="contact" defaultValue={edit.contact} maxLength={80} required />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Valor estimado (R$)
                  <input
                    name="value"
                    type="number"
                    min="1"
                    max="1000000000"
                    step="0.01"
                    defaultValue={edit.value}
                    required
                  />
                </label>
                <label>
                  Etapa
                  <select name="stage" defaultValue={edit.stage}>
                    {stages.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Próximo contato
                <input type="date" name="date" defaultValue={edit.date || dateOffset(3)} required />
              </label>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setEdit(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Salvar oportunidade</button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <Confirm
          title="Excluir esta oportunidade?"
          text={`“${remove.name}” será removida do seu funil comercial.`}
          danger
          label="Excluir oportunidade"
          onClose={() => setRemove(null)}
          onConfirm={() => {
            update((current) => ({
              ...current,
              leads: current.leads.filter((l) => l.id !== remove.id),
            }));
            notify('Oportunidade removida.');
          }}
        />
      )}
    </>
  );
}

function CompanyFields({ company = {}, admin = false }) {
  return (
    <>
      <div className="form-row">
        <label>
          Razão social
          <input name="name" defaultValue={company.name} required minLength={3} maxLength={120} />
        </label>
        <label>
          Nome de exibição
          <input
            name="shortName"
            defaultValue={company.shortName}
            required
            minLength={2}
            maxLength={40}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          CNPJ demonstrativo
          <input
            name="cnpj"
            defaultValue={company.cnpj}
            required
            pattern="[0-9]{14}|[0-9]{2}\.[0-9]{3}\.[0-9]{3}/[0-9]{4}-[0-9]{2}"
            title="Informe 14 dígitos, com ou sem pontuação"
            maxLength={18}
          />
        </label>
        <label>
          Segmento
          <select name="segment" defaultValue={company.segment}>
            <option>Recuperação de áreas degradadas</option>
            <option>Consultoria ambiental</option>
            <option>Hidrossemeadura</option>
            <option>Engenharia ambiental</option>
            <option>Terraplanagem</option>
            <option>Sustentabilidade</option>
            <option>Outros serviços ambientais</option>
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          Responsável
          <input
            name="contact"
            defaultValue={company.contact}
            required
            minLength={3}
            maxLength={80}
          />
        </label>
        <label>
          E-mail
          <input name="email" type="email" defaultValue={company.email} required maxLength={120} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Telefone
          <input name="phone" defaultValue={company.phone} required maxLength={24} />
        </label>
        <label>
          Cidade
          <input name="city" defaultValue={company.city} required maxLength={80} />
        </label>
        <label>
          UF
          <select name="state" defaultValue={company.state || 'MG'}>
            {[
              'AC',
              'AL',
              'AP',
              'AM',
              'BA',
              'CE',
              'DF',
              'ES',
              'GO',
              'MA',
              'MT',
              'MS',
              'MG',
              'PA',
              'PB',
              'PR',
              'PE',
              'PI',
              'RJ',
              'RN',
              'RS',
              'RO',
              'RR',
              'SC',
              'SP',
              'SE',
              'TO',
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {admin && (
        <label>
          Plano demonstrativo
          <select name="plan" defaultValue={company.plan || 'essencial'}>
            {plans.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  );
}
export function Company() {
  const { data, update, notify } = useStore();
  return (
    <>
      <PageTitle
        title="Minha empresa"
        subtitle="Seu negócio, com todas as informações no lugar certo."
      />
      <div className="form-columns">
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const form = Object.fromEntries(new FormData(e.currentTarget));
            if (form.cnpj.replace(/\D/g, '').length !== 14) {
              notify('Informe um CNPJ com 14 dígitos.', 'error');
              return;
            }
            update((current) => ({ ...current, company: { ...current.company, ...form } }));
            notify('Informações da empresa atualizadas.');
          }}
        >
          <div className="company-profile-head">
            <span className="company-monogram">
              <Icon name="Sprout" size={31} />
            </span>
            <div>
              <h2>{data.company.shortName}</h2>
              <p>{data.company.segment}</p>
            </div>
            <span className="category-pill">Cadastro demo</span>
          </div>
          <CompanyFields company={data.company} />
          <label>
            Tamanho da equipe
            <select name="team" defaultValue={data.company.team}>
              <option>Até 10 pessoas</option>
              <option>11 a 50 pessoas</option>
              <option>51 a 200 pessoas</option>
              <option>Mais de 200 pessoas</option>
            </select>
          </label>
          <div className="form-footer">
            <button className="btn btn-primary">
              Salvar alterações
              <Icon name="Check" size={17} />
            </button>
          </div>
        </form>
        <aside className="panel request-help">
          <Icon name="Building2" size={30} />
          <h2>Uma empresa bem conectada.</h2>
          <p>
            Estas informações ajudam nossos especialistas a entender seu contexto e preparar
            propostas mais adequadas.
          </p>
          <div className="info-note">
            <Icon name="Info" size={18} />
            <p>Cadastro demonstrativo, sem consulta ou validação de CNPJ em serviços externos.</p>
          </div>
          <Link to="/planos" className="text-link">
            Conhecer meu plano
            <Icon name="ArrowUpRight" size={16} />
          </Link>
        </aside>
      </div>
    </>
  );
}

export function Companies() {
  const { data, update, notify } = useStore();
  const [query, setQuery] = useState('');
  const [edit, setEdit] = useState(null);
  const companies = [
    { ...data.company, plan: data.subscription.plan, active: data.subscription.active },
    ...(data.otherCompanies || []),
  ];
  const filtered = companies.filter((c) =>
    `${c.name} ${c.cnpj}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Empresas conectadas"
        subtitle="Conheça e acompanhe os negócios que fazem parte da Vereda."
      >
        <button className="btn btn-primary" onClick={() => setEdit({})}>
          <Icon name="Plus" size={17} />
          Cadastrar empresa
        </button>
      </PageTitle>
      <section className="panel">
        <div className="list-filters">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar empresa ou CNPJ..." />
          <span className="muted">{filtered.length} empresas</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Responsável</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="table-description">
                      <span className="company-mini">
                        <Icon name="Building2" size={19} />
                      </span>
                      <span>
                        <strong>{c.shortName}</strong>
                        <small>
                          {c.cnpj} · {c.city}/{c.state}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="table-description">
                      <span>
                        <strong>{c.contact}</strong>
                        <small>{c.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>{plans.find((p) => p.id === c.plan)?.name}</td>
                  <td>
                    <Status>{c.active ? 'Ativo' : 'Cancelado'}</Status>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-small" onClick={() => setEdit(c)}>
                      <Icon name="Pencil" size={14} />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <Empty title="Nenhuma empresa encontrada" />}
        </div>
      </section>
      {edit && (
        <Modal
          wide
          title={edit.id ? 'Editar empresa' : 'Cadastrar empresa'}
          onClose={() => setEdit(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const values = Object.fromEntries(new FormData(e.currentTarget));
              if (values.cnpj.replace(/\D/g, '').length !== 14) {
                notify('Informe 14 dígitos para o CNPJ.', 'error');
                return;
              }
              const company = {
                ...edit,
                ...values,
                id: edit.id || crypto.randomUUID(),
                active: values.active === 'true',
              };
              update((current) =>
                edit.id === 'c1'
                  ? {
                      ...current,
                      company: { ...current.company, ...values },
                      subscription: {
                        ...current.subscription,
                        plan: values.plan,
                        active: values.active === 'true',
                        used: Math.min(
                          current.subscription.used,
                          plans.find((p) => p.id === values.plan).quota,
                        ),
                      },
                      invoices: current.invoices.map((invoice) =>
                        invoice.kind === 'subscription' &&
                        invoice.status === 'Pendente' &&
                        (values.active !== 'true' || current.subscription.plan !== values.plan)
                          ? { ...invoice, status: 'Cancelado' }
                          : invoice,
                      ),
                    }
                  : {
                      ...current,
                      otherCompanies: edit.id
                        ? current.otherCompanies.map((c) => (c.id === edit.id ? company : c))
                        : [...current.otherCompanies, company],
                    },
              );
              setEdit(null);
              notify('Cadastro de empresa atualizado.');
            }}
          >
            <div className="modal-body">
              <CompanyFields company={edit} admin />
              <label>
                Status da assinatura
                <select name="active" defaultValue={String(edit.active ?? true)}>
                  <option value="true">Ativo</option>
                  <option value="false">Cancelado</option>
                </select>
              </label>
              <p className="muted">
                Cadastro e plano administrativos são ilustrativos, sem gerar cobrança nem criar
                credenciais de acesso.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setEdit(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Salvar empresa</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Specialists() {
  const { role, data, update, notify } = useStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(null);
  const partners = specialists.map((p) => ({ ...p, ...(data.partnerProfiles?.[p.id] || {}) }));
  const filtered = partners.filter(
    (p) =>
      (!category || p.service === category) &&
      `${p.name} ${p.role}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title={role === 'admin' ? 'Rede de especialistas' : 'Gente que entende do seu negócio.'}
        subtitle="Conhecimento técnico, experiência e um olhar atento para o setor ambiental."
      />
      <div className="filter-toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar especialista..." />
        <select
          aria-label="Área de atuação"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas as áreas</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="specialists-grid">
        {filtered.map((p) => (
          <article key={p.id} className="panel specialist-card">
            <div className="specialist-card-top">
              <span className={`avatar avatar-xl tone-${p.color}`}>{p.initials}</span>
              <span className="verified-badge" title="Perfil demonstrativo">
                <Icon name="BadgeCheck" size={22} />
              </span>
            </div>
            <h2>{p.name}</h2>
            <p>{p.role}</p>
            <div className="specialist-score">
              <span>★ {p.rating}</span>
              <small>{p.projects} projetos</small>
            </div>
            <span className="specialist-area">
              {services.find((s) => s.id === p.service)?.name}
            </span>
            <button className="btn btn-secondary btn-full" onClick={() => setSelected(p)}>
              Conhecer especialista
              <Icon name="ArrowUpRight" size={16} />
            </button>
            {role === 'admin' && (
              <button className="text-link partner-edit" onClick={() => setEdit(p)}>
                <Icon name="Pencil" size={14} />
                Editar perfil
              </button>
            )}
          </article>
        ))}
      </div>
      {!filtered.length && <Empty title="Nenhum especialista encontrado" />}
      {selected && (
        <Modal title={selected.name} subtitle={selected.role} onClose={() => setSelected(null)}>
          <div className="modal-body">
            <div className="specialist-modal-profile">
              <span className={`avatar avatar-xl tone-${selected.color}`}>{selected.initials}</span>
              <div>
                <strong>
                  ★ {selected.rating} · {selected.projects} projetos
                </strong>
                <p>{selected.credential}</p>
              </div>
            </div>
            <p>
              Atendimento especializado para empresas ambientais, com foco em{' '}
              {services.find((s) => s.id === selected.service)?.name.toLowerCase()}. O escopo e os
              prazos são definidos na proposta de cada projeto.
            </p>
            <div className="info-note">
              <Icon name="Info" size={18} />
              <p>Nome, avaliação, experiência e registros são fictícios para demonstração.</p>
            </div>
            <Link
              className="btn btn-primary btn-full"
              to={
                role === 'cliente'
                  ? `/solicitacoes/nova?servico=${selected.service}`
                  : '/solicitacoes'
              }
            >
              {role === 'cliente' ? 'Solicitar atendimento' : 'Ver solicitações'}
              <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        </Modal>
      )}
      {edit && (
        <Modal title="Editar perfil do especialista" onClose={() => setEdit(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const values = Object.fromEntries(new FormData(e.currentTarget));
              update((current) => ({
                ...current,
                partnerProfiles: { ...current.partnerProfiles, [edit.id]: values },
              }));
              setEdit(null);
              notify('Perfil do especialista atualizado no diretório.');
            }}
          >
            <div className="modal-body">
              <label>
                Nome
                <input name="name" defaultValue={edit.name} minLength={3} maxLength={80} required />
              </label>
              <label>
                Especialidade
                <input name="role" defaultValue={edit.role} required maxLength={80} />
              </label>
              <label>
                Registro / apresentação
                <input name="credential" defaultValue={edit.credential} required maxLength={120} />
              </label>
              <p className="muted">
                A edição altera o diretório demonstrativo. O acesso de prestador e o histórico dos
                serviços mantêm os nomes de exemplo.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setEdit(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Salvar perfil</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Support() {
  const { data, role, update, notify } = useStore();
  const [newTicket, setNewTicket] = useState(false);
  const [detail, setDetail] = useState(null);
  const ticket = data.tickets.find((t) => t.id === detail);
  return (
    <>
      <PageTitle
        title="Conte com a gente."
        subtitle="Uma dúvida no caminho? Estamos aqui para ajudar."
      />
      <div className="support-grid">
        <div className="support-intro">
          <span className="support-big-icon">
            <Icon name="Headset" size={44} />
          </span>
          <h2>
            Um bom apoio
            <br />
            faz a diferença.
          </h2>
          <p>Descreva sua dúvida e acompanhe o atendimento pelo painel.</p>
          <button className="btn btn-primary" onClick={() => setNewTicket(true)}>
            <Icon name="Plus" size={17} />
            Abrir atendimento
          </button>
          <small>Canal demonstrativo · sem envio externo</small>
        </div>
        <section className="panel plan-faq">
          <h2>Talvez a resposta esteja aqui.</h2>
          {[
            {
              q: 'Como contrato um serviço?',
              a: 'Acesse o catálogo, escolha uma categoria e clique em Solicitar este serviço. Descreva sua demanda, envie os documentos e aguarde a proposta do especialista.',
            },
            {
              q: 'Como testo o fluxo completo?',
              a: 'Crie uma solicitação como Empresa. Saia e entre como Administrador para enviar a proposta. Volte como Empresa, aprove e simule o pagamento. O prestador ou administrador inicia e entrega o serviço.',
            },
            {
              q: 'Meus dados ficam salvos?',
              a: 'As alterações ficam na sessão desta aba e sobrevivem ao recarregamento. Ao encerrar a sessão da aba ou restaurar a demonstração, os exemplos iniciais retornam. Navegadores com restauração de sessão podem reabrir os dados.',
            },
            {
              q: 'Existe alguma cobrança real?',
              a: 'Não. Pix, cartão, boleto, contratos e repasses são exemplos de interface. A versão demonstrativa não se conecta a serviços bancários.',
            },
          ].map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <Icon name="Plus" size={16} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      </div>
      <section className="panel">
        <SectionTitle
          title="Meus atendimentos"
          subtitle="Uma conversa organizada resolve muita coisa."
        />
        <div className="ticket-list">
          {data.tickets.map((t) => (
            <button className="ticket-row" key={t.id} onClick={() => setDetail(t.id)}>
              <span className="file-icon">
                <Icon name="MessagesSquare" size={21} />
              </span>
              <div>
                <strong>{t.title}</strong>
                <small>
                  {t.id} · {formatDate(t.date)}
                </small>
              </div>
              <Status>{t.status}</Status>
              <Icon name="ChevronRight" size={17} />
            </button>
          ))}
          {!data.tickets.length && (
            <Empty
              title="Tudo tranquilo por aqui"
              text="Abra um atendimento quando precisar de ajuda."
            />
          )}
        </div>
      </section>
      {newTicket && (
        <Modal title="Como podemos ajudar?" onClose={() => setNewTicket(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              update((current) => ({
                ...current,
                tickets: [
                  {
                    id: nextId(current.tickets, 'AT', 101),
                    title: form.get('title').trim(),
                    text: form.get('text').trim(),
                    status: 'Aberto',
                    date: dateOffset(),
                  },
                  ...current.tickets,
                ],
              }));
              setNewTicket(false);
              notify('Atendimento registrado nesta demonstração.');
            }}
          >
            <div className="modal-body">
              <label>
                Assunto
                <input name="title" minLength={5} maxLength={120} required />
              </label>
              <label>
                Conte o que aconteceu
                <textarea name="text" minLength={15} maxLength={3000} rows={5} required />
              </label>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setNewTicket(false)}
              >
                Voltar
              </button>
              <button className="btn btn-primary">Registrar atendimento</button>
            </div>
          </form>
        </Modal>
      )}
      {ticket && (
        <Modal title={ticket.title} subtitle={ticket.id} onClose={() => setDetail(null)}>
          <div className="modal-body">
            <Status>{ticket.status}</Status>
            <p className="preserve-lines">{ticket.text}</p>
            {ticket.reply && (
              <div className="support-answer">
                <strong>Equipe Vereda</strong>
                <p className="preserve-lines">{ticket.reply}</p>
              </div>
            )}
            {role === 'admin' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const reply = new FormData(e.currentTarget).get('reply').trim();
                  update((current) => ({
                    ...current,
                    tickets: current.tickets.map((t) =>
                      t.id === ticket.id ? { ...t, reply, status: 'Respondido' } : t,
                    ),
                  }));
                  notify('Resposta salva no atendimento.');
                }}
              >
                <label>
                  Responder atendimento
                  <textarea
                    name="reply"
                    rows={4}
                    minLength={10}
                    maxLength={3000}
                    defaultValue={ticket.reply}
                    required
                  />
                </label>
                <button className="btn btn-primary">Salvar resposta</button>
              </form>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

export function Reports() {
  const { data } = useStore();
  const paid = data.invoices.filter((i) => i.status === 'Pago');
  const total = paid.reduce((a, i) => a + i.value, 0);
  const companies = [
    { plan: data.subscription.plan, active: data.subscription.active },
    ...data.otherCompanies,
  ];
  const mrr = companies
    .filter((c) => c.active)
    .reduce((sum, c) => sum + (plans.find((p) => p.id === c.plan)?.price || 0), 0);
  const concluded = data.requests.filter((r) => r.status === 'Concluído');
  const rated = data.requests.filter((r) => r.rating);
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 5 + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      name: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      value: paid
        .filter((invoice) => (invoice.paidAt || invoice.due).startsWith(key))
        .reduce((sum, invoice) => sum + invoice.value, 0),
    };
  });
  const maxMonth = Math.max(1, ...months.map((m) => m.value));
  return (
    <>
      <PageTitle
        title="Indicadores da operação"
        subtitle="Uma visão clara para tomar decisões e encontrar novos caminhos."
      >
        <button
          className="btn btn-secondary"
          onClick={() =>
            exportCSV('vereda-indicadores.csv', [
              ['Indicador', 'Valor'],
              ['Volume de pagamentos simulados', total],
              ['MRR dos planos ativos', mrr],
              ['Solicitações', data.requests.length],
              ['Concluídas', concluded.length],
              ...months.map((m) => [`Pagamentos em ${m.name}`, m.value]),
            ])
          }
        >
          <Icon name="Download" size={17} />
          Exportar relatório
        </button>
      </PageTitle>
      <div className="metrics-grid">
        <Metric
          title="Volume pago simulado"
          value={shortMoney(total)}
          icon="Wallet"
          detail="valor bruto das faturas pagas"
        />
        <Metric
          title="MRR demonstrativo"
          value={money(mrr)}
          icon="RefreshCw"
          detail="planos ativos cadastrados"
          color="blue"
        />
        <Metric
          title="Taxa de conclusão"
          value={`${data.requests.length ? Math.round((concluded.length / data.requests.length) * 100) : 0}%`}
          icon="Target"
          detail="concluídas / solicitações totais"
          color="orange"
        />
        <Metric
          title="Satisfação das entregas"
          value={
            rated.length
              ? (rated.reduce((a, r) => a + r.rating, 0) / rated.length)
                  .toFixed(1)
                  .replace('.', ',')
              : '—'
          }
          icon="Star"
          detail={`${rated.length} avaliação(ões) registrada(s)`}
          color="purple"
        />
      </div>
      <div className="report-columns">
        <section className="panel chart-panel">
          <SectionTitle
            title="Pagamentos ao longo do tempo"
            subtitle="Volume bruto confirmado · últimos seis meses"
          />
          <div
            className="bar-chart"
            role="img"
            aria-label={months.map((m) => `${m.name}: ${money(m.value)}`).join('; ')}
          >
            {months.map((m) => (
              <div className="bar-column" key={m.name}>
                <span>{shortMoney(m.value)}</span>
                <div>
                  <i style={{ height: `${Math.max(1, (m.value / maxMonth) * 100)}%` }} />
                </div>
                <small>{m.name}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel chart-panel">
          <SectionTitle
            title="Demanda por especialidade"
            subtitle="Solicitações cadastradas por serviço"
          />
          <div className="category-chart">
            {services.map((s) => {
              const count = data.requests.filter((r) => r.service === s.id).length;
              return (
                <div key={s.id}>
                  <ServiceIcon service={s} small size={16} />
                  <div>
                    <span>
                      {s.name}
                      <strong>{count}</strong>
                    </span>
                    <Progress value={(count / Math.max(1, data.requests.length)) * 100} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <div className="info-note finance-note">
        <Icon name="Info" size={20} />
        <p>
          Os indicadores usam os registros desta demonstração. Volume pago não representa receita
          líquida da plataforma. MRR é o valor mensal dos planos ativos, sem confirmar recebimento.
          CAC, margem e retenção exigem dados reais na próxima fase.
        </p>
      </div>
    </>
  );
}
