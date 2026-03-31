/**
 * 資料庫初始化腳本
 * 執行方式：npx tsx scripts/migrate.ts
 *
 * 需要先在 .env.local 設定好 POSTGRES_URL 等環境變數
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 載入 .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

async function migrate() {
  console.log('🚀 Starting migration...\n');

  // 建立 photos 資料表
  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url           TEXT        NOT NULL,
      caption       TEXT        NOT NULL DEFAULT '',
      tags          JSONB       NOT NULL DEFAULT '[]',
      date          TEXT        NOT NULL,
      rotation      FLOAT       NOT NULL DEFAULT 0,
      sticker_color TEXT        NOT NULL DEFAULT 'pink'
                    CHECK (sticker_color IN ('pink', 'yellow', 'green')),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✅ Table "photos" created (or already exists)');

  // 建立索引（讓依時間排序更快）
  await sql`
    CREATE INDEX IF NOT EXISTS photos_created_at_idx
    ON photos (created_at DESC)
  `;
  console.log('✅ Index "photos_created_at_idx" created (or already exists)');

  // 插入示範資料（只在資料表是空的時候）
  const { rows } = await sql`SELECT COUNT(*) as count FROM photos`;
  const count = parseInt(rows[0].count, 10);

  if (count === 0) {
    console.log('\n📸 Inserting seed data...');

    const seeds = [
      {
        url: 'https://picsum.photos/seed/vintage1/800/1000',
        caption: 'Sunset at the bay',
        tags: JSON.stringify(['#Sunset', '#Nature']),
        date: 'Oct 12, 2013',
        rotation: -2.5,
        sticker_color: 'pink',
      },
      {
        url: 'https://picsum.photos/seed/vintage2/800/800',
        caption: 'Old lighthouse',
        tags: JSON.stringify(['#Lighthouse', '#Adventure']),
        date: 'Nov 05, 2013',
        rotation: 1.8,
        sticker_color: 'yellow',
      },
      {
        url: 'https://picsum.photos/seed/vintage3/1000/800',
        caption: 'The diner breakfast',
        tags: JSON.stringify(['#Breakfast', '#Food']),
        date: 'Dec 20, 2013',
        rotation: -1.2,
        sticker_color: 'green',
      },
      {
        url: 'https://picsum.photos/seed/vintage4/800/1200',
        caption: 'Rainy day window',
        tags: JSON.stringify(['#Rain', '#Mood']),
        date: 'Jan 15, 2014',
        rotation: 2.1,
        sticker_color: 'pink',
      },
      {
        url: 'https://picsum.photos/seed/vintage5/900/900',
        caption: 'Abandoned tracks',
        tags: JSON.stringify(['#Exploration', '#Life']),
        date: 'Feb 10, 2014',
        rotation: -0.8,
        sticker_color: 'yellow',
      },
      {
        url: 'https://picsum.photos/seed/vintage6/800/1000',
        caption: 'Late night study',
        tags: JSON.stringify(['#Study', '#Life']),
        date: 'Mar 02, 2014',
        rotation: 1.5,
        sticker_color: 'green',
      },
    ];

    for (const s of seeds) {
      await sql`
        INSERT INTO photos (url, caption, tags, date, rotation, sticker_color)
        VALUES (
          ${s.url},
          ${s.caption},
          ${s.tags}::jsonb,
          ${s.date},
          ${s.rotation},
          ${s.sticker_color}
        )
      `;
    }
    console.log(`✅ Inserted ${seeds.length} seed photos`);
  } else {
    console.log(`\nℹ️  Table already has ${count} row(s), skipping seed data`);
  }

  console.log('\n🎉 Migration complete!\n');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
