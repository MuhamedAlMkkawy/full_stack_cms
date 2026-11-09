import { BaseRepository } from './base.repository';
import { WORKSHEETS } from '../services/google-sheets/googleSheetsConfig';
import type { Asset } from '../services/google-sheets/googleSheetsTypes';
import { cloudinaryService } from '../services/cloudinary/cloudinaryService';
import { useAuthStore } from '../stores/authStore';

export class AssetsRepository extends BaseRepository<Asset> {
  constructor() {
    super(WORKSHEETS.ASSETS);
  }

  /**
   * Helper to resolve active organization ID and project ID if not explicitly passed.
   */
  private resolveContextIds(metadata?: { organization_id?: string; project_id?: string }) {
    let orgId = metadata?.organization_id || '';
    let projId = metadata?.project_id || '';

    if (!orgId) {
      try {
        const authStore = useAuthStore();
        orgId = (authStore?.user as any)?.organization_id || '';
      } catch {
        // Non-reactive or server context
      }
    }

    if (!projId) {
      try {
        const route = useRoute();
        if (route?.params?.id) {
          projId = String(route.params.id);
        }
      } catch {
        // Non-reactive or server context
      }
    }

    return { organization_id: orgId, project_id: projId };
  }

  /**
   * Store uploaded file as an asset record.
   * If a File object is passed, it is uploaded to Cloudinary (NEVER as Base64 in Google Sheets).
   * Only the secure Cloudinary URL and metadata are stored in the Assets worksheet.
   */
  public async uploadAsset(
    fileOrUrl: File | string,
    metadata?: { organization_id?: string; project_id?: string; filename?: string },
    onProgress?: (percent: number) => void
  ): Promise<Asset> {
    const context = this.resolveContextIds(metadata);

    // 1. If string: already an image URL (external or previously uploaded)
    if (typeof fileOrUrl === 'string') {
      const url = fileOrUrl.trim();
      const isCloudinary = url.includes('cloudinary.com');

      return await this.create({
        filename: metadata?.filename || 'image',
        mime_type: 'image/jpeg',
        size: 0,
        url: url,
        storage_type: isCloudinary ? 'cloudinary' : 'external',
        organization_id: context.organization_id,
        project_id: context.project_id,
      });
    }

    // 2. If File object: upload to Cloudinary directly, receive secure URL
    const file = fileOrUrl;

    // Validate image format and size
    const validation = cloudinaryService.validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image file');
    }

    const uploadRes = await cloudinaryService.uploadImage(file, {
      folder: 'cms_assets',
      onProgress,
    });

    // Store ONLY the Cloudinary secure URL and metadata in Google Sheets
    return await this.create({
      filename: file.name,
      mime_type: file.type || `image/${uploadRes.format}`,
      size: uploadRes.bytes || file.size,
      url: uploadRes.secure_url,
      storage_type: 'cloudinary',
      organization_id: context.organization_id,
      project_id: context.project_id,
    });
  }

  /**
   * Find an asset record by its URL.
   */
  public async findByUrl(url: string): Promise<Asset | null> {
    if (!url) return null;
    const matches = await this.findWhere((a) => a.url === url);
    return matches[0] || null;
  }

  /**
   * Delete an asset row by its URL.
   */
  public async deleteByUrl(url: string): Promise<boolean> {
    if (!url) return false;
    const matches = await this.findWhere((a) => a.url === url);
    if (matches.length > 0) {
      for (const asset of matches) {
        if (asset.id) {
          await this.delete(asset.id);
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Get all assets belonging to a specific project.
   */
  public async getAssetsByProject(projectId: string): Promise<Asset[]> {
    return await this.findWhere((a) => a.project_id === projectId);
  }

  /**
   * Get all assets belonging to a specific organization.
   */
  public async getAssetsByOrganization(organizationId: string): Promise<Asset[]> {
    return await this.findWhere((a) => a.organization_id === organizationId);
  }
}

export const assetsRepository = new AssetsRepository();
