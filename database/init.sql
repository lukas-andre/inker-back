SELECT 'CREATE DATABASE inker-customer'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-customer')\gexec

SELECT 'CREATE DATABASE inker-artist'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-artist')\gexec

SELECT 'CREATE DATABASE inker-user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-user')\gexec

SELECT 'CREATE DATABASE inker-genre'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-genre')\gexec

SELECT 'CREATE DATABASE inker-post'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-post')\gexec

SELECT 'CREATE DATABASE inker-reaction'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-reaction')\gexec

SELECT 'CREATE DATABASE inker-follow'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-follow')\gexec

SELECT 'CREATE DATABASE inker-tag'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-tag')\gexec

SELECT 'CREATE DATABASE inker-artist'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-artist')\gexec