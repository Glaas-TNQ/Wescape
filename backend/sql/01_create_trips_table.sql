CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    destination TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public')),
    cover_image TEXT,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policy
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own trips" ON trips
  FOR ALL USING (auth.uid() = user_id);