import { defineEventHandler, readMultipartFormData, createError } from 'h3';
import crypto from 'node:crypto';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    (config.public?.cloudinaryCloudName as string) ||
    'pg2ruop3';

  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    (config.cloudinaryApiKey as string) ||
    '618617527253867';

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ||
    (config.cloudinaryApiSecret as string) ||
    'haDjVa2VdLTqSI_Ja8iATjWsID0';

  // Read multipart form data from request
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file received for upload',
    });
  }

  const fileItem = formData.find((item) => item.name === 'file');
  if (!fileItem || !fileItem.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing file field in upload request',
    });
  }

  // If server has API Key and Secret, perform a trusted signed Cloudinary upload
  if (cloudName && apiKey && apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folderItem = formData.find((item) => item.name === 'folder');
    const folder = folderItem?.data?.toString();

    // Build params for signature
    const paramsToSign: Record<string, any> = {
      timestamp: timestamp,
    };
    if (folder) {
      paramsToSign.folder = folder;
    }

    // Sort keys alphabetically and format as "key=value&key2=value2"
    const sortedKeys = Object.keys(paramsToSign).sort();
    const signString =
      sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&') + apiSecret;

    const signature = crypto.createHash('sha1').update(signString).digest('hex');

    // Create outbound form to Cloudinary
    const outboundBody = new FormData();
    const fileBlob = new Blob([fileItem.data], {
      type: fileItem.type || 'image/jpeg',
    });
    outboundBody.append('file', fileBlob, fileItem.filename || 'upload.jpg');
    outboundBody.append('api_key', apiKey);
    outboundBody.append('timestamp', timestamp.toString());
    outboundBody.append('signature', signature);
    if (folder) {
      outboundBody.append('folder', folder);
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: outboundBody,
    });

    const resJson = await response.json();
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: resJson?.error?.message || 'Signed Cloudinary upload failed',
      });
    }

    return {
      secure_url: resJson.secure_url || resJson.url,
      url: resJson.url || resJson.secure_url,
      public_id: resJson.public_id,
      format: resJson.format,
      width: resJson.width,
      height: resJson.height,
      bytes: resJson.bytes,
      original_filename: resJson.original_filename || fileItem.filename,
    };
  }

  // If Cloudinary server credentials are not set on server:
  throw createError({
    statusCode: 400,
    statusMessage:
      'Cloudinary server credentials (CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET) are not set. Please either set them in your server environment or configure your Cloudinary upload preset as "Unsigned" in Cloudinary Console.',
  });
});

