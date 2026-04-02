'use client';

import clsx from 'clsx';
// import { clsx } from 'clsx';
import { forwardRef } from 'react';

// ── StatusBadge ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  // Article statuses
  published:      'bg-green-100 text-green-800',
  draft:          'bg-gray-100 text-gray-700',
  pending_review: 'bg-amber-100 text-amber-800',
  scheduled:      'bg-blue-100 text-blue-800',
  archived:       'bg-gray-100 text-gray-500',
  // User statuses
  active:         'bg-green-100 text-green-800',
  suspended:      'bg-red-100 text-red-800',
  deleted:        'bg-gray-100 text-gray-500',
  // Comment statuses
  approved:       'bg-green-100 text-green-800',
  pending:        'bg-amber-100 text-amber-800',
  rejected:       'bg-red-100 text-red-700',
  // Membership
  trialing:       'bg-blue-100 text-blue-800',
  expired:        'bg-gray-100 text-gray-500',
  canceled:       'bg-gray-100 text-gray-500',
  // Live streams
  live:           'bg-red-100 text-red-800 animate-pulse',
  ended:          'bg-gray-100 text-gray-500',
  // Generic
  default:        'bg-gray-100 text-gray-600',
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.default;
  return (
    <span className={clsx('inline-flex items-center text-[11px] font-ui font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide', style)}>
      {status === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
      )}
      {label ?? status.replace(/_/g, ' ')}
    </span>
  );
}

// ── RoleBadge ──────────────────────────────────────────────────────────────
const ROLE_STYLES: Record<string, string> = {
  super_admin: 'bg-cni-blue text-white',
  admin:       'bg-gray-800 text-white',
  editor:      'bg-indigo-100 text-indigo-800',
  journalist:  'bg-purple-100 text-purple-800',
  moderator:   'bg-orange-100 text-orange-800',
  member:      'bg-gray-100 text-gray-600',
};

export function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] ?? ROLE_STYLES.member;
  const label = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return (
    <span className={clsx('inline-block text-[10px] font-ui font-bold px-2 py-0.5 rounded uppercase tracking-wide', style)}>
      {label}
    </span>
  );
}

// ── Button ─────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize    = 'sm' | 'md' | 'lg';

const BTN_BASE = 'inline-flex items-center gap-2 font-ui font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-cni-blue text-white hover:bg-cni-blue-dark',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  danger:    'bg-cni-red text-white hover:bg-cni-red-dark',
  ghost:     'text-gray-600 hover:bg-gray-100',
};
const BTN_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?:    ButtonSize;
  loading?: boolean;
  icon?:    React.ReactNode;
}

export function Button({
  variant = 'primary',
  size    = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(BTN_BASE, BTN_VARIANTS[variant], BTN_SIZES[size], className)}
      {...props}
    >
      {loading
        ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : icon
      }
      {children}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
  prefix?:  React.ReactNode;
  suffix?:  React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, prefix, suffix, className, ...props
}, ref) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-xs font-ui font-semibold text-gray-700">
        {label}
        {props.required && <span className="text-cni-red ml-0.5">*</span>}
      </label>
    )}
    <div className="relative flex items-center">
      {prefix && (
        <div className="absolute left-3 text-gray-400 pointer-events-none">{prefix}</div>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full text-sm font-ui border rounded-md bg-white text-gray-900 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-cni-blue/30 focus:border-cni-blue',
          error ? 'border-cni-red' : 'border-gray-300',
          prefix ? 'pl-9' : 'pl-3',
          suffix ? 'pr-9' : 'pr-3',
          'py-2',
          className
        )}
        {...props}
      />
      {suffix && (
        <div className="absolute right-3 text-gray-400 pointer-events-none">{suffix}</div>
      )}
    </div>
    {error && <p className="text-xs font-ui text-cni-red">{error}</p>}
    {hint && !error && <p className="text-xs font-ui text-gray-400">{hint}</p>}
  </div>
));
Input.displayName = 'Input';

// ── Select ─────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  error?:   string;
  options:  { value: string | number; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-ui font-semibold text-gray-700">
          {label}
          {props.required && <span className="text-cni-red ml-0.5">*</span>}
        </label>
      )}
      <select
        className={clsx(
          'w-full text-sm font-ui border rounded-md bg-white text-gray-900 px-3 py-2',
          'focus:outline-none focus:ring-2 focus:ring-cni-blue/30 focus:border-cni-blue',
          error ? 'border-cni-red' : 'border-gray-300',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs font-ui text-cni-red">{error}</p>}
    </div>
  );
}

// ── Textarea ───────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?:  string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label, error, hint, className, ...props
}, ref) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-xs font-ui font-semibold text-gray-700">
        {label}
        {props.required && <span className="text-cni-red ml-0.5">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      className={clsx(
        'w-full text-sm font-ui border rounded-md bg-white text-gray-900 placeholder-gray-400 px-3 py-2',
        'focus:outline-none focus:ring-2 focus:ring-cni-blue/30 focus:border-cni-blue resize-y',
        error ? 'border-cni-red' : 'border-gray-300',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs font-ui text-cni-red">{error}</p>}
    {hint && !error && <p className="text-xs font-ui text-gray-400">{hint}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  padding = true,
}: {
  children:  React.ReactNode;
  className?: string;
  padding?:  boolean;
}) {
  return (
    <div className={clsx('bg-white border border-gray-200 rounded-lg', padding && 'p-5', className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title:     string;
  subtitle?: string;
  actions?:  React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="font-ui font-semibold text-gray-900 text-base">{title}</h2>
        {subtitle && <p className="text-xs font-ui text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0 ml-4">{actions}</div>}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  width = 'max-w-lg',
}: {
  open:      boolean;
  onClose:   () => void;
  title:     string;
  children:  React.ReactNode;
  width?:    string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className={clsx('relative bg-white rounded-xl shadow-2xl w-full', width)}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-ui font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ── ConfirmModal ───────────────────────────────────────────────────────────
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel   = 'Confirm',
  variant        = 'danger',
  loading        = false,
}: {
  open:           boolean;
  onClose:        () => void;
  onConfirm:      () => void;
  title:          string;
  message:        string;
  confirmLabel?:  string;
  variant?:       'danger' | 'primary';
  loading?:       boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm font-ui text-gray-600 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?:        React.ReactNode;
  title:        string;
  description?: string;
  action?:      React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-3 text-gray-300">{icon}</div>}
      <p className="font-ui font-semibold text-gray-600 mb-1">{title}</p>
      {description && <p className="text-sm font-ui text-gray-400 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ── PageHeader ─────────────────────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title:     string;
  subtitle?: string;
  actions?:  React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-ui font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm font-ui text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">{actions}</div>
      )}
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'blue',
}: {
  label:       string;
  value:       string | number;
  change?:     string;
  changeType?: 'up' | 'down' | 'neutral';
  icon?:       React.ReactNode;
  color?:      'blue' | 'red' | 'green' | 'amber';
}) {
  const colorMap = {
    blue:  'bg-cni-blue-light text-cni-blue',
    red:   'bg-red-50 text-cni-red',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', colorMap[color])}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-ui font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs font-ui text-gray-500">{label}</p>
      {change && (
        <p className={clsx(
          'text-xs font-ui font-medium mt-1.5',
          changeType === 'up'   ? 'text-green-600' :
          changeType === 'down' ? 'text-red-600' :
          'text-gray-500'
        )}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
        </p>
      )}
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────
export function Toggle({
  checked,
  onChange,
  label,
  size = 'md',
}: {
  checked:  boolean;
  onChange: (val: boolean) => void;
  label?:   string;
  size?:    'sm' | 'md';
}) {
  const trackSize = size === 'sm' ? 'w-8 h-4' : 'w-10 h-5';
  const thumbSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <div
        className={clsx(
          'relative rounded-full transition-colors duration-200 flex-shrink-0',
          trackSize,
          checked ? 'bg-cni-blue' : 'bg-gray-300'
        )}
        onClick={() => onChange(!checked)}
      >
        <div className={clsx(
          'absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200',
          thumbSize,
          checked ? translate : 'translate-x-0'
        )} />
      </div>
      {label && <span className="text-xs font-ui text-gray-700">{label}</span>}
    </label>
  );
}

// ── SearchInput ────────────────────────────────────────────────────────────
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value:        string;
  onChange:     (val: string) => void;
  placeholder?: string;
  className?:   string;
}) {
  return (
    <div className={clsx('relative', className)}>
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <circle cx="11" cy="11" r="8"/>
        <path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-1.5 text-sm font-ui border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-cni-blue/30 focus:border-cni-blue placeholder-gray-400"
      />
    </div>
  );
}
