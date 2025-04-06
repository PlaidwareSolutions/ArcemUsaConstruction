-- Generated DDL for database - 2025-04-06T08:41:52.171Z

-- Drop tables if they exist (reverse order to handle dependencies)
DROP TABLE IF EXISTS "quote_request_attachments" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "quote_requests" CASCADE;
DROP TABLE IF EXISTS "team_members" CASCADE;
DROP TABLE IF EXISTS "job_postings" CASCADE;
DROP TABLE IF EXISTS "vendors" CASCADE;
DROP TABLE IF EXISTS "blog_gallery" CASCADE;
DROP TABLE IF EXISTS "service_gallery" CASCADE;
DROP TABLE IF EXISTS "newsletter_subscribers" CASCADE;
DROP TABLE IF EXISTS "testimonials" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "subcontractors" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "blog_tags" CASCADE;
DROP TABLE IF EXISTS "blog_post_tags" CASCADE;
DROP TABLE IF EXISTS "blog_categories" CASCADE;
DROP TABLE IF EXISTS "blog_post_categories" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "project_gallery" CASCADE;
DROP TABLE IF EXISTS "blog_posts" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;

-- Create tables

CREATE TABLE "users" (
  "id" integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "username" text NOT NULL,
  "password" text NOT NULL,
  "role" text DEFAULT 'user'::text,
  "email" text,
  PRIMARY KEY ("id"),
  CONSTRAINT "users_username_unique" UNIQUE ("username")
);

-- Set sequence value for users
SELECT pg_catalog.setval('public.users_id_seq', 1, true);

CREATE TABLE "blog_categories" (
  "id" integer NOT NULL DEFAULT nextval('blog_categories_id_seq'::regclass),
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

-- Set sequence value for blog_categories
SELECT pg_catalog.setval('public.blog_categories_id_seq', 5, true);

CREATE TABLE "blog_tags" (
  "id" integer NOT NULL DEFAULT nextval('blog_tags_id_seq'::regclass),
  "name" text NOT NULL,
  "slug" text NOT NULL,
  PRIMARY KEY ("id")
);

-- Set sequence value for blog_tags
SELECT pg_catalog.setval('public.blog_tags_id_seq', 10, true);

CREATE TABLE "team_members" (
  "id" integer NOT NULL DEFAULT nextval('team_members_id_seq'::regclass),
  "name" text NOT NULL,
  "designation" text NOT NULL,
  "qualification" text NOT NULL,
  "gender" text NOT NULL,
  "photo" text,
  "bio" text,
  "order" integer DEFAULT 0,
  "active" boolean DEFAULT true,
  "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Set sequence value for team_members
SELECT pg_catalog.setval('public.team_members_id_seq', 11, true);

CREATE TABLE "services" (
  "id" integer NOT NULL DEFAULT nextval('services_id_seq'::regclass),
  "title" text NOT NULL,
  "description" text NOT NULL,
  "icon" text NOT NULL,
  "features" ARRAY,
  PRIMARY KEY ("id")
);

-- Set sequence value for services
SELECT pg_catalog.setval('public.services_id_seq', 25, true);

CREATE TABLE "projects" (
  "id" integer NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
  "title" text NOT NULL,
  "category" text NOT NULL,
  "description" text NOT NULL,
  "image" text NOT NULL,
  "featured" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT now(),
  "overview" text,
  "challenges" text,
  "solutions" text,
  "results" text,
  "client" text,
  "location" text,
  "size" text,
  "completion_date" text,
  "services_provided" text,
  PRIMARY KEY ("id")
);

-- Set sequence value for projects
SELECT pg_catalog.setval('public.projects_id_seq', 47, true);

CREATE TABLE "blog_posts" (
  "id" integer NOT NULL DEFAULT nextval('blog_posts_id_seq'::regclass),
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "content" text NOT NULL,
  "excerpt" text NOT NULL,
  "image" text NOT NULL,
  "category" text NOT NULL,
  "author" text NOT NULL,
  "published" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "blog_posts_slug_unique" UNIQUE ("slug")
);

-- Set sequence value for blog_posts
SELECT pg_catalog.setval('public.blog_posts_id_seq', 6, true);

CREATE TABLE "job_postings" (
  "id" integer NOT NULL DEFAULT nextval('job_postings_id_seq'::regclass),
  "title" text NOT NULL,
  "department" text NOT NULL,
  "location" text NOT NULL,
  "type" text NOT NULL,
  "description" text NOT NULL,
  "responsibilities" text NOT NULL,
  "requirements" text NOT NULL,
  "benefits" text,
  "salary" text,
  "apply_url" text,
  "active" boolean NOT NULL DEFAULT true,
  "featured" boolean NOT NULL DEFAULT false,
  "created_at" timestamp without time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Set sequence value for job_postings
SELECT pg_catalog.setval('public.job_postings_id_seq', 9, true);

CREATE TABLE "testimonials" (
  "id" integer NOT NULL DEFAULT nextval('testimonials_id_seq'::regclass),
  "name" text NOT NULL,
  "position" text NOT NULL,
  "company" text,
  "content" text NOT NULL,
  "rating" integer NOT NULL,
  "image" text,
  "approved" boolean DEFAULT false,
  "email" text,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Set sequence value for testimonials
SELECT pg_catalog.setval('public.testimonials_id_seq', 7, true);

CREATE TABLE "messages" (
  "id" integer NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "service" text,
  "message" text NOT NULL,
  "created_at" timestamp without time zone DEFAULT now(),
  "read" boolean DEFAULT false,
  PRIMARY KEY ("id")
);

-- Set sequence value for messages
SELECT pg_catalog.setval('public.messages_id_seq', 1, true);

CREATE TABLE "newsletter_subscribers" (
  "id" integer NOT NULL DEFAULT nextval('newsletter_subscribers_id_seq'::regclass),
  "email" text NOT NULL,
  "first_name" text,
  "last_name" text,
  "subscribed" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Set sequence value for newsletter_subscribers
SELECT pg_catalog.setval('public.newsletter_subscribers_id_seq', 2, true);

CREATE TABLE "blog_post_categories" (
  "post_id" integer NOT NULL,
  "category_id" integer NOT NULL
);

CREATE TABLE "blog_post_tags" (
  "post_id" integer NOT NULL,
  "tag_id" integer NOT NULL
);

CREATE TABLE "project_gallery" (
  "id" integer NOT NULL DEFAULT nextval('project_gallery_id_seq'::regclass),
  "project_id" integer NOT NULL,
  "image_url" text NOT NULL,
  "caption" text,
  "display_order" integer DEFAULT 0,
  "is_feature" boolean DEFAULT false,
  PRIMARY KEY ("id")
);

-- Set sequence value for project_gallery
SELECT pg_catalog.setval('public.project_gallery_id_seq', 298, true);

CREATE TABLE "blog_gallery" (
  "id" integer NOT NULL DEFAULT nextval('blog_gallery_id_seq'::regclass),
  "post_id" integer NOT NULL,
  "image_url" text NOT NULL,
  "caption" text,
  "order" integer DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Set sequence value for blog_gallery
SELECT pg_catalog.setval('public.blog_gallery_id_seq', 20, true);

CREATE TABLE "service_gallery" (
  "id" integer NOT NULL DEFAULT nextval('service_gallery_id_seq'::regclass),
  "service_id" integer NOT NULL,
  "image_url" text NOT NULL,
  "alt" text,
  "order" integer DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT now(),
  "caption" text,
  PRIMARY KEY ("id")
);

-- Set sequence value for service_gallery
SELECT pg_catalog.setval('public.service_gallery_id_seq', 149, true);

CREATE TABLE "quote_requests" (
  "id" integer NOT NULL DEFAULT nextval('quote_requests_id_seq'::regclass),
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "company" text,
  "project_type" text NOT NULL,
  "project_size" text,
  "budget" text,
  "timeframe" text,
  "description" text NOT NULL,
  "status" text DEFAULT 'pending'::text,
  "reviewed" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Set sequence value for quote_requests
SELECT pg_catalog.setval('public.quote_requests_id_seq', 8, true);

CREATE TABLE "quote_request_attachments" (
  "id" integer NOT NULL DEFAULT nextval('quote_request_attachments_id_seq'::regclass),
  "quote_request_id" integer NOT NULL,
  "file_name" text NOT NULL,
  "file_url" text NOT NULL,
  "file_key" text NOT NULL,
  "file_size" integer NOT NULL,
  "file_type" text NOT NULL,
  "created_at" timestamp without time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Set sequence value for quote_request_attachments
SELECT pg_catalog.setval('public.quote_request_attachments_id_seq', 4, true);

CREATE TABLE "subcontractors" (
  "id" integer NOT NULL DEFAULT nextval('subcontractors_id_seq'::regclass),
  "company_name" text NOT NULL,
  "contact_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "zip" text NOT NULL,
  "website" text,
  "service_types" ARRAY,
  "service_description" text NOT NULL,
  "years_in_business" text NOT NULL,
  "insurance" boolean DEFAULT false,
  "bondable" boolean DEFAULT false,
  "licenses" text,
  "references" text,
  "how_did_you_hear" text,
  "status" text DEFAULT 'pending'::text,
  "notes" text,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Set sequence value for subcontractors
SELECT pg_catalog.setval('public.subcontractors_id_seq', 3, true);

CREATE TABLE "vendors" (
  "id" integer NOT NULL DEFAULT nextval('vendors_id_seq'::regclass),
  "company_name" text NOT NULL,
  "contact_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "zip" text NOT NULL,
  "website" text,
  "supply_types" ARRAY,
  "service_description" text NOT NULL,
  "years_in_business" text NOT NULL,
  "references" text,
  "how_did_you_hear" text,
  "status" text DEFAULT 'pending'::text,
  "notes" text,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Set sequence value for vendors
SELECT pg_catalog.setval('public.vendors_id_seq', 8, true);

CREATE TABLE "session" (
  "sid" character varying NOT NULL,
  "sess" json NOT NULL,
  "expire" timestamp without time zone NOT NULL,
  PRIMARY KEY ("sid")
);

-- Add foreign key constraints
ALTER TABLE "blog_post_categories" ADD CONSTRAINT "blog_post_categories_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id") ON DELETE CASCADE;
ALTER TABLE "blog_post_categories" ADD CONSTRAINT "blog_post_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories" ("id") ON DELETE CASCADE;
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id") ON DELETE CASCADE;
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "blog_tags" ("id") ON DELETE CASCADE;
ALTER TABLE "project_gallery" ADD CONSTRAINT "project_gallery_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE;
ALTER TABLE "blog_gallery" ADD CONSTRAINT "blog_gallery_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id") ON DELETE CASCADE;
ALTER TABLE "service_gallery" ADD CONSTRAINT "service_gallery_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services" ("id") ON DELETE CASCADE;
ALTER TABLE "quote_request_attachments" ADD CONSTRAINT "quote_request_attachments_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests" ("id") ON DELETE CASCADE;

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique ON public.blog_posts USING btree (slug);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON public.users USING btree (username);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON public.session USING btree (expire);
