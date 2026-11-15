import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BadgePercent,
  Barcode,
  Bell,
  BellRing,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarDays,
  ChartColumn,
  ChartNoAxesCombined,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Clock3,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  FilePlus2,
  FileText,
  Files,
  FlaskConical,
  FolderOpen,
  Folders,
  Grid2X2,
  Handshake,
  HardHat,
  Headset,
  Image,
  Inbox,
  Info,
  Landmark,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Leaf,
  List,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  MessagesSquare,
  Mountain,
  PackageCheck,
  Paperclip,
  Pencil,
  Percent,
  Plus,
  QrCode,
  Receipt,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trash2,
  TreeDeciduous,
  Trees,
  Trophy,
  Upload,
  UploadCloud,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';
const Icons = {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BadgePercent,
  Barcode,
  Bell,
  BellRing,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarDays,
  ChartColumn,
  ChartNoAxesCombined,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Clock3,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  FilePlus2,
  FileText,
  Files,
  FlaskConical,
  FolderOpen,
  Folders,
  Grid2X2,
  Handshake,
  HardHat,
  Headset,
  Image,
  Inbox,
  Info,
  Landmark,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Leaf,
  List,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  MessagesSquare,
  Mountain,
  PackageCheck,
  Paperclip,
  Pencil,
  Percent,
  Plus,
  QrCode,
  Receipt,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trash2,
  TreeDeciduous,
  Trees,
  Trophy,
  Upload,
  UploadCloud,
  UserRound,
  Users,
  Wallet,
};
import { useStore } from './store';
import { services } from './data';
import { formatDate, money } from './domain';

export function Icon({ name, size = 20, ...props }) {
  const Component = Icons[name] || Icons.Circle;
  return <Component size={size} strokeWidth={1.7} {...props} />;
}
export function Brand({ light = false, compact = false }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-symbol">
        <Icon name="Sprout" size={29} />
      </span>
      {!compact && (
        <span>
          vereda<span className="brand-dot">.</span>
        </span>
      )}
    </div>
  );
}
export function ServiceIcon({ service, size = 22, small = false }) {
  const item = typeof service === 'string' ? services.find((s) => s.id === service) : service;
  return (
    <span className={`service-icon tone-${item?.color || 'green'} ${small ? 'small' : ''}`}>
      <Icon name={item?.icon} size={size} />
    </span>
  );
}
export function Status({ children }) {
  const tones = {
    'Em análise': 'blue',
    'Proposta recebida': 'orange',
    'Aguardando pagamento': 'orange',
    Contratado: 'teal',
    'Em andamento': 'blue',
    'Aguardando aprovação': 'purple',
    Concluído: 'green',
    Cancelado: 'gray',
    Pago: 'green',
    Pendente: 'orange',
    Ativo: 'green',
    Respondido: 'green',
    Aberto: 'blue',
  };
  return (
    <span className={`status status-${tones[children] || 'gray'}`}>
      <i />
      {children}
    </span>
  );
}
export function PageTitle({ eyebrow, title, subtitle, children }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}
export function SectionTitle({ title, subtitle, to, label = 'Ver todos' }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {label}
          <Icon name="ArrowUpRight" size={16} />
        </Link>
      )}
    </div>
  );
}
export function Empty({
  title = 'Nada por aqui ainda',
  text = 'Os novos registros vão aparecer aqui.',
  children,
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name="FolderOpen" size={30} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
export function Metric({ title, value, icon, detail, trend, color = 'green' }) {
  return (
    <div className="metric">
      <div className="metric-top">
        <span>{title}</span>
        <span className={`metric-icon tone-${color}`}>
          <Icon name={icon} size={19} />
        </span>
      </div>
      <strong>{value}</strong>
      <div className="metric-detail">
        {trend && (
          <span>
            <Icon name="ArrowUpRight" size={13} />
            {trend}
          </span>
        )}
        {detail}
      </div>
    </div>
  );
}
export function Progress({ value, label = 'Progresso', color }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}
export function Modal({ title, subtitle, children, onClose, wide = false }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') {
        const focusable = [
          ...ref.current.querySelectorAll(
            'button, a[href], input, select, textarea, [tabindex="0"]',
          ),
        ].filter((el) => !el.disabled && el.getClientRects().length);
        if (!focusable.length) {
          event.preventDefault();
          return;
        }
        const first = focusable[0],
          last = focusable.at(-1);
        if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === ref.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === ref.current)
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = scroll;
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal ${wide ? 'modal-wide' : ''}`}
      >
        <div className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-btn" aria-label="Fechar janela" onClick={onClose}>
            <Icon name="X" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function Confirm({ title, text, onConfirm, onClose, danger = false, label = 'Confirmar' }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="confirm-text">{text}</p>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>
          Voltar
        </button>
        <button
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {label}
        </button>
      </div>
    </Modal>
  );
}
export function Toast() {
  const { toast, setToast } = useStore();
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast, setToast]);
  return (
    toast && (
      <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`} role="status">
        <Icon name={toast.type === 'error' ? 'CircleAlert' : 'CircleCheck'} size={20} />
        <span>{toast.message}</span>
        <button aria-label="Dispensar aviso" onClick={() => setToast(null)}>
          <Icon name="X" size={16} />
        </button>
      </div>
    )
  );
}
export function SearchInput({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="search-input">
      <Icon name="Search" size={18} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button aria-label="Limpar busca" onClick={() => onChange('')}>
          <Icon name="X" size={15} />
        </button>
      )}
    </div>
  );
}
export function RequestTable({ requests, compact = false }) {
  return (
    <div className="table-wrap">
      <table className="request-table">
        <thead>
          <tr>
            <th>Solicitação</th>
            <th>Status</th>
            {!compact && <th>Especialista</th>}
            <th>Prazo</th>
            <th>
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item) => (
            <tr key={item.id}>
              <td>
                <Link to={`/solicitacoes/${item.id}`} className="request-cell">
                  <ServiceIcon service={item.service} size={19} small />
                  <span>
                    <strong>{item.title}</strong>
                    <small>
                      {item.id} <span>·</span> {services.find((s) => s.id === item.service)?.name}
                    </small>
                  </span>
                </Link>
              </td>
              <td>
                <Status>{item.status}</Status>
              </td>
              {!compact && (
                <td>
                  <span className="muted">
                    {item.specialist ? 'Especialista designado' : 'A definir'}
                  </span>
                </td>
              )}
              <td className="nowrap">{formatDate(item.due)}</td>
              <td>
                <Link
                  to={`/solicitacoes/${item.id}`}
                  className="icon-btn"
                  aria-label={`Abrir ${item.id}`}
                >
                  <Icon name="ChevronRight" size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {requests.length === 0 && (
        <Empty
          title="Nenhuma solicitação encontrada"
          text="Experimente outra busca ou crie uma nova solicitação."
        />
      )}
    </div>
  );
}
export async function downloadPDF(name, content) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  pdf.setFillColor(24, 62, 50);
  pdf.rect(0, 0, 210, 30, 'F');
  pdf.setTextColor(240, 245, 224);
  pdf.setFontSize(24);
  pdf.text('vereda.', 18, 20);
  pdf.setTextColor(35, 45, 40);
  pdf.setFontSize(10);
  const lines = pdf.splitTextToSize(content, 174);
  let y = 45;
  for (const line of lines) {
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
    pdf.text(line, 18, y);
    y += 6;
  }
  pdf.setFontSize(8);
  pdf.setTextColor(110);
  pdf.text('Ambiente de demonstracao - documento sem validade fiscal ou contratual.', 18, 286);
  pdf.save(name.replace(/\.[^.]+$/, '') + '.pdf');
}
export function downloadDocument(doc) {
  if (doc.dataUrl) {
    const link = document.createElement('a');
    link.href = doc.dataUrl;
    link.download = doc.name;
    link.click();
  } else downloadPDF(doc.name, doc.content || 'Documento de demonstração Vereda.');
}
export function exportCSV(name, rows) {
  const csv =
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell ?? '')
                .replace(/"/g, '""')
                .replace(/^[=+@-]/, "'$&")}"`,
          )
          .join(';'),
      )
      .join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function InvoiceDownload({ invoice }) {
  return (
    <button
      className="icon-btn"
      aria-label={`Baixar ${invoice.id}`}
      onClick={() =>
        downloadPDF(
          invoice.id,
          `FATURA DEMONSTRATIVA\n${invoice.id}\n${invoice.title}\nValor: ${money(invoice.value)}\nVencimento: ${formatDate(invoice.due)}\nStatus: ${invoice.status}\nMeio de pagamento: ${invoice.method || 'Não definido'}\n\nNenhuma cobrança real foi realizada.`,
        )
      }
    >
      <Icon name="Download" size={18} />
    </button>
  );
}

export async function readUpload(file, documents = []) {
  if (!file || !/\.(pdf|png|jpe?g|xlsx?|docx?|csv|txt)$/i.test(file.name))
    throw new Error('Escolha um arquivo PDF, imagem, planilha ou documento de texto.');
  if (file.size > 1024 * 1024) throw new Error('O arquivo deve ter até 1 MB nesta demonstração.');
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
  if (
    documents.reduce((sum, doc) => sum + (doc.dataUrl?.length || 0), 0) + dataUrl.length >
    3 * 1024 * 1024
  )
    throw new Error(
      'O limite de arquivos desta demonstração foi atingido. Remova um arquivo para continuar.',
    );
  return {
    id: crypto.randomUUID(),
    name: file.name,
    dataUrl,
    size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    date: new Date().toLocaleDateString('en-CA'),
  };
}
