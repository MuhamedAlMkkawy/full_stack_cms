import { BaseRepository } from './base.repository';
import { WORKSHEETS, INITIAL_COMPONENT_DEFINITIONS } from '../services/google-sheets/googleSheetsConfig';
import type { ComponentDefinition } from '../services/google-sheets/googleSheetsTypes';

export class ComponentDefinitionsRepository extends BaseRepository<ComponentDefinition> {
  constructor() {
    super(WORKSHEETS.COMPONENT_DEFINITIONS);
  }

  /**
   * Get all registered component definitions, seeding defaults if the worksheet is empty.
   */
  public async getAvailableComponents(): Promise<ComponentDefinition[]> {
    const existing = await this.findAll();
    if (existing.length > 0) {
      return existing;
    }

    // Seed initial component definitions
    try {
      return await this.batchCreate(INITIAL_COMPONENT_DEFINITIONS as any);
    } catch {
      return INITIAL_COMPONENT_DEFINITIONS as any;
    }
  }
}

export const componentDefinitionsRepository = new ComponentDefinitionsRepository();

