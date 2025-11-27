CREATE TYPE public.quotation_appealed_reason AS ENUM ('date_change', 'price_change', 'design_change', 'other');
CREATE TYPE public.quotation_artist_reject_reason AS ENUM ('scheduling_conflict', 'artistic_disagreement', 'insufficient_details', 'beyond_expertise', 'other');
CREATE TYPE public.quotation_canceled_by AS ENUM ('customer', 'system');
CREATE TYPE public.quotation_customer_cancel_reason AS ENUM ('change_of_mind', 'found_another_artist', 'financial_reasons', 'personal_reasons', 'other');
CREATE TYPE public.quotation_customer_reject_reason AS ENUM ('too_expensive', 'not_what_i_wanted', 'changed_my_mind', 'found_another_artist', 'other');
CREATE TYPE public.quotation_reject_by AS ENUM ('customer', 'artist', 'system');
CREATE TYPE public.quotation_status AS ENUM ('pending', 'quoted', 'accepted', 'rejected', 'appealed', 'canceled');
CREATE TYPE public.quotation_system_cancel_reason AS ENUM ('not_attended', 'system_timeout');
CREATE TYPE public.quotation_user_type AS ENUM ('customer', 'artist', 'admin', 'system');
