DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-customer') THEN
      CREATE DATABASE "inker-customer";
   END IF;

   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-artist') THEN
      CREATE DATABASE "inker-artist";
   END IF;

   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-user') THEN
      CREATE DATABASE "inker-user";
   END IF;

   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-genre') THEN
      CREATE DATABASE "inker-genre";
   END IF;

   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-post') THEN
      CREATE DATABASE "inker-post";
   END IF;

   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-reaction') THEN
      CREATE DATABASE "inker-reaction";
   END IF;

   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-follow') THEN
      CREATE DATABASE "inker-follow";
   END IF;

   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-tag') THEN
      CREATE DATABASE "inker-tag";
   END IF;

   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-review') THEN
      CREATE DATABASE "inker-review";
   END IF;
END
$$;