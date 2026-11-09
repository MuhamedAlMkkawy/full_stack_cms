export const SPREADSHEET_ID = '1lMK248oPi3NxFSLyZbk-y09UEcwFMep5fnGhkFBDl4M';

export const GOOGLE_SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export const WORKSHEETS = {
  USERS: 'Users',
  ORGANIZATIONS: 'Organizations',
  ORGANIZATION_MEMBERS: 'OrganizationMembers',
  PROJECTS: 'Projects',
  PAGES: 'Pages',
  SECTIONS: 'Sections',
  COMPONENT_DEFINITIONS: 'ComponentDefinitions',
  THEMES: 'Themes',
  ASSETS: 'Assets',
  REVISIONS: 'Revisions',
  PUBLISHED_SITES: 'PublishedSites',
  TEMPLATES: 'Templates',
  DOMAINS: 'Domains',
} as const;

export type WorksheetName = typeof WORKSHEETS[keyof typeof WORKSHEETS];

export const WORKSHEET_HEADERS: Record<WorksheetName, string[]> = {
  [WORKSHEETS.USERS]: [
    'id', 'email', 'password_hash', 'salt', 'name', 'avatar_url', 'status', 'created_at', 'updated_at'
  ],
  [WORKSHEETS.ORGANIZATIONS]: [
    'id', 'name', 'slug', 'logo_url', 'plan', 'status', 'created_at', 'updated_at'
  ],
  [WORKSHEETS.ORGANIZATION_MEMBERS]: [
    'id', 'organization_id', 'user_id', 'role', 'joined_at'
  ],
  [WORKSHEETS.PROJECTS]: [
    'id', 'organization_id', 'name_ar', 'name_en', 'description_ar', 'description_en', 'logo', 'visible', 'theme_id', 'default_page_id', 'created_at', 'updated_at'
  ],
  [WORKSHEETS.PAGES]: [
    'id', 'project_id', 'name', 'slug', 'order', 'visible', 'seo_metadata_json', 'created_at', 'updated_at'
  ],
  [WORKSHEETS.SECTIONS]: [
    'id', 'page_id', 'name', 'order', 'visible', 'layout_items_json', 'custom_classes', 'components_json', 'created_at', 'updated_at'
  ],
  [WORKSHEETS.COMPONENT_DEFINITIONS]: [
    'id', 'type', 'label_ar', 'label_en', 'icon', 'default_content_json', 'schema_version'
  ],
  [WORKSHEETS.THEMES]: [
    'id', 'organization_id', 'name', 'primary_color', 'secondary_color', 'font_family', 'custom_css', 'created_at', 'updated_at'
  ],
  [WORKSHEETS.ASSETS]: [
    'id', 'organization_id', 'project_id', 'filename', 'mime_type', 'size', 'url', 'storage_type', 'created_at'
  ],
  [WORKSHEETS.REVISIONS]: [
    'id', 'project_id', 'page_id', 'author_user_id', 'snapshot_json', 'version', 'comment', 'created_at'
  ],
  [WORKSHEETS.PUBLISHED_SITES]: [
    'id', 'project_id', 'domain_id', 'published_revision_id', 'published_data_json', 'status', 'published_at'
  ],
  [WORKSHEETS.TEMPLATES]: [
    'id', 'name', 'category', 'preview_image', 'structure_json', 'is_public', 'created_at'
  ],
  [WORKSHEETS.DOMAINS]: [
    'id', 'project_id', 'hostname', 'verified', 'ssl_status', 'created_at'
  ],
};

export const INITIAL_COMPONENT_DEFINITIONS = [
  {
    id: 'comp-logo',
    type: 'logo',
    label_ar: 'شعار',
    label_en: 'Logo',
    icon: 'pi-image',
    default_content_json: JSON.stringify({ image: '', width: 120, height: 60, customClasses: 'w-[100%]' }),
    schema_version: '1.0'
  },
  {
    id: 'comp-menu',
    type: 'nav-menu',
    label_ar: 'قائمة التنقل',
    label_en: 'Navigation Menu',
    icon: 'pi-bars',
    default_content_json: JSON.stringify({ items: [], customClasses: 'w-[100%]' }),
    schema_version: '1.0'
  },
  {
    id: 'comp-buttons',
    type: 'buttons',
    label_ar: 'أزرار',
    label_en: 'Buttons',
    icon: 'pi-stop',
    default_content_json: JSON.stringify({ buttons: [{ text: 'Click Here', link: '#' }], customClasses: 'w-[100%]' }),
    schema_version: '1.0'
  },
  {
    id: 'comp-card-slider',
    type: 'card-slider',
    label_ar: 'شريط بطاقات',
    label_en: 'Card Slider',
    icon: 'pi-clone',
    default_content_json: JSON.stringify({ cards: [], customClasses: 'w-[100%]' }),
    schema_version: '1.0'
  },
  {
    id: 'comp-accordion',
    type: 'accordion',
    label_ar: 'أكورديون',
    label_en: 'Accordion',
    icon: 'pi-list',
    default_content_json: JSON.stringify({ items: [], customClasses: 'w-[100%]' }),
    schema_version: '1.0'
  },
  {
    id: 'comp-timeline',
    type: 'timeline',
    label_ar: 'الجدول الزمني',
    label_en: 'Timeline',
    icon: 'pi-calendar',
    default_content_json: JSON.stringify({ events: [], customClasses: 'w-[100%]' }),
    schema_version: '1.0'
  },
  {
    id: 'comp-social',
    type: 'social-media',
    label_ar: 'روابط التواصل',
    label_en: 'Social Media',
    icon: 'pi-share-alt',
    default_content_json: JSON.stringify({ links: [], customClasses: 'w-[100%]' }),
    schema_version: '1.0'
  },
  {
    id: 'comp-tabs',
    type: 'tabs',
    label_ar: 'تبويبات',
    label_en: 'Tabs',
    icon: 'pi-table',
    default_content_json: JSON.stringify({ tabs: [], customClasses: 'w-[100%]' }),
    schema_version: '1.0'
  },
  {
    id: 'comp-custom-html',
    type: 'custom-html',
    label_ar: 'HTML مخصص',
    label_en: 'Custom HTML',
    icon: 'pi-code',
    default_content_json: JSON.stringify({ html: '<div>Custom HTML Content</div>', customClasses: 'w-[100%]' }),
    schema_version: '1.0'
  }
];

