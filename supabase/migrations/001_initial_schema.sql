-- Groww Support PM Pulsator — Initial Database Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- APPS
-- ============================================
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  android_bundle_id VARCHAR(255),
  ios_bundle_id VARCHAR(255),
  last_android_sync TIMESTAMPTZ,
  last_ios_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  platform_review_id VARCHAR(255) NOT NULL,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('android', 'ios')),
  author_name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
  star_rating INTEGER NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  sanitized_text TEXT NOT NULL,
  sentiment VARCHAR(20) NOT NULL DEFAULT 'uncategorized' CHECK (sentiment IN ('positive', 'negative', 'neutral', 'uncategorized')),
  device_info VARCHAR(255),
  app_version VARCHAR(50),
  os_version VARCHAR(50),
  upvote_count INTEGER,
  review_date DATE NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform_review_id, platform)
);

CREATE INDEX idx_reviews_app_platform_date ON reviews(app_id, platform, review_date);
CREATE INDEX idx_reviews_duplicate_check ON reviews(platform_review_id, platform);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX idx_reviews_star_rating ON reviews(star_rating);
CREATE INDEX idx_reviews_review_date ON reviews(review_date);

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

-- Seed default categories
INSERT INTO categories (name, slug) VALUES
  ('Login Issues', 'login-issues'),
  ('KYC', 'kyc'),
  ('Payments', 'payments'),
  ('App Crash', 'app-crash'),
  ('UI/UX', 'ui-ux'),
  ('Performance', 'performance'),
  ('Customer Support', 'customer-support'),
  ('Transaction Issues', 'transaction-issues'),
  ('Account Issues', 'account-issues'),
  ('Feature Request', 'feature-request'),
  ('Security', 'security'),
  ('Onboarding', 'onboarding'),
  ('Notifications', 'notifications'),
  ('Others', 'others');

-- ============================================
-- REVIEW ↔ CATEGORY (junction)
-- ============================================
CREATE TABLE review_categories (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (review_id, category_id)
);

CREATE INDEX idx_review_categories_review ON review_categories(review_id);
CREATE INDEX idx_review_categories_category ON review_categories(category_id);

-- ============================================
-- AI REPLIES
-- ============================================
CREATE TABLE ai_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  tone VARCHAR(20) NOT NULL CHECK (tone IN ('empathetic', 'professional', 'gratitude')),
  reply_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- WEEKLY PULSES
-- ============================================
CREATE TABLE weekly_pulses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  pulse_content TEXT NOT NULL,
  themes JSONB NOT NULL DEFAULT '[]',
  quotes JSONB NOT NULL DEFAULT '[]',
  action_ideas JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- ============================================
-- FEE EXPLAINERS
-- ============================================
CREATE TABLE fee_explainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario VARCHAR(255) NOT NULL,
  bullets JSONB NOT NULL DEFAULT '[]',
  source_links JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected')),
  last_checked DATE NOT NULL DEFAULT CURRENT_DATE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SYNC LOGS
-- ============================================
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('android', 'ios')),
  status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
  reviews_fetched INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sync_logs_app_started ON sync_logs(app_id, started_at DESC);
