CREATE INDEX "IDX_a2fbc58df09b3f7d313b44efee" ON public.verification_hash CREATE INDEX "IDX_a2fbc58df09b3f7d313b44efee" ON verification_hash USING btree (phone);
CREATE INDEX "IDX_e85ede11c4408672807ea531c5" ON public.verification_hash CREATE INDEX "IDX_e85ede11c4408672807ea531c5" ON verification_hash USING btree (email);
CREATE INDEX "IDX_6142d018460a0f1d602dcac6cb" ON public.verification_hash CREATE INDEX "IDX_6142d018460a0f1d602dcac6cb" ON verification_hash USING btree (user_id);
CREATE INDEX "IDX_ae4578dcaed5adff96595e6166" ON public.role CREATE INDEX "IDX_ae4578dcaed5adff96595e6166" ON role USING btree (name);
CREATE INDEX "IDX_60e71e288bab95a5ac05f58a84" ON public."user" CREATE INDEX "IDX_60e71e288bab95a5ac05f58a84" ON "user" USING btree (user_type);
CREATE UNIQUE INDEX "REL_a2883eaa72b3b2e8c98e744609" ON public.settings CREATE UNIQUE INDEX "REL_a2883eaa72b3b2e8c98e744609" ON settings USING btree (user_id);
CREATE INDEX "IDX_72e80be86cab0e93e67ed1a7a9" ON public.role_permission CREATE INDEX "IDX_72e80be86cab0e93e67ed1a7a9" ON role_permission USING btree ("permissionId");
CREATE INDEX "IDX_e3130a39c1e4a740d044e68573" ON public.role_permission CREATE INDEX "IDX_e3130a39c1e4a740d044e68573" ON role_permission USING btree ("roleId");
CREATE UNIQUE INDEX "UQ_9573e71191df070245e24255230" ON public.permission CREATE UNIQUE INDEX "UQ_9573e71191df070245e24255230" ON permission USING btree (controller);
