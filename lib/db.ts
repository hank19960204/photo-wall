import { sql } from '@vercel/postgres';
import type { Photo, StickerColor } from './types';

export async function getAllPhotos(): Promise<Photo[]> {
  const { rows } = await sql`
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
  return rows.map(r => ({
    ...r,
    tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags ?? '[]'),
  })) as Photo[];
}

export async function createPhoto(
  photo: Omit<Photo, 'id' | 'created_at'>
): Promise<Photo> {
  const tagsJson = JSON.stringify(photo.tags);
  const { rows } = await sql`
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
}

export async function updatePhotoCaption(id: string, caption: string): Promise<void> {
  await sql`UPDATE photos SET caption = ${caption} WHERE id = ${id}`;
}

export async function updatePhotoTags(id: string, tags: string[]): Promise<void> {
  const tagsJson = JSON.stringify(tags);
  await sql`UPDATE photos SET tags = ${tagsJson}::jsonb WHERE id = ${id}`;
}

export async function updatePhotoStickerColor(id: string, color: StickerColor): Promise<void> {
  await sql`UPDATE photos SET sticker_color = ${color} WHERE id = ${id}`;
}

export async function deletePhoto(id: string): Promise<void> {
  await sql`DELETE FROM photos WHERE id = ${id}`;
}
