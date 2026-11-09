export interface SheetRow {
  id: string;
  [key: string]: any;
}

export interface User extends SheetRow {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  name: string;
  avatar_url: string;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface Organization extends SheetRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  plan: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember extends SheetRow {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: string;
}

export interface Project extends SheetRow {
  id: string;
  organization_id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  logo: string;
  visible: boolean;
  theme_id: string;
  default_page_id: string;
  created_at: string;
  updated_at: string;
}

export interface Page extends SheetRow {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  order: number;
  visible: boolean;
  seo_metadata_json: string; // JSON string of Record<string, any>
  created_at: string;
  updated_at: string;
}

export interface SectionComponent {
  id: string | number;
  _id?: string | number;
  type: string;
  content: Record<string, any>;
  [key: string]: any;
}

export interface Section extends SheetRow {
  id: string;
  page_id: string;
  name: string;
  order: number;
  visible: boolean;
  layout_items_json: string; // JSON array
  custom_classes: string;
  components_json: string; // JSON array of SectionComponent
  created_at: string;
  updated_at: string;
}

export interface ComponentDefinition extends SheetRow {
  id: string;
  type: string;
  label_ar: string;
  label_en: string;
  icon: string;
  default_content_json: string;
  schema_version: string;
}

export interface Theme extends SheetRow {
  id: string;
  organization_id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  custom_css: string;
  created_at: string;
  updated_at: string;
}

export interface Asset extends SheetRow {
  id: string;
  organization_id: string;
  project_id: string;
  filename: string;
  mime_type: string;
  size: number;
  url: string;
  storage_type: 'data_url' | 'drive' | 'external' | 'cloudinary';
  created_at: string;
}

export interface Revision extends SheetRow {
  id: string;
  project_id: string;
  page_id: string;
  author_user_id: string;
  snapshot_json: string;
  version: number;
  comment: string;
  created_at: string;
}

export interface PublishedSite extends SheetRow {
  id: string;
  project_id: string;
  domain_id: string;
  published_revision_id: string;
  published_data_json: string;
  status: 'published' | 'unpublished';
  published_at: string;
}

export interface Template extends SheetRow {
  id: string;
  name: string;
  category: string;
  preview_image: string;
  structure_json: string;
  is_public: boolean;
  created_at: string;
}

export interface Domain extends SheetRow {
  id: string;
  project_id: string;
  hostname: string;
  verified: boolean;
  ssl_status: string;
  created_at: string;
}

// Google Sheets API Types
export interface ValueRange {
  range: string;
  majorDimension?: 'ROWS' | 'COLUMNS';
  values?: any[][];
}

export interface BatchUpdateValuesRequest {
  valueInputOption?: 'RAW' | 'USER_ENTERED';
  data: ValueRange[];
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
}

