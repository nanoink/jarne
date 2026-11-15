import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { accounts, services } from './data';
import { useStore } from './store';
import { Brand, Confirm, Empty, Icon, Modal, SearchInput, ServiceIcon, Toast } from './components';
import Dashboard from './pages/Dashboard';
import { Catalog, NewRequest, RequestDetail, Requests } from './pages/Requests';
import { Finance, Plans } from './pages/Billing';
import {
  Documents,
  Works,
  Commercial,
  Company,
  Specialists,
  Companies,
  Support,
  Reports,
} from './pages/Management';

const navigation = [
  {
    section: 'PRINCIPAL',
    items: [
      { to: '/', label: 'Visão geral', icon: 'LayoutDashboard' },
      {
        to: '/servicos',
        label: 'Catálogo de serviços',
        icon: 'Grid2X2',
        roles: ['cliente', 'admin'],
      },
      { to: '/solicitacoes', label: 'Solicitações', icon: 'ClipboardList', badge: true },
      { to: '/obras', label: 'Minhas obras', icon: 'HardHat', roles: ['cliente'] },
      {
        to: '/comercial',
        label: 'Gestão comercial',
        icon: 'ChartNoAxesCombined',
        roles: ['cliente'],
      },
      { to: '/empresas', label: 'Empresas', icon: 'Building2', roles: ['admin'] },
      { to: '/especialistas', label: 'Especialistas', icon: 'Users', roles: ['cliente', 'admin'] },
    ],
  },
  {
    section: 'GESTÃO',
    items: [
      { to: '/documentos', label: 'Documentos', icon: 'FolderOpen' },
      { to: '/financeiro', label: 'Financeiro', icon: 'Wallet' },
      {
        to: '/planos',
        label: 'Planos e assinatura',
        icon: 'Sparkles',
        roles: ['cliente', 'admin'],
      },
      { to: '/relatorios', label: 'Relatórios', icon: 'ChartColumn', roles: ['admin'] },
      { to: '/empresa', label: 'Minha empresa', icon: 'Building2', roles: ['cliente'] },
    ],
  },
];

function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('cliente');
  const [email, setEmail] = useState(accounts.cliente.email);
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const changeRole = (role) => {
    setSelected(role);
    setEmail(accounts[role].email);
    setPassword('demo123');
    setError('');
  };
  const submit = (e) => {
    e.preventDefault();
    if (login(email, password)) navigate('/', { replace: true });
    else setError('E-mail ou senha incorretos. Use um dos acessos de demonstração abaixo.');
  };
  return (
    <div className="login-page">
      <div className="login-story">
        <Brand light />
        <div className="login-story-content">
          <span className="pill-light">
            <span />O próximo passo da sua empresa
          </span>
          <h1>
            Quem cuida do
            <br />
            futuro também
            <br />
            precisa de apoio<span>.</span>
          </h1>
          <p>
            Especialistas, gestão e oportunidades para sua empresa ambiental crescer com confiança.
          </p>
          <div className="login-benefits">
            <span>
              <Icon name="BadgeCheck" />
              Especialistas do setor
            </span>
            <span>
              <Icon name="Layers" />
              Tudo em um só lugar
            </span>
          </div>
        </div>
        <Landscape />
        <span className="login-copyright">Vereda · Conectando negócios a um futuro melhor.</span>
      </div>
      <div className="login-form-side">
        <div className="login-mobile-brand">
          <Brand />
        </div>
        <div className="login-form-content">
          <span className="eyebrow">BEM-VINDO À VEREDA</span>
          <h2>
            Seu próximo capítulo
            <br />
            começa aqui.
          </h2>
          <p>Acesse sua conta e vamos crescer juntos.</p>
          <div className="login-tabs" role="group" aria-label="Perfil de demonstração">
            {Object.entries(accounts).map(([role, account]) => (
              <button
                key={role}
                className={selected === role ? 'active' : ''}
                onClick={() => changeRole(role)}
              >
                {account.label}
              </button>
            ))}
          </div>
          <form onSubmit={submit}>
            <label>
              E-mail
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Senha
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={19} />
                </button>
              </div>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn-primary btn-full" type="submit">
              Entrar na plataforma
              <Icon name="ArrowRight" size={19} />
            </button>
          </form>
          <div className="demo-login-note">
            <Icon name="FlaskConical" size={19} />
            <div>
              <strong>Explore a demonstração</strong>
              <p>
                Os acessos já estão preenchidos. Senha: <code>demo123</code>. Você pode alternar
                entre os três perfis.
              </p>
            </div>
          </div>
          <div className="login-footnote">
            <Icon name="Leaf" size={15} />
            Uma plataforma feita para o seu setor.
          </div>
        </div>
        <span className="login-version">VERSÃO DEMONSTRATIVA · 1.0</span>
      </div>
    </div>
  );
}

export function Landscape() {
  return (
    <svg className="landscape" viewBox="0 0 500 260" aria-hidden="true">
      <defs>
        <pattern id="contours" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 40Q20 0 40 40" fill="none" stroke="currentColor" strokeWidth=".7" />
        </pattern>
      </defs>
      <circle cx="360" cy="80" r="43" fill="#d6dfac" opacity=".9" />
      <path d="M0 230Q90 120 220 200T500 160V260H0Z" fill="#72946b" />
      <path d="M0 245Q170 130 290 220T500 190V260H0Z" fill="#426d50" />
      <path d="M0 260Q190 185 310 250T500 225V260Z" fill="#284d3a" />
      <path
        d="M230 260Q220 235 272 219T305 202"
        fill="none"
        stroke="#d3d4ab"
        strokeWidth="9"
        opacity=".7"
      />
      <g fill="none" stroke="#b4c79f" opacity=".45">
        <ellipse cx="390" cy="204" rx="110" ry="34" />
        <ellipse cx="390" cy="204" rx="90" ry="26" />
        <ellipse cx="390" cy="204" rx="70" ry="18" />
        <ellipse cx="390" cy="204" rx="50" ry="10" />
      </g>
      <g stroke="#204b38" strokeWidth="4" strokeLinecap="round">
        <path d="M95 235V150m0 40-18-18m18 4 19-19" />
        <path d="M145 235V172m0 28-14-14m14 2 13-11" />
      </g>
      <g fill="#8eac77">
        <ellipse cx="94" cy="151" rx="21" ry="32" />
        <ellipse cx="145" cy="173" rx="16" ry="24" />
      </g>
    </svg>
  );
}

function Shell() {
  const { role, user, data, logout, reset, visibleRequests, storageWarning, update } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const actionable = visibleRequests.filter((r) =>
    role === 'cliente'
      ? ['Proposta recebida', 'Aguardando aprovação', 'Aguardando pagamento'].includes(r.status)
      : r.status === 'Em análise',
  ).length;
  const unread = role === 'cliente' ? data.notifications.filter((n) => !n.read).length : actionable;
  const activeNav = navigation
    .flatMap((group) => group.items)
    .find((item) =>
      item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to),
    );
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setNotifications(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    document.title = `${activeNav?.label || 'Atendimento'} | Vereda`;
  }, [activeNav?.label]);
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setNotifications(false);
      }
      if (
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        event.preventDefault();
        setQuery('');
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);
  const performLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>
      {menuOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <Link to="/" aria-label="Vereda início">
          <Brand light />
        </Link>
        <div className="workspace-switch">
          <span className="workspace-avatar">
            <Icon
              name={
                role === 'cliente' ? 'Building2' : role === 'admin' ? 'Shield' : 'BriefcaseBusiness'
              }
              size={19}
            />
          </span>
          <div>
            <strong>
              {role === 'cliente'
                ? data.company.shortName
                : role === 'admin'
                  ? 'Gestão da plataforma'
                  : 'Área do especialista'}
            </strong>
            <small>
              {user.label} <span className="workspace-dot">·</span>{' '}
              {role === 'cliente'
                ? 'Plano ' + (data.subscription.active ? data.subscription.plan : 'avulso')
                : 'Vereda'}
            </small>
          </div>
        </div>
        <nav aria-label="Navegação principal">
          {navigation.map((group) => (
            <div className="nav-group" key={group.section}>
              <span className="nav-label">{group.section}</span>
              {group.items
                .filter((item) => !item.roles || item.roles.includes(role))
                .map((item) => (
                  <NavLink
                    end={item.to === '/'}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    key={item.to}
                    to={item.to}
                  >
                    <Icon name={item.icon} size={19} />
                    <span>{item.label}</span>
                    {item.badge && actionable > 0 && <b>{actionable}</b>}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link className="sidebar-help" to="/suporte">
            <span>
              <Icon name="Headset" size={22} />
            </span>
            <div>
              <strong>A gente está por aqui.</strong>
              <small>
                Conte com nosso suporte
                <Icon name="ArrowUpRight" size={13} />
              </small>
            </div>
          </Link>
          <div className="sidebar-user">
            <span className="avatar avatar-user">{user.initials}</span>
            <div>
              <strong>{role === 'cliente' ? data.company.contact : user.name}</strong>
              <small>{user.label}</small>
            </div>
            <button
              onClick={performLogout}
              title="Sair e trocar de perfil"
              aria-label="Sair e trocar de perfil"
            >
              <Icon name="LogOut" size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-btn mobile-menu"
              aria-label="Abrir menu"
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="Menu" />
            </button>
            <span className="breadcrumb">
              Workspace <Icon name="ChevronRight" size={14} />
              <strong>{activeNav?.label || 'Atendimento'}</strong>
            </span>
          </div>
          <div className="topbar-actions">
            <button
              className="global-search"
              onClick={() => {
                setSearchOpen(true);
                setQuery('');
              }}
            >
              <Icon name="Search" size={17} />
              <span>Buscar na plataforma</span>
              <kbd>/</kbd>
            </button>
            <button
              className="notification-button icon-btn"
              aria-label={`Notificações, ${unread} não lidas`}
              onClick={() => setNotifications(!notifications)}
            >
              <Icon name="Bell" size={20} />
              {unread > 0 && <i />}
            </button>
            <span className="topbar-divider" />
            <span className="avatar avatar-top">{user.initials}</span>
          </div>
          {notifications && (
            <div className="notification-panel">
              <div className="section-title">
                <h3>Notificações</h3>
                {role === 'cliente' && (
                  <button
                    className="text-link"
                    onClick={() =>
                      update((current) => ({
                        ...current,
                        notifications: current.notifications.map((n) => ({ ...n, read: true })),
                      }))
                    }
                  >
                    Marcar como lidas
                  </button>
                )}
              </div>
              {role === 'cliente'
                ? data.notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={n.to}
                      className={`notification-item ${n.read ? '' : 'unread'}`}
                      onClick={() =>
                        update((current) => ({
                          ...current,
                          notifications: current.notifications.map((item) =>
                            item.id === n.id ? { ...item, read: true } : item,
                          ),
                        }))
                      }
                    >
                      <Icon name="BellRing" size={20} />
                      <div>
                        <strong>{n.title}</strong>
                        <p>{n.text}</p>
                      </div>
                    </Link>
                  ))
                : visibleRequests
                    .filter((r) => r.status === 'Em análise')
                    .map((r) => (
                      <Link key={r.id} to={`/solicitacoes/${r.id}`} className="notification-item">
                        <Icon name="ClipboardList" />
                        <div>
                          <strong>Nova demanda · {r.id}</strong>
                          <p>{r.title}</p>
                        </div>
                      </Link>
                    ))}
            </div>
          )}
        </header>
        <div className="demo-strip">
          <span>
            <Icon name="FlaskConical" size={14} />
            Ambiente de demonstração
            <span className="demo-strip-detail"> · Dados temporários nesta aba</span>
          </span>
          <button onClick={() => setResetOpen(true)}>
            <Icon name="RotateCcw" size={13} />
            Restaurar demo
          </button>
        </div>
        {storageWarning && (
          <div className="storage-warning" role="alert">
            O navegador atingiu o limite de armazenamento. As alterações atuais continuam em
            memória, mas podem ser perdidas ao recarregar. Remova arquivos grandes para liberar
            espaço.
          </div>
        )}
        <main id="main-content" className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/servicos"
              element={
                <RoleGuard roles={['cliente', 'admin']}>
                  <Catalog />
                </RoleGuard>
              }
            />
            <Route path="/solicitacoes" element={<Requests />} />
            <Route
              path="/solicitacoes/nova"
              element={
                <RoleGuard roles={['cliente']}>
                  <NewRequest />
                </RoleGuard>
              }
            />
            <Route path="/solicitacoes/:id" element={<RequestDetail />} />
            <Route path="/documentos" element={<Documents />} />
            <Route path="/financeiro" element={<Finance />} />
            <Route
              path="/planos"
              element={
                <RoleGuard roles={['cliente', 'admin']}>
                  <Plans />
                </RoleGuard>
              }
            />
            <Route
              path="/obras"
              element={
                <RoleGuard roles={['cliente']}>
                  <Works />
                </RoleGuard>
              }
            />
            <Route
              path="/comercial"
              element={
                <RoleGuard roles={['cliente']}>
                  <Commercial />
                </RoleGuard>
              }
            />
            <Route
              path="/empresa"
              element={
                <RoleGuard roles={['cliente']}>
                  <Company />
                </RoleGuard>
              }
            />
            <Route
              path="/empresas"
              element={
                <RoleGuard roles={['admin']}>
                  <Companies />
                </RoleGuard>
              }
            />
            <Route
              path="/especialistas"
              element={
                <RoleGuard roles={['cliente', 'admin']}>
                  <Specialists />
                </RoleGuard>
              }
            />
            <Route
              path="/relatorios"
              element={
                <RoleGuard roles={['admin']}>
                  <Reports />
                </RoleGuard>
              }
            />
            <Route path="/suporte" element={<Support />} />
            <Route
              path="*"
              element={
                <Empty
                  title="Esta página não foi encontrada"
                  text="Volte ao início para continuar sua navegação."
                >
                  <Link className="btn btn-primary" to="/">
                    Ir para visão geral
                  </Link>
                </Empty>
              }
            />
          </Routes>
        </main>
        <footer className="app-footer">
          <span>© {new Date().getFullYear()} Vereda. Crescer com propósito.</span>
          <span>
            <i />
            Todos os sistemas demonstrativos operacionais
          </span>
        </footer>
      </div>
      {resetOpen && (
        <Confirm
          title="Restaurar a demonstração?"
          text="As solicitações, arquivos e alterações desta aba serão substituídos pelos exemplos iniciais. Seu perfil de acesso será mantido."
          label="Restaurar dados"
          onClose={() => setResetOpen(false)}
          onConfirm={reset}
        />
      )}
      {searchOpen && (
        <Modal title="Encontre o que precisa" onClose={() => setSearchOpen(false)}>
          <div className="modal-body">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar serviços ou solicitações..."
            />
            <div className="search-results">
              <h4>Serviços</h4>
              {services
                .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
                .map((s) => (
                  <Link
                    key={s.id}
                    to={role === 'prestador' ? '/solicitacoes' : `/servicos?categoria=${s.id}`}
                  >
                    <ServiceIcon service={s} small />
                    <span>{s.name}</span>
                    <Icon name="ArrowUpRight" size={17} />
                  </Link>
                ))}
              <h4>Solicitações</h4>
              {visibleRequests
                .filter((r) => `${r.title} ${r.id}`.toLowerCase().includes(query.toLowerCase()))
                .map((r) => (
                  <Link key={r.id} to={`/solicitacoes/${r.id}`}>
                    <Icon name="ClipboardList" size={19} />
                    <span>
                      {r.title}
                      <small>{r.id}</small>
                    </span>
                    <Icon name="ArrowUpRight" size={17} />
                  </Link>
                ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
function RoleGuard({ roles, children }) {
  const { role } = useStore();
  return roles.includes(role) ? children : <Navigate to="/" replace />;
}
export default function App() {
  const { role } = useStore();
  return (
    <>
      <Routes>
        <Route path="/login" element={role ? <Navigate to="/" replace /> : <Login />} />
        <Route path="*" element={role ? <Shell /> : <Navigate to="/login" replace />} />
      </Routes>
      <Toast />
    </>
  );
}
