CREATE INDEX "IDX_8112176e132dfb72c2327a6722" ON public.review CREATE INDEX "IDX_8112176e132dfb72c2327a6722" ON review USING btree (artist_id, event_id);
CREATE INDEX "IDX_005b84b7e7dd19d28f1c36eb7c" ON public.review CREATE INDEX "IDX_005b84b7e7dd19d28f1c36eb7c" ON review USING btree (event_id);
CREATE INDEX "IDX_66bf56ba69663e8d8aeac98c6a" ON public.review CREATE INDEX "IDX_66bf56ba69663e8d8aeac98c6a" ON review USING btree (artist_id);
CREATE INDEX "IDX_c9b1734cc444c093517d27ae6b" ON public.review_avg CREATE INDEX "IDX_c9b1734cc444c093517d27ae6b" ON review_avg USING btree (artist_id);
CREATE INDEX "IDX_a563b6be744b9227034603ea8e" ON public.review_reaction CREATE INDEX "IDX_a563b6be744b9227034603ea8e" ON review_reaction USING btree (review_id);
CREATE INDEX "IDX_e054028c75449a8ecae0fcf21b" ON public.review_reaction CREATE INDEX "IDX_e054028c75449a8ecae0fcf21b" ON review_reaction USING btree (customer_id);
