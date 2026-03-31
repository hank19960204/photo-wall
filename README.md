# 📷 Our Memories — Life is Strange Photo Wall

一個充滿懷舊感的拍立得照片牆，靈感來自《奇妙人生》(Life is Strange)。  
使用 Next.js 15 App Router + Tailwind CSS v4 + Vercel Postgres + Vercel Blob 建構。

---

## ✨ 功能特色

- 拍立得風格的照片牆，帶有 3D 翻轉 Lightbox
- 隨機旋轉、螢光貼紙、pushpin 裝飾效果
- 按 Tag 分類篩選
- 管理員密碼登入（Cookie-based）
- 真實圖片上傳（Vercel Blob）
- 資料庫儲存（Vercel Postgres）

---

## 🚀 部署步驟（從零到上線）

### Step 1 — Fork / Clone 這個 repo

```bash
git clone https://github.com/YOUR_USERNAME/photo-wall.git
cd photo-wall
npm install
```

### Step 2 — 在 Vercel 建立專案並連結 Storage

1. 前往 [vercel.com](https://vercel.com) → **Add New Project** → 匯入這個 GitHub repo
2. 先**不要**按 Deploy，進到專案的 **Storage** 頁籤：
   - **建立 Postgres** → 選 `neon` 方案 → Connect to Project
   - **建立 Blob** → Connect to Project
3. 回到 **Settings → Environment Variables**，新增以下兩個變數：

| 變數名 | 說明 |
|--------|------|
| `ADMIN_PASSWORD` | 你要用來登入管理員的密碼 |
| `ADMIN_SESSION_TOKEN` | 隨機字串，用來驗證 Session（見下方產生方式） |

產生 `ADMIN_SESSION_TOKEN` 的方式：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 3 — 拉取環境變數到本地並初始化資料庫

```bash
# 安裝 Vercel CLI（如果還沒有）
npm i -g vercel

# 連結並拉取環境變數
vercel link
vercel env pull .env.local

# 初始化資料表 + 插入示範資料
npm run migrate
```

### Step 4 — 本地開發測試

```bash
npm run dev
# 開啟 http://localhost:3000
```

### Step 5 — 部署到 Vercel

```bash
# 推送到 GitHub，Vercel 會自動偵測並部署
git add .
git commit -m "Initial deploy"
git push origin main
```

或直接用 CLI：
```bash
vercel --prod
```

---

## 🔐 管理員功能

1. 點右上角 **Admin Mode** 按鈕
2. 輸入你在 Vercel 環境變數設定的 `ADMIN_PASSWORD`
3. 登入後可以：
   - 點 **+** 按鈕上傳新照片（真實檔案上傳到 Vercel Blob）
   - 點照片上的 🗑️ 刪除照片
   - 開啟 Lightbox → Flip → 在背面編輯 caption、tags、貼紙顏色

---

## 🗂️ 專案結構

```
photo-wall/
├── app/
│   ├── actions.ts          # 所有 Server Actions（上傳、刪除、登入等）
│   ├── globals.css         # Tailwind + 自訂 CSS（polaroid、pushpin 等）
│   ├── layout.tsx
│   └── page.tsx            # Server Component（資料從 DB 注入）
├── components/
│   ├── PhotoWall.tsx       # 主容器（Client Component）
│   ├── PhotoCard.tsx       # 單張拍立得卡片
│   ├── Lightbox.tsx        # 3D Flip Lightbox + 編輯介面
│   ├── FilterBar.tsx       # Tag 篩選列
│   ├── AdminButton.tsx     # 登入 / 登出按鈕
│   └── UploadModal.tsx     # 上傳 Modal（含 File Input + 預覽）
├── lib/
│   ├── auth.ts             # Cookie-based 認證工具
│   ├── db.ts               # Vercel Postgres 查詢函數
│   └── types.ts            # TypeScript 型別定義
├── scripts/
│   └── migrate.ts          # 資料庫初始化腳本
├── .env.example            # 環境變數範本
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

---

## 🌐 環境變數總覽

| 變數名 | 來源 | 說明 |
|--------|------|------|
| `POSTGRES_URL` | Vercel Postgres | 自動填入 |
| `POSTGRES_PRISMA_URL` | Vercel Postgres | 自動填入 |
| `POSTGRES_URL_NON_POOLING` | Vercel Postgres | 自動填入 |
| `POSTGRES_USER` | Vercel Postgres | 自動填入 |
| `POSTGRES_HOST` | Vercel Postgres | 自動填入 |
| `POSTGRES_PASSWORD` | Vercel Postgres | 自動填入 |
| `POSTGRES_DATABASE` | Vercel Postgres | 自動填入 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob | 自動填入 |
| `ADMIN_PASSWORD` | 自己設定 | 管理員登入密碼 |
| `ADMIN_SESSION_TOKEN` | 自己設定 | Session 驗證用隨機字串 |
