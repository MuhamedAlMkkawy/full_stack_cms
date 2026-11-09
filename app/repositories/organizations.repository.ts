import { BaseRepository } from './base.repository';
import { WORKSHEETS } from '../services/google-sheets/googleSheetsConfig';
import type { Organization, OrganizationMember } from '../services/google-sheets/googleSheetsTypes';
import { googleSheetsClient } from '../services/google-sheets/googleSheetsClient';

export class OrganizationsRepository extends BaseRepository<Organization> {
  constructor() {
    super(WORKSHEETS.ORGANIZATIONS);
  }

  /**
   * Find an organization by its slug.
   */
  public async findBySlug(slug: string): Promise<Organization | null> {
    const matches = await this.findWhere((org) => org.slug === slug);
    return matches[0] || null;
  }

  /**
   * Get all organizations that a user belongs to.
   */
  public async getUserOrganizations(userId: string): Promise<{ organization: Organization; role: string }[]> {
    const members = await googleSheetsClient.findRows<OrganizationMember>(
      WORKSHEETS.ORGANIZATION_MEMBERS,
      (m) => m.user_id === userId
    );

    if (!members.length) return [];

    const orgIds = new Set(members.map((m) => m.organization_id));
    const allOrgs = await this.findAll();

    const result: { organization: Organization; role: string }[] = [];
    for (const member of members) {
      const org = allOrgs.find((o) => o.id === member.organization_id);
      if (org) {
        result.push({ organization: org, role: member.role });
      }
    }

    return result;
  }

  /**
   * Add a user to an organization with a specific role.
   */
  public async addMember(
    organizationId: string,
    userId: string,
    role: 'owner' | 'admin' | 'editor' | 'viewer' = 'editor'
  ): Promise<OrganizationMember> {
    return await googleSheetsClient.createRow<OrganizationMember>(WORKSHEETS.ORGANIZATION_MEMBERS, {
      organization_id: organizationId,
      user_id: userId,
      role,
      joined_at: new Date().toISOString(),
    });
  }
}

export const organizationsRepository = new OrganizationsRepository();

