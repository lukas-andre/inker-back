-- Artist Profile System Database Schema

-- Create Works table to store artist portfolio items
CREATE TABLE IF NOT EXISTS works (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    image_version INTEGER DEFAULT 0,
    thumbnail_url VARCHAR(255),
    thumbnail_version INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    order_position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_works_artist FOREIGN KEY (artist_id) REFERENCES artist(id) ON DELETE CASCADE
);

-- Create indexes for performance optimization
CREATE INDEX idx_works_artist_id ON works(artist_id);
CREATE INDEX idx_works_is_featured ON works(is_featured);
CREATE INDEX idx_works_deleted_at ON works(deleted_at);

-- Create Stencils table to store artist stencil designs
CREATE TABLE IF NOT EXISTS stencils (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    image_version INTEGER DEFAULT 0,
    thumbnail_url VARCHAR(255),
    thumbnail_version INTEGER DEFAULT 0,
    price DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_stencils_artist FOREIGN KEY (artist_id) REFERENCES artist(id) ON DELETE CASCADE
);

-- Create indexes for stencils
CREATE INDEX idx_stencils_artist_id ON stencils(artist_id);
CREATE INDEX idx_stencils_is_available ON stencils(is_available);
CREATE INDEX idx_stencils_deleted_at ON stencils(deleted_at);

-- Create Work_Tags junction table for many-to-many relationship between works and tags
CREATE TABLE IF NOT EXISTS work_tags (
    work_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (work_id, tag_id),
    CONSTRAINT fk_work_tags_work FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
    CONSTRAINT fk_work_tags_tag FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);

-- Create Stencil_Tags junction table for many-to-many relationship between stencils and tags
CREATE TABLE IF NOT EXISTS stencil_tags (
    stencil_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (stencil_id, tag_id),
    CONSTRAINT fk_stencil_tags_stencil FOREIGN KEY (stencil_id) REFERENCES stencils(id) ON DELETE CASCADE,
    CONSTRAINT fk_stencil_tags_tag FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);

-- Create Artist_Tags junction table for many-to-many relationship between artists and tags
CREATE TABLE IF NOT EXISTS artist_tags (
    artist_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (artist_id, tag_id),
    CONSTRAINT fk_artist_tags_artist FOREIGN KEY (artist_id) REFERENCES artist(id) ON DELETE CASCADE,
    CONSTRAINT fk_artist_tags_tag FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);

-- Create Interactions table to track user interactions with artist profiles
CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'save', 'share'
    entity_type VARCHAR(50) NOT NULL, -- 'artist', 'work', 'stencil'
    entity_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for interactions
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_entity_type_entity_id ON interactions(entity_type, entity_id);
CREATE INDEX idx_interactions_interaction_type ON interactions(interaction_type);

-- Create Artist Styles junction table for artist specialties and styles
CREATE TABLE IF NOT EXISTS artist_styles (
    artist_id INTEGER NOT NULL,
    style_name VARCHAR(100) NOT NULL,
    proficiency_level INTEGER DEFAULT 3, -- 1-5 scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (artist_id, style_name),
    CONSTRAINT fk_artist_styles_artist FOREIGN KEY (artist_id) REFERENCES artist(id) ON DELETE CASCADE
);

-- Create View for Artist Content Feed
CREATE OR REPLACE VIEW artist_content_feed AS
SELECT 
    'work' AS content_type,
    w.id AS content_id,
    a.id AS artist_id,
    a.username AS artist_username,
    a.first_name || ' ' || a.last_name AS artist_name,
    a.profile_thumbnail AS artist_image,
    w.title AS content_title,
    w.description AS content_description,
    w.image_url AS content_image,
    w.created_at AS content_created_at,
    array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags,
    COUNT(DISTINCT i.id) FILTER (WHERE i.interaction_type = 'like') AS likes_count,
    COUNT(DISTINCT i.id) FILTER (WHERE i.interaction_type = 'view') AS views_count
FROM 
    works w
JOIN 
    artist a ON w.artist_id = a.id
LEFT JOIN 
    work_tags wt ON w.id = wt.work_id
LEFT JOIN 
    tag t ON wt.tag_id = t.id
LEFT JOIN 
    interactions i ON i.entity_type = 'work' AND i.entity_id = w.id
WHERE 
    w.deleted_at IS NULL
GROUP BY 
    w.id, a.id, a.username, a.first_name, a.last_name, a.profile_thumbnail
    
UNION ALL

SELECT 
    'stencil' AS content_type,
    s.id AS content_id,
    a.id AS artist_id,
    a.username AS artist_username,
    a.first_name || ' ' || a.last_name AS artist_name,
    a.profile_thumbnail AS artist_image,
    s.title AS content_title,
    s.description AS content_description,
    s.image_url AS content_image,
    s.created_at AS content_created_at,
    array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags,
    COUNT(DISTINCT i.id) FILTER (WHERE i.interaction_type = 'like') AS likes_count,
    COUNT(DISTINCT i.id) FILTER (WHERE i.interaction_type = 'view') AS views_count
FROM 
    stencils s
JOIN 
    artist a ON s.artist_id = a.id
LEFT JOIN 
    stencil_tags st ON s.id = st.stencil_id
LEFT JOIN 
    tag t ON st.tag_id = t.id
LEFT JOIN 
    interactions i ON i.entity_type = 'stencil' AND i.entity_id = s.id
WHERE 
    s.deleted_at IS NULL AND s.is_available = TRUE
GROUP BY 
    s.id, a.id, a.username, a.first_name, a.last_name, a.profile_thumbnail
ORDER BY 
    content_created_at DESC;

-- Create view for trending artists based on interactions
CREATE OR REPLACE VIEW trending_artists AS
SELECT 
    a.id AS artist_id,
    a.username,
    a.first_name || ' ' || a.last_name AS artist_name,
    a.profile_thumbnail,
    a.rating,
    COUNT(DISTINCT w.id) AS works_count,
    COUNT(DISTINCT s.id) AS stencils_count,
    COUNT(DISTINCT i.id) AS total_interactions,
    COUNT(DISTINCT i.id) FILTER (WHERE i.interaction_type = 'view' AND i.created_at > NOW() - INTERVAL '30 days') AS recent_views,
    COUNT(DISTINCT i.id) FILTER (WHERE i.interaction_type = 'like' AND i.created_at > NOW() - INTERVAL '30 days') AS recent_likes,
    array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS artist_tags
FROM 
    artist a
LEFT JOIN 
    works w ON a.id = w.artist_id AND w.deleted_at IS NULL
LEFT JOIN 
    stencils s ON a.id = s.artist_id AND s.deleted_at IS NULL
LEFT JOIN 
    interactions i ON (i.entity_type = 'artist' AND i.entity_id = a.id) OR
                       (i.entity_type = 'work' AND i.entity_id = w.id) OR
                       (i.entity_type = 'stencil' AND i.entity_id = s.id)
LEFT JOIN 
    artist_tags at ON a.id = at.artist_id
LEFT JOIN 
    tag t ON at.tag_id = t.id
WHERE 
    a.deleted_at IS NULL
GROUP BY 
    a.id, a.username, a.first_name, a.last_name, a.profile_thumbnail, a.rating
ORDER BY 
    recent_likes DESC, recent_views DESC;