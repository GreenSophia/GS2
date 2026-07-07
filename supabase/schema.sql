-- ============================================================
-- Green Sophia SNS Copilot : スキーマ定義
-- Supabase SQL Editor に貼り付けて一度だけ実行してください
-- ============================================================

-- ① ストック（LINEから届く参考デザイン / スポンサー候補 / 未分類メモ）
create table if not exists public.stocks (
  id          uuid primary key default gen_random_uuid(),
  type        text not null default 'inbox'
              check (type in ('design', 'sponsor', 'inbox')),
  url         text,                    -- 参考投稿URL / 記事URL
  image_path  text,                    -- Storage上の画像パス（スクショ）
  note        text,                    -- メモ本文
  sent_by     text,                    -- LINEの表示名
  created_at  timestamptz not null default now()
);

-- ② Canvaテンプレートのポータル
create table if not exists public.canva_templates (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,           -- 例:「ビーチクリーン告知用」
  url         text not null,           -- CanvaテンプレートURL
  category    text not null default 'その他'
              check (category in ('イベント告知', '活動報告', '啓発コラム', 'コラボ', 'その他')),
  memo        text,
  created_at  timestamptz not null default now()
);

-- ③ 月次実績（メディアキット用）
create table if not exists public.monthly_metrics (
  id             uuid primary key default gen_random_uuid(),
  month          date not null unique,   -- その月の1日を入れる (2026-07-01 等)
  followers      integer,                -- 月末フォロワー数
  reach          integer,                -- 月間リーチ
  profile_views  integer,                -- プロフィール閲覧数
  posts_count    integer,                -- 投稿数
  best_post      text,                   -- 最も伸びた投稿のメモ
  note           text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- RLS: クライアントからの直接アクセスを全て遮断
-- （アプリはサーバー側で service_role キーのみ使用するため）
-- ============================================================
alter table public.stocks           enable row level security;
alter table public.canva_templates  enable row level security;
alter table public.monthly_metrics  enable row level security;
-- ポリシーを作らない = anon / authenticated からは一切読み書き不可

-- ============================================================
-- Storage: LINEから届くスクショ保存用バケット
-- ============================================================
insert into storage.buckets (id, name, public)
values ('stocks', 'stocks', true)
on conflict (id) do nothing;

-- 公開バケットなので閲覧はURLで可能。書き込みはservice_roleのみ（既定）。
