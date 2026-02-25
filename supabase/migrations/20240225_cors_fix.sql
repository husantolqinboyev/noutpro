-- Supabase Security Policies Configuration
-- Run this in Supabase SQL Editor

-- Note: Supabase handles CORS automatically for most cases
-- If you need custom CORS, it should be configured in Supabase Dashboard

-- Enable RLS on all tables (if not already enabled)
-- Ignore errors if already enabled
DO $$
BEGIN
    BEGIN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'profiles RLS already enabled or error: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'products RLS already enabled or error: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'orders RLS already enabled or error: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'comments RLS already enabled or error: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'ai_usage RLS already enabled or error: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE user_states ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'user_states RLS already enabled or error: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'social_media_links RLS already enabled or error: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'user_locations RLS already enabled or error: %', SQLERRM;
    END;
END $$;

-- Drop existing policies if they exist, then recreate them
-- This ensures policies are up to date

DROP POLICY IF EXISTS "Public access to active social media links" ON social_media_links;
CREATE POLICY "Public access to active social media links" ON social_media_links
  FOR SELECT USING (is_active = true);

-- Profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI Usage policies
DROP POLICY IF EXISTS "Users can view their own AI usage" ON ai_usage;
CREATE POLICY "Users can view their own AI usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own AI usage" ON ai_usage;
CREATE POLICY "Users can insert their own AI usage" ON ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own AI usage" ON ai_usage;
CREATE POLICY "Users can update their own AI usage" ON ai_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- User States policies
DROP POLICY IF EXISTS "Users can view their own states" ON user_states;
CREATE POLICY "Users can view their own states" ON user_states
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own states" ON user_states;
CREATE POLICY "Users can insert their own states" ON user_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Locations policies
DROP POLICY IF EXISTS "Users can view their own locations" ON user_locations;
CREATE POLICY "Users can view their own locations" ON user_locations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own locations" ON user_locations;
CREATE POLICY "Users can insert their own locations" ON user_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own locations" ON user_locations;
CREATE POLICY "Users can update their own locations" ON user_locations
  FOR UPDATE USING (auth.uid() = user_id);

-- Social Media Links policies (admin management)
DROP POLICY IF EXISTS "Anyone can view active social media links" ON social_media_links;
CREATE POLICY "Anyone can view active social media links" ON social_media_links
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can manage social media links" ON social_media_links;
CREATE POLICY "Anyone can manage social media links" ON social_media_links
  FOR ALL USING (true);

-- Products policies (public read, authenticated write)
DROP POLICY IF EXISTS "Products are publicly viewable" ON products;
CREATE POLICY "Products are publicly viewable" ON products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comments policies
DROP POLICY IF EXISTS "Users can view all comments" ON comments;
CREATE POLICY "Users can view all comments" ON comments
  FOR SELECT USING (is_moderated = true);

DROP POLICY IF EXISTS "Users can insert own comments" ON comments;
CREATE POLICY "Users can insert own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);
