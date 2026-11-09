# Nuxt 4 Direct Google Sheets CMS

A serverless, database-free Content Management System and Website Builder built with **Nuxt 4**, **Vue 3**, **TailwindCSS**, and **PrimeVue**, communicating directly with **Google Sheets** as its primary data store.

---

## Architecture Overview

```
Nuxt 4 Frontend (SPA) ──► Google Sheets API v4 ──► Google Spreadsheet
 (services & repositories)   (OAuth 2.0 GIS Client)      (Primary Data Store)
```

* **No NestJS or Express backend**.
* **No PostgreSQL, MongoDB, or Prisma**.
* **Zero external database dependencies**.
* Uses the official **Google Sheets API v4** with in-browser **Google Identity Services (GIS)** OAuth 2.0 authentication.

---

## Google Spreadsheet Configuration

* **Target Spreadsheet ID**: `1lMK248oPi3NxFSLyZbk-y09UEcwFMep5fnGhkFBDl4M`
* **Google OAuth Scopes**:
  * `https://www.googleapis.com/auth/spreadsheets`
  * `https://www.googleapis.com/auth/userinfo.email`
  * `https://www.googleapis.com/auth/userinfo.profile`

### Worksheets Schema (13 Sheets)

1. **`Users`**: User accounts with Web Crypto PBKDF2 salted password hashes (`id`, `email`, `password_hash`, `salt`, `name`, `avatar_url`, `status`, `created_at`, `updated_at`).
2. **`Organizations`**: Multi-tenant organizations (`id`, `name`, `slug`, `logo_url`, `plan`, `status`, `created_at`, `updated_at`).
3. **`OrganizationMembers`**: Membership & RBAC (`id`, `organization_id`, `user_id`, `role`, `joined_at`).
4. **`Projects`**: Projects metadata (`id`, `organization_id`, `name_ar`, `name_en`, `description_ar`, `description_en`, `logo`, `visible`, `theme_id`, `default_page_id`, `created_at`, `updated_at`).
5. **`Pages`**: Page tree hierarchy (`id`, `project_id`, `name`, `slug`, `order`, `visible`, `seo_metadata_json`, `created_at`, `updated_at`).
6. **`Sections`**: Canvas sections (`id`, `page_id`, `name`, `order`, `visible`, `layout_items_json`, `custom_classes`, `components_json`, `created_at`, `updated_at`).
7. **`ComponentDefinitions`**: Builder draggable component catalog (`id`, `type`, `label_ar`, `label_en`, `icon`, `default_content_json`, `schema_version`).
8. **`Themes`**: Project styling (`id`, `organization_id`, `name`, `primary_color`, `secondary_color`, `font_family`, `custom_css`, `created_at`, `updated_at`).
9. **`Assets`**: Uploaded media metadata (`id`, `organization_id`, `project_id`, `filename`, `mime_type`, `size`, `url`, `storage_type`, `created_at`).
10. **`Revisions`**: Version history and snapshots (`id`, `project_id`, `page_id`, `author_user_id`, `snapshot_json`, `version`, `comment`, `created_at`).
11. **`PublishedSites`**: Immutable production website releases (`id`, `project_id`, `domain_id`, `published_revision_id`, `published_data_json`, `status`, `published_at`).
12. **`Templates`**: Reusable templates (`id`, `name`, `category`, `preview_image`, `structure_json`, `is_public`, `created_at`).
13. **`Domains`**: Custom domain records (`id`, `project_id`, `hostname`, `verified`, `ssl_status`, `created_at`).

---

## Project Structure

```
app/
├── services/
│   └── google-sheets/
│       ├── googleSheetsConfig.ts    # Centralized configuration, endpoints & schemas
│       ├── googleSheetsTypes.ts     # TypeScript interfaces
│       ├── googleSheetsHelpers.ts   # PBKDF2 hashing, UUID, A1 notation, row mapping
│       ├── googleSheetsAuth.ts      # GIS OAuth 2.0 token management
│       └── googleSheetsClient.ts    # Standardized API client (CRUD & batch operations)
│
├── repositories/
│   ├── base.repository.ts          # Generic CRUD repository with cache
│   ├── users.repository.ts
│   ├── organizations.repository.ts
│   ├── projects.repository.ts
│   ├── pages.repository.ts
│   ├── sections.repository.ts
│   ├── assets.repository.ts
│   ├── themes.repository.ts
│   ├── componentDefinitions.repository.ts
│   └── publishing.repository.ts
│
├── composables/
│   ├── useAuth.ts                   # Google OAuth + Application session
│   ├── useOrganizations.ts          # Tenant state
│   ├── useProjects.ts               # Project queries & builder tree
│   ├── usePages.ts                  # Page hierarchy with debounced autosave
│   ├── useSections.ts               # Canvas sections & components
│   ├── useAssets.ts                 # Asset uploads & base64/CDN handling
│   ├── usePublishing.ts             # Snapshot publishing & live site fetching
│   └── useApiMethods.js             # Facade adapter ensuring existing views work unchanged
│
├── components/
│   ├── ProjectControl.vue          # Toolbar with "Publish" and "Live" buttons
│   └── PublicComponentRenderer.vue  # Reusable renderer for live websites
│
└── pages/
    ├── login/index.vue              # Login (Credentials or Google OAuth)
    ├── projects/index.vue           # Project dashboard & visibility toggle
    ├── modify_project/index.vue     # Project creator
    ├── projects/[id]/index.vue      # Visual canvas builder
    └── sites/[id]/index.vue         # Standalone public website viewer
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Google Cloud OAuth 2.0 (Optional for Direct OAuth)
In `nuxt.config.ts` or via environment variable `NUXT_PUBLIC_GOOGLE_CLIENT_ID`:
```ts
runtimeConfig: {
  public: {
    googleSpreadsheetId: "1lMK248oPi3NxFSLyZbk-y09UEcwFMep5fnGhkFBDl4M",
    googleClientId: "<YOUR_GOOGLE_OAUTH_CLIENT_ID>.apps.googleusercontent.com",
  },
}
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Publishing Workflow

1. Design your pages, sections, and components in the visual builder at `/projects/:id`.
2. Edits are automatically validated and persisted to draft state in Google Sheets (`Pages` and `Sections` sheets).
3. Click the **Publish** button in the top toolbar.
4. An immutable release snapshot is generated in `PublishedSites` and recorded in `Revisions`.
5. Public visitors view the live site at `/sites/:id`, completely isolated from any ongoing draft modifications.
