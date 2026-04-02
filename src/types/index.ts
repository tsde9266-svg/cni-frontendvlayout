// // ── Core data types matching Laravel API responses ─────────────────────────

// export interface Article {
//   id:              number;
//   slug:            string;
//   status:          'draft' | 'pending_review' | 'scheduled' | 'published' | 'archived';
//   type:            'news' | 'opinion' | 'interview' | 'analysis' | 'bulletin' | 'sponsored';
//   is_breaking:     boolean;
//   is_featured:     boolean;
//   view_count:      number;
//   published_at:    string | null;
//   title:           string | null;
//   subtitle:        string | null;
//   summary:         string | null;
//   body?:           string | null;
//   word_count?:     number;
//   allow_comments?: boolean;
//   seo_title?:      string | null;
//   seo_description?:string | null;
//   category:        Category | null;
//   featured_image:  FeaturedImage | null;
//   author:          Author | null;
//   tags?:           Tag[];
//   all_translations?: ArticleTranslationMeta[];
// }

// export interface Category {
//   id:          number;
//   slug:        string;
//   name:        string;
//   description?: string;
//   is_featured?: boolean;
//   position?:   number;
//   children?:   Category[];
// }

// export interface Tag {
//   id:   number;
//   slug: string;
//   name: string;
// }

// export interface Author {
//   id:           number;
//   display_name: string;
//   byline?:      string | null;
//   bio_short?:   string | null;
//   avatar_url?:  string | null;
//   social?: {
//     twitter?:   string | null;
//     facebook?:  string | null;
//     instagram?: string | null;
//     youtube?:   string | null;
//   };
// }

// export interface FeaturedImage {
//   url:     string | null;
//   alt:     string | null;
//   width?:  number | null;
//   height?: number | null;
// }

// export interface ArticleTranslationMeta {
//   language_id:   number;
//   language_code: string;
//   title:         string;
// }

// export interface User {
//   id:           number;
//   display_name: string;
//   email:        string;
//   avatar_url?:  string | null;
//   status:       'active' | 'suspended' | 'deleted';
//   first_name?:  string;
//   last_name?:   string;
//   timezone?:    string;
//   roles?:       string[];
//   permissions?: string[];
//   membership?:  UserMembership | null;
// }

// export interface UserMembership {
//   plan:        string;
//   plan_slug:   string;
//   badge:       string | null;
//   badge_color: string | null;
//   status:      string;
//   ends_at:     string | null;
//   features:    Record<string, boolean | string>;
//   is_free:     boolean;
// }

// export interface MembershipPlan {
//   id:              number;
//   name:            string;
//   slug:            string;
//   description:     string | null;
//   price_amount:    number;
//   price_currency:  string;
//   billing_cycle:   'monthly' | 'yearly' | 'lifetime';
//   badge_label:     string | null;
//   badge_color:     string | null;
//   features:        Record<string, boolean | string>;
//   is_free_tier:    boolean;
//   formatted_price: string;
// }

// export interface LiveStream {
//   id:                 number;
//   title:              string;
//   description?:       string | null;
//   platform:           string;
//   platform_stream_id: string | null;
//   status:             'scheduled' | 'live' | 'ended' | 'canceled';
//   scheduled_start_at: string | null;
//   actual_start_at?:   string | null;
//   is_live:            boolean;
// }

// export interface ApiPagination {
//   current_page: number;
//   last_page:    number;
//   per_page:     number;
//   total:        number;
// }

// export interface ApiListResponse<T> {
//   data: T[];
//   meta: ApiPagination;
// }
















// ── Core data types matching Laravel API responses ─────────────────────────

export interface Article {
  id:              number;
  slug:            string;
  status:          'draft' | 'pending_review' | 'scheduled' | 'published' | 'archived';
  type:            'news' | 'opinion' | 'interview' | 'analysis' | 'bulletin' | 'sponsored';
  is_breaking:     boolean;
  is_featured:     boolean;
  view_count:      number;
  published_at:    string | null;
  title:           string | null;
  subtitle:        string | null;
  summary:         string | null;
  body?:           string | null;
  word_count?:     number;
  allow_comments?: boolean;
  seo_title?:      string | null;
  seo_description?:string | null;
  category:        Category | null;
  featured_image:  FeaturedImage | null;
  author:          Author | null;
  tags?:           Tag[];
  all_translations?: ArticleTranslationMeta[];
}

export interface Category {
  id:          number;
  slug:        string;
  name:        string;
  description?: string;
  is_featured?: boolean;
  position?:   number;
  children?:   Category[];
}

export interface Tag {
  id:   number;
  slug: string;
  name: string;
}

export interface Author {
  id:           number;
  display_name: string;
  byline?:      string | null;
  bio_short?:   string | null;
  avatar_url?:  string | null;
  social?: {
    twitter?:   string | null;
    facebook?:  string | null;
    instagram?: string | null;
    youtube?:   string | null;
  };
}

export interface FeaturedImage {
  url:     string | null;
  alt:     string | null;
  width?:  number | null;
  height?: number | null;
}

export interface ArticleTranslationMeta {
  language_id:   number;
  language_code: string;
  title:         string;
}

export interface User {
  id:           number;
  display_name: string;
  email:        string;
  avatar_url?:  string | null;
  status:       'active' | 'suspended' | 'deleted';
  first_name?:  string;
  last_name?:   string;
  timezone?:    string;
  roles?:       string[];
  permissions?: string[];
  membership?:  UserMembership | null;
}

export interface UserMembership {
  plan:        string;
  plan_slug:   string;
  badge:       string | null;
  badge_color: string | null;
  status:      string;
  ends_at:     string | null;
  features:    Record<string, boolean | string>;
  is_free:     boolean;
}

export interface MembershipPlan {
  id:              number;
  name:            string;
  slug:            string;
  description:     string | null;
  price_amount:    number;
  price_currency:  string;
  billing_cycle:   'monthly' | 'yearly' | 'lifetime';
  badge_label:     string | null;
  badge_color:     string | null;
  features:        Record<string, boolean | string>;
  is_free_tier:    boolean;
  formatted_price: string;
}

export interface LiveStream {
  id:                 number;
  title:              string;
  description?:       string | null;
  platform:           string;
  platform_stream_id: string | null;
  status:             'scheduled' | 'live' | 'ended' | 'canceled';
  scheduled_start_at: string | null;
  actual_start_at?:   string | null;
  is_live:            boolean;
}

export interface ApiPagination {
  current_page: number;
  last_page:    number;
  per_page:     number;
  total:        number;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: ApiPagination;
}

export interface AdPackage {
  id:              number;
  slug:            string;
  name:            string;
  tagline:         string | null;
  description:     string | null;
  category:        'website' | 'social' | 'bundle';
  placement:       string | null;
  platform:        string | null;
  price_amount:    number;
  price_currency:  string;
  formatted_price: string;
  duration_days:   number;
  dimensions:      string | null;
  is_featured:     boolean;
  features:        string[];
  icon_emoji:      string | null;
}

export interface AdBooking {
  id:               number;
  reference:        string;
  package_name:     string;
  campaign_title:   string | null;
  advertiser_name:  string;
  advertiser_email: string;
  company_name:     string | null;
  start_date:       string | null;
  end_date:         string | null;
  price_amount:     number;
  price_currency:   string;
  payment_status:   'pending' | 'paid' | 'failed' | 'refunded';
  booking_status:   'pending_payment' | 'pending_review' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  paid_at:          string | null;
  rejection_reason: string | null;
  admin_notes:      string | null;
  created_at:       string;
}
