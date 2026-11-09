import { BaseRepository } from './base.repository';
import { WORKSHEETS } from '../services/google-sheets/googleSheetsConfig';
import type { Project, Page, Section } from '../services/google-sheets/googleSheetsTypes';
import { googleSheetsClient } from '../services/google-sheets/googleSheetsClient';

export interface ProjectWithTree extends Project {
  _id: string; // Compatibility alias
  name: string; // Compatibility display name
  pages: (Page & {
    _id: string;
    sections: (Section & {
      components: any[];
    })[];
  })[];
}

export class ProjectsRepository extends BaseRepository<Project> {
  constructor() {
    super(WORKSHEETS.PROJECTS);
  }

  /**
   * Get all projects, optionally filtered by organization.
   * Maps fields to ensure backward-compatibility with existing templates (_id, name, logo, visible).
   */
  public async getProjectsList(organizationId?: string, lang = 'ar'): Promise<any[]> {
    const projects = organizationId
      ? await this.findWhere((p) => p.organization_id === organizationId)
      : await this.findAll();

    return projects.map((p) => ({
      ...p,
      _id: p.id,
      name: lang === 'en' ? (p.name_en || p.name_ar) : (p.name_ar || p.name_en),
      visible: Boolean(p.visible),
      logo: p.logo || '',
    }));
  }

  /**
   * Toggle project draft visibility.
   */
  public async toggleVisibility(projectId: string, visible: boolean): Promise<Project> {
    return await this.update(projectId, { visible });
  }

  /**
   * Get the full tree for the drag-and-drop builder:
   * Project -> Pages -> Sections -> Components.
   */
  public async getProjectTree(projectId: string, lang = 'ar'): Promise<ProjectWithTree | null> {
    const project = await this.findById(projectId);
    if (!project) return null;

    // Fetch pages for this project, ordered
    const pages = await googleSheetsClient.findRows<Page>(
      WORKSHEETS.PAGES,
      (p) => p.project_id === projectId,
      { sortBy: 'order', sortDirection: 'asc' }
    );

    // Fetch all sections for these pages
    const pageIds = new Set(pages.map((p) => p.id));
    const allSections = await googleSheetsClient.findRows<Section>(
      WORKSHEETS.SECTIONS,
      (s) => pageIds.has(s.page_id),
      { sortBy: 'order', sortDirection: 'asc' }
    );

    // Group sections by page_id
    const sectionsByPageId = new Map<string, any[]>();
    for (const sec of allSections) {
      if (!sectionsByPageId.has(sec.page_id)) {
        sectionsByPageId.set(sec.page_id, []);
      }

      let parsedComponents: any[] = [];
      try {
        parsedComponents = sec.components_json ? JSON.parse(sec.components_json) : [];
      } catch {
        parsedComponents = [];
      }

      let parsedLayoutItems: any[] = [];
      try {
        parsedLayoutItems = sec.layout_items_json ? JSON.parse(sec.layout_items_json) : [];
      } catch {
        parsedLayoutItems = [];
      }

      sectionsByPageId.get(sec.page_id)!.push({
        ...sec,
        id: sec.id,
        _id: sec.id,
        visible: Boolean(sec.visible),
        layout_items: parsedLayoutItems,
        components: parsedComponents.map((c: any) => ({
          ...c,
          _id: c.id || c._id,
          id: c.id || c._id,
        })),
      });
    }

    // Assemble pages tree
    const pagesTree = pages.map((page) => ({
      ...page,
      _id: page.id,
      visible: Boolean(page.visible),
      sections: sectionsByPageId.get(page.id) || [],
    }));

    return {
      ...project,
      _id: project.id,
      name: lang === 'en' ? (project.name_en || project.name_ar) : (project.name_ar || project.name_en),
      pages: pagesTree,
    };
  }

  /**
   * Aggregate statistics for the dashboard.
   */
  public async getDashboardStatistics(organizationId?: string): Promise<{
    projects: number;
    pages: number;
    sections: number;
    components: number;
  }> {
    const projects = organizationId
      ? await this.findWhere((p) => p.organization_id === organizationId)
      : await this.findAll();

    const projectIds = new Set(projects.map((p) => p.id));

    const pages = await googleSheetsClient.findRows<Page>(
      WORKSHEETS.PAGES,
      (p) => projectIds.has(p.project_id)
    );

    const pageIds = new Set(pages.map((p) => p.id));

    const sections = await googleSheetsClient.findRows<Section>(
      WORKSHEETS.SECTIONS,
      (s) => pageIds.has(s.page_id)
    );

    let totalComponents = 0;
    for (const sec of sections) {
      if (sec.components_json) {
        try {
          const comps = JSON.parse(sec.components_json);
          if (Array.isArray(comps)) {
            totalComponents += comps.length;
          }
        } catch {
          // ignore corrupted JSON
        }
      }
    }

    return {
      projects: projects.length,
      pages: pages.length,
      sections: sections.length,
      components: totalComponents,
    };
  }
}

export const projectsRepository = new ProjectsRepository();

