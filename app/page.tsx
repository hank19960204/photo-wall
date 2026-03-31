import { getAllPhotos } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { PhotoWall } from '@/components/PhotoWall';

// 每次請求都重新從資料庫拉資料（不快取）
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [photos, isAdmin] = await Promise.all([
    getAllPhotos(),
    isAdminAuthenticated(),
  ]);

  return <PhotoWall initialPhotos={photos} isAdmin={isAdmin} />;
}
