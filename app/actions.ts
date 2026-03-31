'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';
import {
  getAllPhotos,
  createPhoto,
  updatePhotoCaption,
  updatePhotoTags,
  updatePhotoStickerColor,
  deletePhoto,
} from '@/lib/db';
import { isAdminAuthenticated, buildSessionCookie } from '@/lib/auth';
import type { Photo, StickerColor } from '@/lib/types';

// ── 登入 ──────────────────────────────────────────────
export async function loginAction(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const password = formData.get('password') as string;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return '密碼錯誤，請再試一次';
  }
  const token = process.env.ADMIN_SESSION_TOKEN;
  if (!token) return '伺服器設定錯誤，請聯絡管理員';

  const cookieStore = await cookies();
  cookieStore.set(buildSessionCookie(token));
  revalidatePath('/');
  return null; // null = 成功
}

// ── 登出 ──────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('pw_admin_session');
  revalidatePath('/');
}

// ── 上傳照片 ──────────────────────────────────────────
export async function uploadPhotoAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; photo?: Photo }> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: '請先登入管理員帳號' };
  }

  const file = formData.get('file') as File | null;
  const caption = (formData.get('caption') as string)?.trim() ?? '';
  const tagsRaw = (formData.get('tags') as string) ?? '';

  if (!file || file.size === 0) {
    return { success: false, error: '請選擇一張照片' };
  }

  // 只允許圖片
  if (!file.type.startsWith('image/')) {
    return { success: false, error: '只支援圖片檔案（jpg、png、webp 等）' };
  }

  // 上傳到 Vercel Blob
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const { url } = await put(`photos/${Date.now()}-${safeName}`, file, {
    access: 'public',
  });

  const tags = tagsRaw
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => (t.startsWith('#') ? t : `#${t}`));

  const colors: StickerColor[] = ['pink', 'yellow', 'green'];
  const newPhoto = await createPhoto({
    url,
    caption: caption || 'Untitled',
    tags,
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
    rotation: parseFloat((Math.random() * 6 - 3).toFixed(2)),
    sticker_color: colors[Math.floor(Math.random() * 3)],
  });

  revalidatePath('/');
  return { success: true, photo: newPhoto };
}

// ── 更新 caption ──────────────────────────────────────
export async function updateCaptionAction(
  id: string,
  caption: string
): Promise<{ success: boolean }> {
  if (!(await isAdminAuthenticated())) return { success: false };
  await updatePhotoCaption(id, caption);
  revalidatePath('/');
  return { success: true };
}

// ── 更新 tags ─────────────────────────────────────────
export async function updateTagsAction(
  id: string,
  tags: string[]
): Promise<{ success: boolean }> {
  if (!(await isAdminAuthenticated())) return { success: false };
  await updatePhotoTags(id, tags);
  revalidatePath('/');
  return { success: true };
}

// ── 更新 sticker color ────────────────────────────────
export async function updateStickerColorAction(
  id: string,
  color: StickerColor
): Promise<{ success: boolean }> {
  if (!(await isAdminAuthenticated())) return { success: false };
  await updatePhotoStickerColor(id, color);
  revalidatePath('/');
  return { success: true };
}

// ── 刪除照片 ──────────────────────────────────────────
export async function deletePhotoAction(
  id: string
): Promise<{ success: boolean }> {
  if (!(await isAdminAuthenticated())) return { success: false };
  await deletePhoto(id);
  revalidatePath('/');
  return { success: true };
}
