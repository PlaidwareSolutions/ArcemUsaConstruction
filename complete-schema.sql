-- Complete database schema generated on 2025-04-06T23:54:13.055Z

-- Tables
CREATE TABLE public.blog_categories (
  id integer NOT NULL DEFAULT nextval('blog_categories_id_seq'::regclass),
  description text,
  slug text NOT NULL,
  name text NOT NULL,
  CONSTRAINT blog_categories_pkey PRIMARY KEY (id, id, id, id)
);

CREATE TABLE public.blog_gallery (
  caption text,
  post_id integer NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  image_url text NOT NULL,
  id integer NOT NULL DEFAULT nextval('blog_gallery_id_seq'::regclass),
  CONSTRAINT blog_gallery_pkey PRIMARY KEY (id, id, id, id, id, id)
);

CREATE TABLE public.blog_post_categories (
  category_id integer NOT NULL,
  post_id integer NOT NULL
);

CREATE TABLE public.blog_post_tags (
  post_id integer NOT NULL,
  tag_id integer NOT NULL
);

CREATE TABLE public.blog_posts (
  id integer NOT NULL DEFAULT nextval('blog_posts_id_seq'::regclass),
  slug text NOT NULL,
  published boolean DEFAULT true,
  excerpt text NOT NULL,
  category text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  title text NOT NULL,
  author text NOT NULL,
  content text NOT NULL,
  image text NOT NULL,
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id, id, id, id, id, id, id, id, id, id)
);

CREATE TABLE public.blog_tags (
  id integer NOT NULL DEFAULT nextval('blog_tags_id_seq'::regclass),
  slug text NOT NULL,
  name text NOT NULL,
  CONSTRAINT blog_tags_pkey PRIMARY KEY (id, id, id)
);

CREATE TABLE public.job_postings (
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  type text NOT NULL,
  updated_at timestamp without time zone DEFAULT now(),
  salary text,
  active boolean NOT NULL DEFAULT true,
  title text NOT NULL,
  apply_url text,
  benefits text,
  responsibilities text NOT NULL,
  department text NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  id integer NOT NULL DEFAULT nextval('job_postings_id_seq'::regclass),
  location text NOT NULL,
  description text NOT NULL,
  requirements text NOT NULL,
  CONSTRAINT job_postings_pkey PRIMARY KEY (id, id, id, id, id, id, id, id, id, id, id, id, id, id, id)
);

CREATE TABLE public.messages (
  id integer NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
  phone text,
  name text NOT NULL,
  service text,
  created_at timestamp without time zone DEFAULT now(),
  message text NOT NULL,
  read boolean DEFAULT false,
  email text NOT NULL,
  CONSTRAINT messages_pkey PRIMARY KEY (id, id, id, id, id, id, id, id)
);

CREATE TABLE public.newsletter_subscribers (
  subscribed boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  id integer NOT NULL DEFAULT nextval('newsletter_subscribers_id_seq'::regclass),
  last_name text,
  email text NOT NULL,
  first_name text,
  CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id, id, id, id, id, id)
);

CREATE TABLE public.project_gallery (
  display_order integer DEFAULT 0,
  image_url text NOT NULL,
  caption text,
  id integer NOT NULL DEFAULT nextval('project_gallery_id_seq'::regclass),
  is_feature boolean DEFAULT false,
  project_id integer NOT NULL,
  CONSTRAINT project_gallery_pkey PRIMARY KEY (id, id, id, id, id, id)
);

CREATE TABLE public.projects (
  location text,
  completion_date text,
  image text NOT NULL,
  featured boolean DEFAULT false,
  overview text,
  size text,
  category text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  challenges text,
  description text NOT NULL,
  services_provided text,
  id integer NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
  results text,
  title text NOT NULL,
  client text,
  solutions text,
  CONSTRAINT projects_pkey PRIMARY KEY (id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id)
);

CREATE TABLE public.quote_request_attachments (
  quote_request_id integer NOT NULL,
  file_key text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_name text NOT NULL,
  id integer NOT NULL DEFAULT nextval('quote_request_attachments_id_seq'::regclass),
  file_size integer NOT NULL,
  CONSTRAINT quote_request_attachments_pkey PRIMARY KEY (id, id, id, id, id, id, id, id)
);

CREATE TABLE public.quote_requests (
  status text DEFAULT 'pending'::text,
  reviewed boolean DEFAULT false,
  description text NOT NULL,
  name text NOT NULL,
  company text,
  created_at timestamp without time zone DEFAULT now(),
  project_type text NOT NULL,
  budget text,
  email text NOT NULL,
  timeframe text,
  project_size text,
  phone text,
  id integer NOT NULL DEFAULT nextval('quote_requests_id_seq'::regclass),
  CONSTRAINT quote_requests_pkey PRIMARY KEY (id, id, id, id, id, id, id, id, id, id, id, id, id)
);

CREATE TABLE public.service_gallery (
  alt text,
  "order" integer DEFAULT 0,
  service_id integer NOT NULL,
  id integer NOT NULL DEFAULT nextval('service_gallery_id_seq'::regclass),
  caption text,
  image_url text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT service_gallery_pkey PRIMARY KEY (id, id, id, id, id, id, id)
);

CREATE TABLE public.services (
  icon text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  id integer NOT NULL DEFAULT nextval('services_id_seq'::regclass),
  features ARRAY,
  CONSTRAINT services_pkey PRIMARY KEY (id, id, id, id, id)
);

CREATE TABLE public.session (
  expire timestamp without time zone NOT NULL,
  sid character varying NOT NULL,
  sess json NOT NULL,
  CONSTRAINT session_pkey PRIMARY KEY (sid, sid, sid)
);

CREATE TABLE public.subcontractors (
  company_name text NOT NULL,
  website text,
  service_description text NOT NULL,
  how_did_you_hear text,
  "references" text,
  service_types ARRAY,
  notes text,
  city text NOT NULL,
  zip text NOT NULL,
  insurance boolean DEFAULT false,
  contact_name text NOT NULL,
  id integer NOT NULL DEFAULT nextval('subcontractors_id_seq'::regclass),
  licenses text,
  email text NOT NULL,
  address text NOT NULL,
  state text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp without time zone DEFAULT now(),
  phone text NOT NULL,
  years_in_business text NOT NULL,
  bondable boolean DEFAULT false,
  CONSTRAINT subcontractors_pkey PRIMARY KEY (id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id)
);

CREATE TABLE public.team_members (
  name text NOT NULL,
  id integer NOT NULL DEFAULT nextval('team_members_id_seq'::regclass),
  qualification text NOT NULL,
  active boolean DEFAULT true,
  bio text,
  designation text NOT NULL,
  "order" integer DEFAULT 0,
  photo text,
  gender text NOT NULL,
  "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT team_members_pkey PRIMARY KEY (id, id, id, id, id, id, id, id, id, id, id)
);

CREATE TABLE public.testimonials (
  approved boolean DEFAULT false,
  rating integer NOT NULL,
  email text,
  image text,
  "position" text NOT NULL,
  id integer NOT NULL DEFAULT nextval('testimonials_id_seq'::regclass),
  company text,
  created_at timestamp without time zone DEFAULT now(),
  name text NOT NULL,
  content text NOT NULL,
  CONSTRAINT testimonials_pkey PRIMARY KEY (id, id, id, id, id, id, id, id, id, id)
);

CREATE TABLE public.users (
  email text,
  username text NOT NULL,
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  role text DEFAULT 'user'::text,
  password text NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id, id, id, id, id)
);

CREATE TABLE public.vendors (
  phone text NOT NULL,
  contact_name text NOT NULL,
  "references" text,
  zip text NOT NULL,
  city text NOT NULL,
  status text DEFAULT 'pending'::text,
  state text NOT NULL,
  how_did_you_hear text,
  email text NOT NULL,
  id integer NOT NULL DEFAULT nextval('vendors_id_seq'::regclass),
  years_in_business text NOT NULL,
  address text NOT NULL,
  website text,
  company_name text NOT NULL,
  service_description text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  notes text,
  supply_types ARRAY,
  CONSTRAINT vendors_pkey PRIMARY KEY (id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id)
);

-- Foreign Keys
ALTER TABLE public.quote_request_attachments ADD CONSTRAINT quote_request_attachments_quote_request_id_fkey FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX "IDX_session_expire" ON public.session CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);

-- Sequence Reset Statements (Run after importing data)
-- Reset sequence for table blog_categories
SELECT setval('public.blog_categories_id_seq', COALESCE((SELECT MAX(id) FROM blog_categories), 0) + 1, false);
-- Reset sequence for table blog_gallery
SELECT setval('public.blog_gallery_id_seq', COALESCE((SELECT MAX(id) FROM blog_gallery), 0) + 1, false);
-- Reset sequence for table blog_posts
SELECT setval('public.blog_posts_id_seq', COALESCE((SELECT MAX(id) FROM blog_posts), 0) + 1, false);
-- Reset sequence for table blog_tags
SELECT setval('public.blog_tags_id_seq', COALESCE((SELECT MAX(id) FROM blog_tags), 0) + 1, false);
-- Reset sequence for table job_postings
SELECT setval('public.job_postings_id_seq', COALESCE((SELECT MAX(id) FROM job_postings), 0) + 1, false);
-- Reset sequence for table messages
SELECT setval('public.messages_id_seq', COALESCE((SELECT MAX(id) FROM messages), 0) + 1, false);
-- Reset sequence for table newsletter_subscribers
SELECT setval('public.newsletter_subscribers_id_seq', COALESCE((SELECT MAX(id) FROM newsletter_subscribers), 0) + 1, false);
-- Reset sequence for table project_gallery
SELECT setval('public.project_gallery_id_seq', COALESCE((SELECT MAX(id) FROM project_gallery), 0) + 1, false);
-- Reset sequence for table projects
SELECT setval('public.projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 0) + 1, false);
-- Reset sequence for table quote_request_attachments
SELECT setval('public.quote_request_attachments_id_seq', COALESCE((SELECT MAX(id) FROM quote_request_attachments), 0) + 1, false);
-- Reset sequence for table quote_requests
SELECT setval('public.quote_requests_id_seq', COALESCE((SELECT MAX(id) FROM quote_requests), 0) + 1, false);
-- Reset sequence for table service_gallery
SELECT setval('public.service_gallery_id_seq', COALESCE((SELECT MAX(id) FROM service_gallery), 0) + 1, false);
-- Reset sequence for table services
SELECT setval('public.services_id_seq', COALESCE((SELECT MAX(id) FROM services), 0) + 1, false);
-- Reset sequence for table subcontractors
SELECT setval('public.subcontractors_id_seq', COALESCE((SELECT MAX(id) FROM subcontractors), 0) + 1, false);
-- Reset sequence for table team_members
SELECT setval('public.team_members_id_seq', COALESCE((SELECT MAX(id) FROM team_members), 0) + 1, false);
-- Reset sequence for table testimonials
SELECT setval('public.testimonials_id_seq', COALESCE((SELECT MAX(id) FROM testimonials), 0) + 1, false);
-- Reset sequence for table users
SELECT setval('public.users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
-- Reset sequence for table vendors
SELECT setval('public.vendors_id_seq', COALESCE((SELECT MAX(id) FROM vendors), 0) + 1, false);
