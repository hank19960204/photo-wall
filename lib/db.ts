import { createClient } from '@vercel/postgres';
import type { Photo, StickerColor } from './types';

// 建立一個共用的查詢函式，自動處理連線與斷線，完美繞過 Vercel 的嚴格檢查
async function query(callback: (client: any) => Promise<any>) {
  const client = createClient();
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

export async function getAllPhotos(): Promise<Photo[]> {
  return query(async (client) => {
    const { rows } = await client.sql`
      SELECT
        id::text,
        url,
        caption,
        tags,
        date,
        rotation,
        sticker_color,
        created_at::text
      FROM photos
      ORDER BY created_at DESC
    `;
    return rows.map((r: any) => ({
      ...r,
      tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags ?? '[]'),
    })) as Photo[];
  });
}

export async function createPhoto(
  photo: Omit<Photo, 'id' | 'created_at'>
): Promise<Photo> {
  return query(async (client) => {
    const tagsJson = JSON.stringify(photo.tags);
    const { rows } = await client.sql`
      INSERT INTO photos (url, caption, tags, date, rotation, sticker_color)
      VALUES (
        ${photo.url},
        ${photo.caption},
        ${tagsJson}::jsonb,
        ${photo.date},
        ${photo.rotation},
        ${photo.sticker_color}
      )
      RETURNING
        id::text,
        url,
        caption,
        tags,
        date,
        rotation,
        sticker_color,
        created_at::text
    `;
    const row = rows[0];
    return {
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags ?? '[]'),
    } as Photo;
  });
}

export async function updatePhotoCaption(id: string, caption: string): Promise<void> {
  await query((client) => client.sql`UPDATE photos SET caption = ${caption} WHERE id = ${id}`);
}

export async function updatePhotoTags(id: string, tags: string[]): Promise<void> {
  const tagsJson = JSON.stringify(tags);
  await query((client) => client.sql`UPDATE photos SET tags = ${tagsJson}::jsonb WHERE id = ${id}`);
}

export async function updatePhotoStickerColor(id: string, color: StickerColor): Promise<void> {
  await query((client) => client.sql`UPDATE photos SET sticker_color = ${color} WHERE id = ${id}`);
}

export async function deletePhoto(id: string): Promise<void> {
  await query((client) => client.sql`DELETE FROM photos WHERE id = ${id}`);
}
