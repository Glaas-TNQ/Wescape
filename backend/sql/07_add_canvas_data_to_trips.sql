-- Add canvas_data column to trips table to store canvas state
ALTER TABLE trips ADD COLUMN canvas_data JSONB DEFAULT NULL;

-- Add index for better performance on canvas_data queries
CREATE INDEX idx_trips_canvas_data ON trips USING GIN (canvas_data);

-- Add comment for documentation
COMMENT ON COLUMN trips.canvas_data IS 'Stores the canvas state (nodes, edges, and metadata) for the trip planning interface';