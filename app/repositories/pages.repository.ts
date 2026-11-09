import { BaseRepository } from './base.repository';
import { WORKSHEETS } from '../services/google-sheets/googleSheetsConfig';
import type { Page, Section } from '../services/google-sheets/googleSheetsTypes';
import { googleSheetsClient } from '../services/google-sheets/googleSheetsClient';
import { generateUUID } from '../services/google-sheets/googleSheetsHelpers';

export class PagesRepository extends BaseRepository<Page> {
  constructor() {
    super(WORKSHEETS.PAGES);
  }

  /**
   * Get pages for a specific project.
   */
  public async getByProjectId(projectId: string): Promise<Page[]> {
    return await this.findWhere(
      (p) => p.project_id === projectId,
      { sortBy: 'order', sortDirection: 'asc' }
    );
  }

  /**
   * Save a page along with its nested sections and components.
   * Handles both new pages and updates to existing pages and sections atomically.
   */
  public async savePageWithSections(projectId: string, pagePayload: any): Promise<any> {
    const isNew = !pagePayload._id || /^\d+$/.test(String(pagePayload._id)) || pagePayload._id.length < 10;
    const pageId = isNew ? generateUUID() : pagePayload._id;

    // 1. Save or update Page record
    let savedPage: Page;
    if (isNew) {
      const existingPages = await this.getByProjectId(projectId);
      savedPage = await this.create({
        id: pageId,
        project_id: projectId,
        name: pagePayload.name || 'New Page',
        slug: pagePayload.slug || `page-${existingPages.length + 1}`,
        order: pagePayload.order ?? existingPages.length,
        visible: pagePayload.visible !== false,
        seo_metadata_json: typeof pagePayload.seo_metadata === 'object'
          ? JSON.stringify(pagePayload.seo_metadata)
          : (pagePayload.seo_metadata_json || '{}'),
      });
    } else {
      savedPage = await this.update(pageId, {
        name: pagePayload.name,
        visible: pagePayload.visible !== false,
        seo_metadata_json: typeof pagePayload.seo_metadata === 'object'
          ? JSON.stringify(pagePayload.seo_metadata)
          : (pagePayload.seo_metadata_json || '{}'),
      });
    }

    // 2. Synchronize sections
    const incomingSections: any[] = Array.isArray(pagePayload.sections) ? pagePayload.sections : [];
    const existingSections = await googleSheetsClient.findRows<Section>(
      WORKSHEETS.SECTIONS,
      (s) => s.page_id === pageId
    );

    const incomingSectionIds = new Set<string>();

    for (let i = 0; i < incomingSections.length; i++) {
      const sec = incomingSections[i];
      const isSecNew = !sec.id || typeof sec.id === 'number' || String(sec.id).length < 10;
      const sectionId = isSecNew ? generateUUID() : String(sec.id);
      incomingSectionIds.add(sectionId);

      const componentsJson = Array.isArray(sec.components)
        ? JSON.stringify(sec.components.map((c: any) => ({
            ...c,
            id: c.id || c._id || generateUUID(),
            _id: c._id || c.id || generateUUID(),
          })))
        : (sec.components_json || '[]');

      const layoutItemsJson = Array.isArray(sec.layout_items)
        ? JSON.stringify(sec.layout_items)
        : (sec.layout_items_json || '[]');

      if (isSecNew) {
        await googleSheetsClient.createRow<Section>(WORKSHEETS.SECTIONS, {
          id: sectionId,
          page_id: pageId,
          name: sec.name || `Section ${i + 1}`,
          order: i,
          visible: sec.visible !== false,
          layout_items_json: layoutItemsJson,
          custom_classes: sec.custom_classes || '',
          components_json: componentsJson,
        });
      } else {
        await googleSheetsClient.updateRow<Section>(WORKSHEETS.SECTIONS, sectionId, {
          name: sec.name,
          order: i,
          visible: sec.visible !== false,
          layout_items_json: layoutItemsJson,
          custom_classes: sec.custom_classes || '',
          components_json: componentsJson,
        });
      }
    }

    // 3. Delete sections that were removed in the builder
    for (const existingSec of existingSections) {
      if (!incomingSectionIds.has(existingSec.id)) {
        await googleSheetsClient.deleteRow(WORKSHEETS.SECTIONS, existingSec.id);
      }
    }

    // Invalidate caches
    this.invalidateCache();
    googleSheetsClient.invalidateCache(WORKSHEETS.SECTIONS);
    googleSheetsClient.invalidateCache(WORKSHEETS.PROJECTS);

    return {
      ...savedPage,
      _id: savedPage.id,
      sections: incomingSections,
    };
  }
}

export const pagesRepository = new PagesRepository();

