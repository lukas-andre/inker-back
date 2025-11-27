ALTER TABLE public.spatial_ref_sys ADD CONSTRAINT spatial_ref_sys_srid_check CHECK (((srid > 0) AND (srid <= 998999)));
