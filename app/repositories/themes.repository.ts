import { BaseRepository } from './base.repository';
import { WORKSHEETS } from '../services/google-sheets/googleSheetsConfig';
import type { Theme } from '../services/google-sheets/googleSheetsTypes';

export class ThemesRepository extends BaseRepository<Theme> {
  constructor() {
    super(WORKSHEETS.THEMES);
  }

  public async getByOrganization(organizationId: string): Promise<Theme[]> {
    return await this.findWhere((t) => t.organization_id === organizationId);
  }
}

export const themesRepository = new ThemesRepository();

