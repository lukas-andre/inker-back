CREATE TRIGGER tattoo_design_timestamp_update BEFORE UPDATE ON public.tattoo_design_cache FOR EACH ROW EXECUTE FUNCTION public.tattoo_design_update_timestamp();
CREATE TRIGGER tattoo_design_vector_update BEFORE INSERT OR UPDATE ON public.tattoo_design_cache FOR EACH ROW EXECUTE FUNCTION public.tattoo_design_update_search_vector();
