-- Create chat_conversations table for AI chat functionality
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    ai_response TEXT,
    context JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
    error TEXT,
    nodes_created TEXT[], -- Array of created node IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_trip_id ON chat_conversations(trip_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at DESC);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own chat conversations" ON chat_conversations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own chat conversations" ON chat_conversations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own chat conversations" ON chat_conversations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_conversations_updated_at();

-- Enable real-time for chat conversations
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;