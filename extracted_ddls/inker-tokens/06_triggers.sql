CREATE TRIGGER update_token_balance_updated_at BEFORE UPDATE ON public.token_balance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_token_transaction_updated_at BEFORE UPDATE ON public.token_transaction FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
