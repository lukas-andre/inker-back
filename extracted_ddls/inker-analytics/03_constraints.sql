ALTER TABLE public.artist_metrics_viewers ADD CONSTRAINT "FK_b7b49edbf1b02ccbee4d82868df" FOREIGN KEY (metrics_id) REFERENCES artist_metrics(id) ON DELETE CASCADE;
ALTER TABLE public.content_metrics_viewers ADD CONSTRAINT "FK_0e40fda1c79da2bb9edd3e818b5" FOREIGN KEY (metrics_id) REFERENCES content_metrics(id) ON DELETE CASCADE;
