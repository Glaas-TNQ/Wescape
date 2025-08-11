-- Create user_profiles table for user settings and profile information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    travel_style TEXT[],
    preferences JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles (username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON public.user_profiles (subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON public.user_profiles (updated_at);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = id);

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()       
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$                                     
BEGIN                                                     
    -- Inserimento diretto bypassando RLS usando SECURITY DEFINER
    INSERT INTO public.user_profiles (                    
        id,                                               
        full_name,                                        
        onboarding_completed,                             
        subscription_tier                                 
    )                                                    
    VALUES (                                              
        NEW.id,                                           
        NEW.raw_user_meta_data->>'full_name',             
        false,                                            
        'free'                                            
    );                                                    
    RETURN NEW;                                           
END;                                                      
$$;

-- Create a trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create storage bucket for user avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for avatar storage
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Create storage bucket for canvas images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('canvas-images', 'canvas-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for canvas images storage
CREATE POLICY "Canvas images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'canvas-images');

CREATE POLICY "Users can upload canvas images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'canvas-images' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their canvas images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'canvas-images' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their canvas images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'canvas-images' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );