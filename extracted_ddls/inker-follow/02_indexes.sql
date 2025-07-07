CREATE INDEX "IDX_ea71d55e5f089a426913df2bd8" ON public.followed CREATE INDEX "IDX_ea71d55e5f089a426913df2bd8" ON followed USING btree (user_type_id);
CREATE INDEX "IDX_3ab90b492b1f2c3d8b8f61adbd" ON public.followed CREATE INDEX "IDX_3ab90b492b1f2c3d8b8f61adbd" ON followed USING btree (user_id);
CREATE INDEX "IDX_0cd95f68af8a5715869acb53ff" ON public.followed CREATE INDEX "IDX_0cd95f68af8a5715869acb53ff" ON followed USING btree (user_followed_id);
CREATE INDEX "IDX_d2374b9535a0e063e8e442dec2" ON public.following CREATE INDEX "IDX_d2374b9535a0e063e8e442dec2" ON following USING btree (user_type_id);
CREATE INDEX "IDX_4a5bd9db5bd73571f8c4571771" ON public.following CREATE INDEX "IDX_4a5bd9db5bd73571f8c4571771" ON following USING btree (user_id);
CREATE INDEX "IDX_70994ee485be5c9afd8fa864bb" ON public.following CREATE INDEX "IDX_70994ee485be5c9afd8fa864bb" ON following USING btree (user_following_id);
