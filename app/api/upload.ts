declare const GAIA_API_BASE_URI: string;

export interface UploadResult {
  url: string;
  thumbnailUrl: string;
}

export async function uploadImage(
  file: File,
  type: 'avatar' | 'banner',
  token: string
): Promise<UploadResult> {
  const res = await fetch(`${GAIA_API_BASE_URI}/upload/${type}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });
  const data = await res.json();
  return {
    url: data.url as string,
    thumbnailUrl: data.thumbnailUrl as string,
  };
}
