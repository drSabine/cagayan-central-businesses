-- Runs once, the first time the database volume is created.
-- The image has already enabled PostGIS in the main database by this point.
-- This adds a second database so tests never touch your development data.

CREATE DATABASE cagayan_business_test;

\connect cagayan_business_test

CREATE EXTENSION IF NOT EXISTS postgis;
