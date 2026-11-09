import { BaseRepository } from './base.repository';
import { WORKSHEETS } from '../services/google-sheets/googleSheetsConfig';
import type { PublishedSite, Revision } from '../services/google-sheets/googleSheetsTypes';
import { projectsRepository } from './projects.repository';
import { googleSheetsClient } from '../services/google-sheets/googleSheetsClient';
import { generateUUID } from '../services/google-sheets/googleSheetsHelpers';

export class PublishingRepository extends BaseRepository<PublishedSite> {
  constructor() {
    super(WORKSHEETS.PUBLISHED_SITES);
  }

  /**
   * Publish a project by creating an immutable snapshot.
   */
  public async publishProject(projectId: string, authorUserId = 'system', comment = 'Published release'): Promise<PublishedSite> {
    const projectTree = await projectsRepository.getProjectTree(projectId);
    if (!projectTree) {
      throw new Error(`Project with ID "${projectId}" not found.`);
    }

    const snapshotJson = JSON.stringify(projectTree);

    // 1. Create a revision record
    const revisions = await googleSheetsClient.findRows<Revision>(
      WORKSHEETS.REVISIONS,
      (r) => r.project_id === projectId
    );
    const newVersion = revisions.length + 1;

    const revision = await googleSheetsClient.createRow<Revision>(WORKSHEETS.REVISIONS, {
      id: generateUUID(),
      project_id: projectId,
      page_id: projectTree.default_page_id || '',
      author_user_id: authorUserId,
      snapshot_json: snapshotJson,
      version: newVersion,
      comment: `${comment} (v${newVersion})`,
    });

    // 2. Upsert PublishedSites entry
    const existingPublished = await this.findWhere((p) => p.project_id === projectId);
    const now = new Date().toISOString();

    if (existingPublished.length > 0) {
      return await this.update(existingPublished[0].id, {
        published_revision_id: revision.id,
        published_data_json: snapshotJson,
        status: 'published',
        published_at: now,
      });
    }

    return await this.create({
      project_id: projectId,
      domain_id: '',
      published_revision_id: revision.id,
      published_data_json: snapshotJson,
      status: 'published',
      published_at: now,
    });
  }

  /**
   * Unpublish a project.
   */
  public async unpublishProject(projectId: string): Promise<boolean> {
    const existing = await this.findWhere((p) => p.project_id === projectId);
    if (!existing.length) return false;
    await this.update(existing[0].id, {
      status: 'unpublished',
    });
    return true;
  }

  /**
   * Get the published website snapshot for public rendering.
   */
  public async getPublishedSnapshot(projectId: string): Promise<any | null> {
    const published = await this.findWhere((p) => p.project_id === projectId && p.status === 'published');
    if (!published.length) return null;

    try {
      return JSON.parse(published[0].published_data_json);
    } catch {
      return null;
    }
  }
}

export const publishingRepository = new PublishingRepository();

