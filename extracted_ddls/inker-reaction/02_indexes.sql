CREATE INDEX "IDX_7c457b73b6917a019a31b9a8c8" ON public.reaction CREATE INDEX "IDX_7c457b73b6917a019a31b9a8c8" ON reaction USING btree (user_type_id);
CREATE INDEX "IDX_978c984f412d09b43304e41ae9" ON public.reaction CREATE INDEX "IDX_978c984f412d09b43304e41ae9" ON reaction USING btree (user_id);
CREATE INDEX "IDX_2230e00a30a1c3423ed26b5d08" ON public.reaction CREATE INDEX "IDX_2230e00a30a1c3423ed26b5d08" ON reaction USING btree (active);
CREATE INDEX "IDX_f4d42df90549af0a27dcefb3a1" ON public.reaction CREATE INDEX "IDX_f4d42df90549af0a27dcefb3a1" ON reaction USING btree (reaction_type);
CREATE INDEX "IDX_ace7dee1643c316f016d8b8204" ON public.reaction CREATE INDEX "IDX_ace7dee1643c316f016d8b8204" ON reaction USING btree (activity_type);
CREATE INDEX "IDX_0e33ea8cf21e7355c152b18f2b" ON public.reaction CREATE INDEX "IDX_0e33ea8cf21e7355c152b18f2b" ON reaction USING btree (activity_id);
CREATE INDEX "IDX_678281c99a36ba76bbcd4baa82" ON public.activity CREATE INDEX "IDX_678281c99a36ba76bbcd4baa82" ON activity USING btree (activity_type);
