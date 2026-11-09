import { BaseRepository } from './base.repository';
import { WORKSHEETS } from '../services/google-sheets/googleSheetsConfig';
import type { Asset } from '../services/google-sheets/googleSheetsTypes';

export class AssetsRepository extends BaseRepository<Asset> {
  constructor() {
    super(WORKSHEETS.ASSETS);
  }

  /**
   * Store uploaded file as an asset record.
   * If a File object is passed, converts it to an inline Data URL or stores external URL.
   */
  public async uploadAsset(
    fileOrUrl: File | string,
    metadata?: { organization_id?: string; project_id?: string; filename?: string }
  ): Promise<Asset> {
    if (typeof fileOrUrl === 'string') {
      return await this.create({
        filename: metadata?.filename || 'external-image',
        mime_type: 'image/jpeg',
        size: 0,
        url: fileOrUrl,
        storage_type: 'external',
        organization_id: metadata?.organization_id || '',
        project_id: metadata?.project_id || '',
      });
    }

    const file = fileOrUrl;
    const dataUrl = await this.fileToDataUrl(file);

    return await this.create({
      filename: file.name,
      mime_type: file.type,
      size: file.size,
      url: dataUrl,
      storage_type: 'data_url',
      organization_id: metadata?.organization_id || '',
      project_id: metadata?.project_id || '',
    });
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const assetsRepository = new AssetsRepository();

