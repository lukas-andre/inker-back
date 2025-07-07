CREATE UNIQUE INDEX "IDX_f96f80047970cd4d6cb8e9ddb0" ON public.artist_metrics CREATE UNIQUE INDEX "IDX_f96f80047970cd4d6cb8e9ddb0" ON artist_metrics USING btree (artist_id);
CREATE UNIQUE INDEX "IDX_1d457c048def92e36e7368b10f" ON public.artist_metrics_viewers CREATE UNIQUE INDEX "IDX_1d457c048def92e36e7368b10f" ON artist_metrics_viewers USING btree (metrics_id, viewer_key);
CREATE UNIQUE INDEX "IDX_45549bf4dbca82611ce8c94804" ON public.content_metrics CREATE UNIQUE INDEX "IDX_45549bf4dbca82611ce8c94804" ON content_metrics USING btree (content_id, content_type);
CREATE UNIQUE INDEX "IDX_6acfaaaf9428a46acea202825b" ON public.content_metrics_viewers CREATE UNIQUE INDEX "IDX_6acfaaaf9428a46acea202825b" ON content_metrics_viewers USING btree (metrics_id, viewer_key);
