// ── Admin-specific types extending the public types ───────────────────────

export type AdminRole =
  | 'super_admin'
  | 'admin'
  | 'editor'
  | 'journalist'
  | 'moderator'
  | 'member';

// Roles that can access the admin panel
export const ADMIN_ROLES: AdminRole[] = [
  'super_admin', 'admin', 'editor', 'journalist', 'moderator',
];

// Map slug → display label
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin:       'Admin',
  editor:      'Editor',
  journalist:  'Journalist',
  moderator:   'Moderator',
  member:      'Member',
};

// ── Sidebar nav item types ─────────────────────────────────────────────────
export interface NavItem {
  label:     string;
  href:      string;
  icon:      NavIcon;
  badge?:    number | null;     // numeric badge on the sidebar item
  roles?:    AdminRole[];       // if set, only these roles see this item
  children?: NavItem[];
}

export type NavIcon =
  | 'dashboard'
  | 'articles'
  | 'users'
  | 'authors'
  | 'media'
  | 'categories'
  | 'tags'
  | 'memberships'
  | 'promo'
  | 'payments'
  | 'live'
  | 'events'
  | 'comments'
  | 'settings'
  | 'seo'
  | 'audit'
  | 'social'
  | 'ads';

// ── API paginated response ─────────────────────────────────────────────────
export interface AdminPagination {
  current_page: number;
  last_page:    number;
  per_page:     number;
  total:        number;
  from:         number | null;
  to:           number | null;
}

export interface AdminListResponse<T> {
  data: T[];
  meta: AdminPagination;
}

// ── DataTable column definition ────────────────────────────────────────────
export interface TableColumn<T = Record<string, unknown>> {
  key:        string;
  header:     string;
  render?:    (row: T) => React.ReactNode;
  sortable?:  boolean;
  className?: string;
  width?:     string;
}

// ── Dashboard stats ────────────────────────────────────────────────────────
export interface DashboardStats {
  articles_total:      number;
  articles_pending:    number;
  articles_today:      number;
  users_total:         number;
  members_active:      number;
  comments_pending:    number;
  views_today:         number;
  views_this_week:     number;
  revenue_this_month:  number;
  live_streams_active: number;
}

// ── Admin article (richer than public) ────────────────────────────────────
export interface AdminArticle {
  id:               number;
  slug:             string;
  status:           'draft' | 'pending_review' | 'scheduled' | 'published' | 'archived';
  type:             string;
  is_breaking:      boolean;
  is_featured:      boolean;
  view_count:       number;
  word_count:       number;
  allow_comments:   boolean;
  published_at:     string | null;
  scheduled_at:     string | null;
  created_at:       string;
  updated_at:       string;
  title:            string | null;
  summary:          string | null;
  author_id:        number | null;
  author_name:      string | null;
  category_id:      number | null;
  category_name:    string | null;
  comments_count:   number;
}

// ── Admin user ─────────────────────────────────────────────────────────────
export interface AdminUser {
  id:           number;
  email:        string;
  display_name: string;
  first_name:   string;
  last_name:    string;
  status:       'active' | 'suspended' | 'deleted';
  roles:        string[];
  created_at:   string;
  last_login_at: string | null;
  membership_plan: string | null;
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────
export interface Breadcrumb {
  label: string;
  href?: string;
}
