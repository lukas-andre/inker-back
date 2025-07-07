CREATE UNIQUE INDEX "IDX_e66818fd4f5952a132c6bd0e68" ON public.user_fcm_tokens CREATE UNIQUE INDEX "IDX_e66818fd4f5952a132c6bd0e68" ON user_fcm_tokens USING btree (user_id, token);
