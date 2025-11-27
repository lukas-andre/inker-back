CREATE INDEX idx_tattoo_design_search_vector ON public.tattoo_design_cache CREATE INDEX idx_tattoo_design_search_vector ON tattoo_design_cache USING gin (search_vector);
CREATE INDEX idx_tattoo_design_favorite ON public.tattoo_design_cache CREATE INDEX idx_tattoo_design_favorite ON tattoo_design_cache USING btree (is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_tattoo_design_usage_count ON public.tattoo_design_cache CREATE INDEX idx_tattoo_design_usage_count ON tattoo_design_cache USING btree (usage_count DESC);
CREATE INDEX idx_tattoo_design_created_at ON public.tattoo_design_cache CREATE INDEX idx_tattoo_design_created_at ON tattoo_design_cache USING btree (created_at);
CREATE INDEX idx_tattoo_design_style ON public.tattoo_design_cache CREATE INDEX idx_tattoo_design_style ON tattoo_design_cache USING btree (style);
CREATE INDEX idx_tattoo_design_user_query ON public.tattoo_design_cache CREATE INDEX idx_tattoo_design_user_query ON tattoo_design_cache USING gin (user_query gin_trgm_ops);
