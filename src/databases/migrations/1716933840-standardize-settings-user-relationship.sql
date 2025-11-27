-- Update settings records to populate the user_id field with users' ids
UPDATE public.settings s
SET user_id = u.id
FROM public."user" u
WHERE s."userId" = u.id::varchar
AND s.user_id IS NULL;

-- Drop the old userId column
ALTER TABLE public.settings DROP COLUMN "userId";

-- Make user_id NOT NULL
ALTER TABLE public.settings ALTER COLUMN user_id SET NOT NULL; 