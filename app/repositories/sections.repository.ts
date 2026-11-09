import { BaseRepository } from './base.repository';
import { WORKSHEETS } from '../services/google-sheets/googleSheetsConfig';
import type { Section } from '../services/google-sheets/googleSheetsTypes';

export class SectionsRepository extends BaseRepository<Section> {
  constructor() {
    super(WORKSHEETS.SECTIONS);
  }

  /**
   * Get all sections for a specific page.
   */
  public async getByPageId(pageId: string): Promise<Section[]> {
    return await this.findWhere(
      (s) => s.page_id === pageId,
      { sortBy: 'order', sortDirection: 'asc' }
    );
  }

  /**
   * Update component tree for a section directly.
   */
  public async updateComponents(sectionId: string, components: any[]): Promise<Section> {
    return await this.update(sectionId, {
      components_json: JSON.stringify(components),
    });
  }
}

export const sectionsRepository = new SectionsRepository();

