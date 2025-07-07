CREATE TRIGGER set_timestamp_form_templates BEFORE UPDATE ON public.form_templates FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
