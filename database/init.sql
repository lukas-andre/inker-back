SELECT 'CREATE DATABASE inker-customer'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-customer');

SELECT 'CREATE DATABASE inker-artist'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-artist');

SELECT 'CREATE DATABASE inker-user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-user');

SELECT 'CREATE DATABASE inker-genre'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-genre');

SELECT 'CREATE DATABASE inker-post'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-post');

SELECT 'CREATE DATABASE inker-reaction'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-reaction');

SELECT 'CREATE DATABASE inker-follow'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-follow');

SELECT 'CREATE DATABASE inker-tag'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-tag');

SELECT 'CREATE DATABASE inker-artist'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-artist');

SELECT 'CREATE DATABASE inker-review'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inker-review');
