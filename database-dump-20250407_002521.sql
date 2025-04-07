--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS neondb;
--
-- Name: neondb; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE neondb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


\connect neondb

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text
);


--
-- Name: blog_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_categories_id_seq OWNED BY public.blog_categories.id;


--
-- Name: blog_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_gallery (
    id integer NOT NULL,
    post_id integer NOT NULL,
    image_url text NOT NULL,
    caption text,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: blog_gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_gallery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_gallery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_gallery_id_seq OWNED BY public.blog_gallery.id;


--
-- Name: blog_post_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_post_categories (
    post_id integer NOT NULL,
    category_id integer NOT NULL
);


--
-- Name: blog_post_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_post_tags (
    post_id integer NOT NULL,
    tag_id integer NOT NULL
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text NOT NULL,
    image text NOT NULL,
    category text NOT NULL,
    author text NOT NULL,
    published boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: blog_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_tags (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


--
-- Name: blog_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_tags_id_seq OWNED BY public.blog_tags.id;


--
-- Name: job_postings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_postings (
    id integer NOT NULL,
    title text NOT NULL,
    department text NOT NULL,
    location text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    responsibilities text NOT NULL,
    requirements text NOT NULL,
    benefits text,
    salary text,
    apply_url text,
    active boolean DEFAULT true NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: job_postings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_postings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_postings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_postings_id_seq OWNED BY public.job_postings.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    service text,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    read boolean DEFAULT false
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id integer NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    subscribed boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.newsletter_subscribers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.newsletter_subscribers_id_seq OWNED BY public.newsletter_subscribers.id;


--
-- Name: project_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_gallery (
    id integer NOT NULL,
    project_id integer NOT NULL,
    image_url text NOT NULL,
    caption text,
    display_order integer DEFAULT 0,
    is_feature boolean DEFAULT false
);


--
-- Name: project_gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_gallery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_gallery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_gallery_id_seq OWNED BY public.project_gallery.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    image text NOT NULL,
    featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    overview text,
    challenges text,
    solutions text,
    results text,
    client text,
    location text,
    size text,
    completion_date text,
    services_provided text
);


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: quote_request_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_request_attachments (
    id integer NOT NULL,
    quote_request_id integer NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_key text NOT NULL,
    file_size integer NOT NULL,
    file_type text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: quote_request_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quote_request_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quote_request_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quote_request_attachments_id_seq OWNED BY public.quote_request_attachments.id;


--
-- Name: quote_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_requests (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    project_type text NOT NULL,
    project_size text,
    budget text,
    timeframe text,
    description text NOT NULL,
    status text DEFAULT 'pending'::text,
    reviewed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: quote_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quote_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quote_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quote_requests_id_seq OWNED BY public.quote_requests.id;


--
-- Name: service_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_gallery (
    id integer NOT NULL,
    service_id integer NOT NULL,
    image_url text NOT NULL,
    alt text,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    caption text
);


--
-- Name: service_gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_gallery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_gallery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_gallery_id_seq OWNED BY public.service_gallery.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    features text[]
);


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: subcontractors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subcontractors (
    id integer NOT NULL,
    company_name text NOT NULL,
    contact_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip text NOT NULL,
    website text,
    service_types text[],
    service_description text NOT NULL,
    years_in_business text NOT NULL,
    insurance boolean DEFAULT false,
    bondable boolean DEFAULT false,
    licenses text,
    "references" text,
    how_did_you_hear text,
    status text DEFAULT 'pending'::text,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: subcontractors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subcontractors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subcontractors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subcontractors_id_seq OWNED BY public.subcontractors.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    name text NOT NULL,
    designation text NOT NULL,
    qualification text NOT NULL,
    gender text NOT NULL,
    photo text,
    bio text,
    "order" integer DEFAULT 0,
    active boolean DEFAULT true,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    name text NOT NULL,
    "position" text NOT NULL,
    company text,
    content text NOT NULL,
    rating integer NOT NULL,
    image text,
    approved boolean DEFAULT false,
    email text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text,
    email text
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    company_name text NOT NULL,
    contact_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip text NOT NULL,
    website text,
    supply_types text[],
    service_description text NOT NULL,
    years_in_business text NOT NULL,
    "references" text,
    how_did_you_hear text,
    status text DEFAULT 'pending'::text,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: blog_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories ALTER COLUMN id SET DEFAULT nextval('public.blog_categories_id_seq'::regclass);


--
-- Name: blog_gallery id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_gallery ALTER COLUMN id SET DEFAULT nextval('public.blog_gallery_id_seq'::regclass);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: blog_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_tags ALTER COLUMN id SET DEFAULT nextval('public.blog_tags_id_seq'::regclass);


--
-- Name: job_postings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings ALTER COLUMN id SET DEFAULT nextval('public.job_postings_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: newsletter_subscribers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers ALTER COLUMN id SET DEFAULT nextval('public.newsletter_subscribers_id_seq'::regclass);


--
-- Name: project_gallery id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_gallery ALTER COLUMN id SET DEFAULT nextval('public.project_gallery_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: quote_request_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_request_attachments ALTER COLUMN id SET DEFAULT nextval('public.quote_request_attachments_id_seq'::regclass);


--
-- Name: quote_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_requests ALTER COLUMN id SET DEFAULT nextval('public.quote_requests_id_seq'::regclass);


--
-- Name: service_gallery id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_gallery ALTER COLUMN id SET DEFAULT nextval('public.service_gallery_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: subcontractors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractors ALTER COLUMN id SET DEFAULT nextval('public.subcontractors_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Data for Name: blog_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_categories (id, name, slug, description) FROM stdin;
1	Construction	construction	Articles about construction techniques, trends, and case studies
2	Renovation	renovation	Articles about renovation projects and home improvement
3	Architecture	architecture	Articles about architectural design and concepts
4	Sustainability	sustainability	Articles about sustainable and eco-friendly building practices
5	Industry News	industry-news	Latest news and updates from the construction industry
\.


--
-- Data for Name: blog_gallery; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_gallery (id, post_id, image_url, caption, "order", created_at) FROM stdin;
1	3	https://utfs.io/f/PFuaKVnX18hb87YYN0DtOVmxrgZuSC6kLz0KBf3E79JiPYoQ	Featured image	0	2025-04-07 00:03:51.303117
2	1	https://utfs.io/f/PFuaKVnX18hbaR5cQ2VOzWLZs1FcYNvXfKu7jG549RraP23T	Featured image	0	2025-04-07 00:05:48.811504
3	2	https://utfs.io/f/PFuaKVnX18hbueH7eiuEMxftyqm0wAQVaTXNU2HCulP3L6FD	Featured image	0	2025-04-07 00:07:43.027662
4	4	https://utfs.io/f/PFuaKVnX18hbDBdytq9XO6QEae3p8rvuWcZ1RqH0ngDSdyYA	Featured image	0	2025-04-07 00:09:50.371381
\.


--
-- Data for Name: blog_post_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_post_categories (post_id, category_id) FROM stdin;
3	5
3	1
1	3
1	4
1	5
2	3
2	1
4	1
4	3
4	3
4	5
4	5
\.


--
-- Data for Name: blog_post_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_post_tags (post_id, tag_id) FROM stdin;
3	10
3	8
1	10
1	6
1	3
1	8
2	4
2	9
2	8
2	6
2	7
4	1
4	2
4	2
4	5
4	6
4	7
4	8
4	8
4	9
4	10
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_posts (id, title, slug, content, excerpt, image, category, author, published, created_at) FROM stdin;
3	How Technology is Transforming the Construction Industry	technology-transforming-construction	<h2><strong>How Technology is Transforming the Construction Industry</strong></h2><p>The construction industry—once considered slow to adopt innovation—is undergoing a dramatic transformation thanks to technology. From digital blueprints to autonomous machinery, modern advancements are revolutionizing how projects are designed, managed, and executed. In an industry known for its complexity, cost overruns, and delays, technology is becoming the ultimate game-changer.</p><h3><strong>1. Building Information Modeling (BIM)</strong></h3><p>BIM is no longer a buzzword—it’s a cornerstone of modern construction. This intelligent 3D modeling process enables architects, engineers, and contractors to collaborate more efficiently. BIM not only visualizes the physical structure but also embeds data related to time, cost, and maintenance.</p><p><strong>Benefits:</strong></p><ul><li><p>Enhanced collaboration</p></li><li><p>Reduced rework and waste</p></li><li><p>Improved planning and visualization</p></li></ul><h3><strong>2. Drones and Aerial Imaging</strong></h3><p>Drones have become eyes in the sky for construction managers. They are used for surveying land, monitoring progress, inspecting structures, and ensuring site safety—all without needing boots on the ground.</p><p><strong>Benefits:</strong></p><ul><li><p>Faster and more accurate site surveys</p></li><li><p>Real-time progress tracking</p></li><li><p>Improved safety and compliance</p></li></ul><h3><strong>3. Robotics and Automation</strong></h3><p>Robots are now performing repetitive or dangerous tasks like bricklaying, concrete dispensing, and welding. These machines boost productivity and reduce the risk of injury on job sites.</p><p><strong>Benefits:</strong></p><ul><li><p>Increased efficiency</p></li><li><p>Consistent work quality</p></li><li><p>Safer working conditions</p></li></ul><h3><strong>4. IoT and Smart Sensors</strong></h3><p>Internet of Things (IoT) devices are enhancing construction sites by collecting real-time data on machinery, workers, and materials. Sensors can detect temperature changes, vibrations, or unsafe conditions, improving predictive maintenance and safety.</p><p><strong>Benefits:</strong></p><ul><li><p>Better decision-making with real-time data</p></li><li><p>Predictive maintenance of equipment</p></li><li><p>Reduced workplace accidents</p></li></ul><h3><strong>5. Augmented Reality (AR) and Virtual Reality (VR)</strong></h3><p>Imagine walking through a building before a single brick is laid. AR and VR make that possible, helping stakeholders experience designs, spot potential issues, and make changes early in the process.</p><p><strong>Benefits:</strong></p><ul><li><p>Enhanced client engagement</p></li><li><p>Improved design accuracy</p></li><li><p>Fewer costly surprises during construction</p></li></ul><h3><strong>6. Construction Management Software</strong></h3><p>Cloud-based project management platforms now allow seamless coordination among teams. These tools manage everything from budgeting and scheduling to document control and communication.</p><p><strong>Benefits:</strong></p><ul><li><p>Centralized project data</p></li><li><p>Streamlined communication</p></li><li><p>Better time and cost tracking</p></li></ul><h3><strong>7. Sustainable Construction Technologies</strong></h3><p>Green construction is being driven by innovations in materials and energy-efficient practices. Technologies like prefabrication, energy modeling software, and recyclable materials are helping reduce the carbon footprint of projects.</p><p><strong>Benefits:</strong></p><ul><li><p>Lower environmental impact</p></li><li><p>Energy-efficient buildings</p></li><li><p>Cost savings over the building lifecycle</p></li></ul><hr><h3><strong>Conclusion</strong></h3><p>Technology is not just transforming the way we build—it’s reshaping the entire lifecycle of construction projects, from planning and execution to maintenance and beyond. As digital tools and smart systems become more accessible, construction companies that embrace innovation will be better equipped to build smarter, safer, and more efficiently.</p><p>The future of construction is here—and it’s digital, data-driven, and highly dynamic.</p>	Technology is not just transforming the way we build—it’s reshaping the entire lifecycle of construction projects, from planning and execution to maintenance and beyond. As digital tools and smart systems become more accessible, construction companies that embrace innovation will be better equipped to build smarter, safer, and more efficiently.	https://utfs.io/f/PFuaKVnX18hb87YYN0DtOVmxrgZuSC6kLz0KBf3E79JiPYoQ		Robert Chen	t	2025-03-07 12:14:17.483
1	7 Sustainable Building Practices for Modern Construction	sustainable-building-practices	<h2><strong>7 Sustainable Building Practices for Modern Construction</strong></h2><p>As the world grapples with climate change and dwindling natural resources, sustainability in construction has moved from a “nice-to-have” to a necessity. The built environment contributes nearly <strong>40% of global CO₂ emissions</strong>, making sustainable building practices not just environmentally responsible, but economically and socially essential.</p><p>From design to demolition, modern construction is embracing green innovations that reduce waste, conserve energy, and create healthier living environments. Here are <strong>7 sustainable building practices</strong> that are shaping the future of construction.</p><hr><h3><strong>1. Energy-Efficient Design</strong></h3><p>Incorporating passive design elements—like building orientation, natural ventilation, and daylighting—reduces energy demand from the start. Architects are also integrating <strong>energy modeling tools</strong> to simulate performance before construction begins.</p><p><strong>Benefits:</strong></p><ul><li><p>Lower utility costs</p></li><li><p>Reduced carbon footprint</p></li><li><p>Enhanced occupant comfort</p></li></ul><hr><h3><strong>2. Green Building Materials</strong></h3><p>Sustainable construction favors <strong>recycled, reclaimed, or rapidly renewable</strong> materials. Examples include bamboo, recycled steel, cork, rammed earth, and reclaimed wood. These materials require fewer resources to produce and are often biodegradable or recyclable.</p><p><strong>Benefits:</strong></p><ul><li><p>Less environmental degradation</p></li><li><p>Reduced construction waste</p></li><li><p>Healthier indoor air quality</p></li></ul><hr><h3><strong>3. Water Conservation Systems</strong></h3><p>Modern buildings are now designed with <strong>low-flow fixtures, greywater systems</strong>, and <strong>rainwater harvesting</strong> to reduce water consumption. Landscaping with native, drought-resistant plants also minimizes irrigation needs.</p><p><strong>Benefits:</strong></p><ul><li><p>Lower water bills</p></li><li><p>Reduced strain on local water systems</p></li><li><p>Conservation of a precious resource</p></li></ul><hr><h3><strong>4. On-Site Renewable Energy</strong></h3><p>Solar panels, wind turbines, and geothermal systems are being integrated directly into building projects. These renewable sources reduce dependency on fossil fuels and provide long-term savings.</p><p><strong>Benefits:</strong></p><ul><li><p>Clean, renewable energy</p></li><li><p>Reduced energy bills</p></li><li><p>Incentives and tax credits</p></li></ul><hr><h3><strong>5. Smart Building Technology</strong></h3><p>Smart sensors and IoT devices enable real-time monitoring of energy, water, lighting, and HVAC systems. These systems <strong>optimize resource usage</strong> and help maintain efficient building performance over time.</p><p><strong>Benefits:</strong></p><ul><li><p>Data-driven sustainability</p></li><li><p>Automated energy savings</p></li><li><p>Predictive maintenance</p></li></ul><hr><h3><strong>6. Waste Reduction During Construction</strong></h3><p>Sustainable projects emphasize <strong>modular construction, prefabrication</strong>, and <strong>on-site recycling</strong> to reduce waste. Careful planning and lean construction methods also help minimize excess materials.</p><p><strong>Benefits:</strong></p><ul><li><p>Less landfill contribution</p></li><li><p>Lower material costs</p></li><li><p>More efficient workflows</p></li></ul><hr><h3><strong>7. Certifications and Standards</strong></h3><p>Pursuing certifications like <strong>LEED (Leadership in Energy and Environmental Design)</strong> or <strong>WELL Building Standard</strong> ensures that a project adheres to rigorous sustainability benchmarks, improving both its market value and long-term viability.</p><p><strong>Benefits:</strong></p><ul><li><p>Higher property value</p></li><li><p>Brand reputation boost</p></li><li><p>Alignment with ESG goals</p></li></ul><hr><h3><strong>Conclusion</strong></h3><p>Sustainability in construction is more than just a trend—it’s a fundamental shift in how we think about the built environment. These seven practices not only contribute to a healthier planet, but also provide tangible benefits for developers, occupants, and communities alike.</p><p>By embracing sustainable building practices today, we pave the way for a more resilient, efficient, and eco-friendly tomorrow.</p>	Sustainability in construction is more than just a trend—it’s a fundamental shift in how we think about the built environment. These seven practices not only contribute to a healthier planet, but also provide tangible benefits for developers, occupants, and communities alike.	https://utfs.io/f/PFuaKVnX18hbaR5cQ2VOzWLZs1FcYNvXfKu7jG549RraP23T		John Smith	t	2025-03-07 12:14:17.483
2	The Evolution of Architectural Design in Commercial Buildings	evolution-architectural-design	<h2><strong>The Evolution of Architectural Design in Commercial Buildings</strong></h2><p>From towering skyscrapers to sprawling business parks, commercial buildings have undergone a dramatic transformation over the past century. Architectural design in this space has evolved from utilitarian brick-and-mortar structures to technologically advanced, sustainable, and human-centric environments. This evolution reflects not just advancements in construction materials and methods, but also changing social, economic, and environmental priorities.</p><p>Let’s take a closer look at how commercial architecture has evolved and where it’s headed next.</p><hr><h3><strong>1. Early 20th Century: Function Over Form</strong></h3><p>At the dawn of the 1900s, commercial buildings prioritized functionality. Architecture was heavily influenced by industrial needs—warehouses, factories, and office buildings were often simple, boxy, and uniform.</p><p><strong>Key characteristics:</strong></p><ul><li><p>Minimal ornamentation</p></li><li><p>Heavy use of brick, concrete, and steel</p></li><li><p>Design focused on maximizing space and productivity</p></li></ul><p>The rise of skyscrapers, driven by steel-frame construction and elevators, began reshaping city skylines—marking the beginning of vertical commercial architecture.</p><hr><h3><strong>2. Mid-Century Modern: Clean Lines and Open Space</strong></h3><p>Post-WWII optimism fueled a wave of creativity in architecture. The <strong>Mid-Century Modern</strong> movement introduced cleaner lines, open interiors, and large glass façades, emphasizing simplicity and functionality with a hint of elegance.</p><p><strong>Key features:</strong></p><ul><li><p>Open-plan offices</p></li><li><p>Curtain walls and glass exteriors</p></li><li><p>Emphasis on light and space</p></li></ul><p>This era also saw the rise of corporate headquarters that mirrored the company’s identity through architecture.</p><hr><h3><strong>3. Late 20th Century: Branding and Postmodernism</strong></h3><p>The 1980s and '90s brought a shift from minimalism to <strong>Postmodern architecture</strong>, characterized by bold forms, playful aesthetics, and symbolic elements. Commercial buildings began to reflect <strong>corporate branding</strong> more overtly.</p><p><strong>Key features:</strong></p><ul><li><p>Asymmetrical forms</p></li><li><p>Eclectic design elements</p></li><li><p>Branded architectural identities</p></li></ul><p>Skyscrapers became more sculptural, and design was increasingly seen as a way to make a statement in a competitive business world.</p><hr><h3><strong>4. Early 21st Century: Sustainability and Smart Buildings</strong></h3><p>With growing awareness of climate change, sustainability became a major focus. Architects began integrating <strong>green building principles</strong> like energy efficiency, natural ventilation, and sustainable materials.</p><p><strong>Key developments:</strong></p><ul><li><p>LEED-certified buildings</p></li><li><p>Solar panels and green roofs</p></li><li><p>Smart HVAC and lighting systems</p></li></ul><p>Buildings became living ecosystems designed to interact with their environment while reducing ecological footprints.</p><hr><h3><strong>5. The Present: Human-Centered and Hybrid Spaces</strong></h3><p>Today’s commercial architecture puts <strong>people and flexibility</strong> at the center. Post-pandemic work trends have redefined the office—from rigid cubicles to hybrid, collaborative, and wellness-oriented environments.</p><p><strong>Modern trends:</strong></p><ul><li><p>Biophilic design (natural elements indoors)</p></li><li><p>Flexible layouts for hybrid work</p></li><li><p>Health and wellness certifications (e.g., WELL)</p></li><li><p>AI and IoT integration for personalized experiences</p></li></ul><p>Modern commercial buildings don’t just house businesses—they <strong>attract talent, promote well-being</strong>, and adapt to ever-evolving needs.</p><hr><h3><strong>6. The Future: AI-Driven, Responsive Architecture</strong></h3><p>Looking forward, architectural design in commercial spaces will become <strong>increasingly data-driven</strong>, with AI and machine learning playing a key role. Imagine buildings that <strong>adapt in real-time</strong> to occupancy levels, environmental conditions, and even employee mood.</p><p><strong>Anticipated innovations:</strong></p><ul><li><p>Dynamic floor plans</p></li><li><p>Climate-responsive façades</p></li><li><p>Personalized office environments</p></li><li><p>3D-printed components and modular construction</p></li></ul><hr><h3><strong>Conclusion</strong></h3><p>The evolution of commercial architectural design tells the story of how businesses—and society—have changed over time. From rigid, utilitarian spaces to sustainable, intelligent buildings that put people first, architecture is no longer just about where we work. It’s about <strong>how we work, connect, and thrive</strong>.</p><p>As technology and values continue to evolve, so too will the buildings we create to support them.</p>	The evolution of commercial architectural design tells the story of how businesses—and society—have changed over time. From rigid, utilitarian spaces to sustainable, intelligent buildings that put people first, architecture is no longer just about where we work. It’s about how we work, connect, and thrive.	https://utfs.io/f/PFuaKVnX18hbueH7eiuEMxftyqm0wAQVaTXNU2HCulP3L6FD		Emma Johnson	t	2025-03-07 12:14:17.483
4	How Modular Construction Is Speeding Up Project Delivery	how-modular-construction-is-speeding-up-project-delivery	<h2><strong>How Modular Construction Is Speeding Up Project Delivery</strong></h2><p>In today’s fast-paced world, speed and efficiency in construction have become more critical than ever. Whether it’s a hospital, school, office building, or housing complex—stakeholders want projects delivered on time, within budget, and with minimal disruption.</p><p>Enter <strong>modular construction</strong>: a game-changing approach that’s revolutionizing how buildings are designed, fabricated, and assembled. By shifting significant portions of the construction process <strong>off-site and into controlled factory environments</strong>, modular methods are slashing timelines and redefining what’s possible in modern construction.</p><hr><h3><strong>What Is Modular Construction?</strong></h3><p>Modular construction involves <strong>building components (modules) off-site</strong>, in a controlled setting, and then <strong>transporting and assembling</strong> them at the final site. These modules can include everything from wall panels and bathrooms to entire rooms or floors.</p><p>Unlike traditional stick-built methods, modular construction allows for <strong>simultaneous on-site and off-site work</strong>, drastically cutting down project schedules.</p><hr><h3><strong>Ways Modular Construction Accelerates Project Delivery</strong></h3><h4><strong>1. Off-Site Fabrication = On-Site Efficiency</strong></h4><p>While the site is being excavated and the foundation is poured, modular units are built in the factory. This <strong>parallel workflow</strong> allows projects to move much faster than traditional sequencing.</p><p>✅ <strong>Result:</strong> Weeks or even months saved on the project timeline.</p><hr><h4><strong>2. Weather Delays? Not a Problem</strong></h4><p>Factory environments protect materials and workers from unpredictable weather. Rain, snow, or extreme heat don’t slow production, which means <strong>fewer delays and consistent output.</strong></p><p>✅ <strong>Result:</strong> Reliable scheduling and minimized downtime.</p><hr><h4><strong>3. Faster Installation &amp; Assembly</strong></h4><p>Once modules are delivered to the site, they are <strong>assembled like building blocks</strong>—stacked, bolted, and finished in record time. Because components arrive 80–90% complete, the remaining on-site work is minimal.</p><p>✅ <strong>Result:</strong> Dramatic reduction in on-site labor hours.</p><hr><h4><strong>4. Improved Quality Control</strong></h4><p>Off-site construction allows for <strong>standardized quality checks</strong> and use of precise machinery. This reduces rework, defects, and coordination issues that typically slow traditional builds.</p><p>✅ <strong>Result:</strong> Fewer delays due to quality concerns or inspections.</p><hr><h4><strong>5. Less Disruption in Urban Areas</strong></h4><p>In cities or tight spaces, modular construction minimizes noise, dust, and traffic. A significant portion of the noisy, labor-intensive work is done elsewhere—making it ideal for fast-track urban development.</p><p>✅ <strong>Result:</strong> Faster approvals, fewer neighbor complaints, and quicker handover.</p><hr><h3><strong>Who’s Using Modular Construction?</strong></h3><ul><li><p><strong>Hospitals &amp; Healthcare Facilities:</strong> Built in weeks instead of months</p></li><li><p><strong>Hotels &amp; Multi-Family Housing:</strong> Standardized rooms speed up replication</p></li><li><p><strong>Commercial Offices:</strong> Flexible designs and rapid deployment</p></li><li><p><strong>Schools:</strong> Quick builds to match enrollment needs</p></li></ul><p>Even large brands like <strong>Marriott International</strong> and <strong>Google</strong> have embraced modular construction to fast-track their building goals.</p><hr><h3><strong>Conclusion</strong></h3><p>Modular construction is no longer a futuristic concept—it’s a proven strategy for <strong>faster, smarter, and more sustainable</strong> project delivery. As the industry faces increased pressure for speed, cost-efficiency, and sustainability, modular methods offer a powerful solution.</p><p>Whether you're planning a commercial space, residential project, or public infrastructure—<strong>modular may be the fastest way forward.</strong></p>	Modular construction is no longer a futuristic concept—it’s a proven strategy for faster, smarter, and more sustainable project delivery. As the industry faces increased pressure for speed, cost-efficiency, and sustainability, modular methods offer a powerful solution.	https://utfs.io/f/PFuaKVnX18hbDBdytq9XO6QEae3p8rvuWcZ1RqH0ngDSdyYA		Unknown	t	2025-04-07 00:09:33.525728
\.


--
-- Data for Name: blog_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_tags (id, name, slug) FROM stdin;
1	Residential	residential
2	Commercial	commercial
3	Green Building	green-building
4	Interior Design	interior-design
5	Project Management	project-management
6	Building Materials	building-materials
7	Safety	safety
8	Technology	technology
9	Cost Efficiency	cost-efficiency
10	Design Trends	design-trends
\.


--
-- Data for Name: job_postings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_postings (id, title, department, location, type, description, responsibilities, requirements, benefits, salary, apply_url, active, featured, created_at, updated_at) FROM stdin;
2	Construction Superintendent	Field Operations	Miami, FL	full-time	ARCEMUSA is looking for a skilled Construction Superintendent to oversee day-to-day field operations on our residential and commercial construction sites. You will be responsible for coordinating subcontractors, ensuring safety compliance, and maintaining quality control standards.	Supervise and coordinate all on-site construction activities\nEnsure projects adhere to schedules, specifications, and budgets\nImplement and enforce safety protocols and quality control measures\nCoordinate material deliveries and manage on-site inventory\nConduct daily subcontractor meetings to review progress and resolve issues\nMaintain detailed daily logs and progress reports\nCollaborate with Project Managers to address any site challenges\nInspect work for compliance with building codes and project specifications	Minimum 5 years of experience as a Construction Superintendent\nStrong knowledge of construction methods, materials, and building codes\nOSHA 30-hour certification\nExperience with scheduling and coordinating subcontractors\nAbility to read and interpret construction plans and specifications\nExcellent problem-solving and communication skills\nValid driver's license and reliable transportation	Competitive salary based on experience\nComprehensive health and dental insurance\n401(k) retirement plan\nPaid time off and holidays\nCompany truck and fuel allowance\nCell phone allowance\nOpportunities for advancement	$75,000 - $95,000 per year, based on experience	\N	t	t	2025-03-13 03:34:40.386757	\N
3	Civil Engineer	Engineering	Denver, CO	full-time	Join our engineering team as a Civil Engineer responsible for designing and developing infrastructure for our commercial and industrial construction projects. You will work closely with project teams to provide technical expertise and innovative solutions.	Develop civil engineering designs for construction projects\nCreate site development plans, including grading, drainage, and utilities\nPerform engineering calculations and prepare technical specifications\nReview and approve shop drawings and submittals\nCoordinate with architects, contractors, and regulatory agencies\nConduct site visits to monitor construction progress\nEnsure compliance with applicable codes and regulations\nPrepare permit applications and supporting documentation	Bachelor's degree in Civil Engineering (Master's preferred)\nProfessional Engineer (PE) license\n3+ years of experience in civil engineering for construction projects\nProficiency in AutoCAD, Civil 3D, and other relevant software\nKnowledge of local building codes and regulations\nStrong analytical and problem-solving skills\nExcellent written and verbal communication abilities	Competitive salary and performance bonuses\nHealth, dental, and vision insurance\n401(k) retirement plan with company match\nProfessional development and license renewal support\nPaid time off and holidays\nFlexible work arrangements\nCollaborative team environment	$70,000 - $90,000 per year, depending on qualifications	\N	t	f	2025-03-13 03:34:40.386757	\N
4	Estimator	Preconstruction	Atlanta, GA	full-time	We are seeking a detail-oriented Estimator to join our preconstruction team. In this role, you will be responsible for developing accurate cost estimates for construction projects, analyzing drawings and specifications, and supporting the bid process.	Prepare detailed cost estimates for construction projects\nReview plans, specifications, and contract documents\nSolicit and analyze subcontractor and supplier quotes\nIdentify cost-saving opportunities and value engineering solutions\nParticipate in pre-bid meetings and site visits\nAssist in developing project budgets and schedules\nSupport the bid preparation and submission process\nMaintain current knowledge of material costs and market trends	Bachelor's degree in Construction Management, Engineering, or related field\n3+ years of experience in construction estimating\nProficiency in estimating software and MS Excel\nStrong understanding of construction methods and materials\nAbility to read and interpret construction documents\nExcellent analytical and mathematical skills\nAttention to detail and accuracy\nStrong communication and negotiation abilities	Competitive salary\nComprehensive benefits package\n401(k) retirement plan\nProfessional development opportunities\nPaid time off\nCollaborative work environment	$65,000 - $85,000 per year, commensurate with experience	\N	t	f	2025-03-13 03:34:40.386757	\N
5	Safety Manager	Safety & Compliance	Chicago, IL	full-time	ARCEMUSA is seeking a Safety Manager to develop, implement, and oversee our company-wide safety program across all project sites. The ideal candidate will have a strong background in construction safety and a passion for creating a culture of safety excellence.	Develop and maintain company safety policies and procedures\nConduct regular safety inspections and audits of project sites\nInvestigate incidents and near-misses and implement corrective actions\nProvide safety training for employees and subcontractors\nEnsure compliance with OSHA and other regulatory requirements\nTrack and report safety metrics and performance indicators\nCollaborate with project teams to address safety concerns\nStay current with industry best practices and regulations	Bachelor's degree in Safety Management, Construction Management, or related field\nOSHA 30-hour certification (CHST or CSP preferred)\n5+ years of experience in construction safety management\nKnowledge of federal, state, and local safety regulations\nStrong leadership and communication skills\nExperience with safety training and program development\nProficiency with safety management software\nValid driver's license and ability to travel to multiple project sites	Competitive salary\nComprehensive health benefits\n401(k) retirement plan with company match\nProfessional development and certification support\nCompany vehicle or allowance\nPaid time off and holidays	$75,000 - $95,000 annually, based on experience and certifications	\N	t	f	2025-03-13 03:34:40.386757	\N
6	Project Engineer	Project Management	Miami, FL	full-time	We are looking for a Project Engineer to support our project management team on commercial construction projects. This position is ideal for candidates who are early in their construction career and eager to learn and grow with our company.	Assist Project Managers with daily project activities\nReview and process submittals, RFIs, and change orders\nMaintain project documentation and filing systems\nPrepare meeting minutes and track action items\nCoordinate with subcontractors and suppliers\nPerform quantity takeoffs and material tracking\nAssist with quality control inspections\nSupport schedule updates and progress tracking	Bachelor's degree in Construction Management, Engineering, or related field\n0-3 years of experience in construction (internship experience considered)\nFamiliarity with construction documents and procedures\nProficiency in MS Office Suite\nBasic knowledge of construction methods and materials\nStrong organizational and communication skills\nAbility to work in a fast-paced team environment\nWillingness to learn and take on new responsibilities	Competitive entry-level salary\nHealth, dental, and vision insurance\n401(k) retirement plan\nPaid time off\nMentorship opportunities\nProfessional development and training\nClear career advancement path	$55,000 - $70,000 per year	\N	t	f	2025-03-13 03:34:40.386757	\N
7	Administrative Assistant	Administration	Denver, CO	full-time	ARCEMUSA is seeking an Administrative Assistant to provide support to our office operations. The ideal candidate will be organized, detail-oriented, and possess excellent communication skills to help maintain efficient office functions.	Provide administrative support to executives and project teams\nManage phone calls, correspondence, and office communication\nCoordinate meetings, travel arrangements, and office events\nMaintain filing systems and organize office documentation\nProcess expense reports and invoices\nAssist with basic accounting and data entry tasks\nOrder office supplies and manage inventory\nGreet visitors and provide a professional front office presence	High school diploma required, Associate's degree preferred\n2+ years of administrative or office experience\nProficiency in MS Office Suite (Word, Excel, Outlook)\nStrong organizational and time management skills\nExcellent written and verbal communication abilities\nProfessional demeanor and customer service orientation\nAbility to handle confidential information with discretion\nExperience in construction industry a plus	Competitive hourly wage\nHealth benefits package\nPaid time off and holidays\n401(k) retirement plan\nProfessional work environment\nOpportunity for growth and skill development	$40,000 - $50,000 per year	\N	t	f	2025-03-13 03:34:40.386757	\N
8	Marketing Coordinator	Marketing	Atlanta, GA	part-time	We are looking for a part-time Marketing Coordinator to support our marketing and business development efforts. This role will assist with creating marketing materials, maintaining our online presence, and supporting proposal development.	Assist with the creation of marketing materials and presentations\nUpdate company website and social media platforms\nSupport the development of project proposals and qualifications packages\nCoordinate photography for completed projects\nMaintain marketing database and project information\nAssist with industry events and client relationship activities\nTrack marketing metrics and reporting\nSupport public relations and community outreach initiatives	Bachelor's degree in Marketing, Communications, or related field\n1-3 years of marketing experience, preferably in AEC industry\nProficiency in graphic design software (Adobe Creative Suite)\nExperience with website management and social media platforms\nStrong writing and editing skills\nKnowledge of digital marketing strategies\nAttention to detail and creative problem-solving abilities\nPhotography skills a plus	Competitive hourly rate\nFlexible work schedule (20-25 hours per week)\nPaid time off\nProfessional development opportunities\nPotential for growth to full-time position	$25 - $30 per hour, based on experience	\N	t	f	2025-03-13 03:34:40.386757	\N
1	Senior Project Manager	Project Management	Chicago, IL	full-time	We are seeking an experienced Project Manager to oversee large-scale commercial construction projects from inception to completion. The ideal candidate will have a proven track record of delivering projects on time and within budget while maintaining high quality standards.	Oversee all aspects of construction projects from pre-construction to closeout\nDevelop and maintain project schedules, budgets, and resource allocation plans\nCoordinate with architects, engineers, subcontractors, and regulatory agencies\nConduct regular site visits to monitor progress and ensure quality control\nManage project documentation, including contracts, change orders, and permits\nIdentify and mitigate project risks and resolve issues promptly\nLead client meetings and provide regular progress updates\nMentor junior project team members	Bachelor's degree in Construction Management, Civil Engineering, or related field\n7+ years of experience in construction project management\nPMP certification or equivalent\nProficient in project management software and MS Office Suite\nStrong understanding of construction methods, building codes, and industry standards\nExcellent communication, leadership, and problem-solving skills\nExperience with commercial construction projects valued at $10M+	Competitive salary and performance bonuses\nComprehensive health, dental, and vision insurance\n401(k) retirement plan with company match\nPaid time off and holidays\nProfessional development opportunities\nCompany vehicle or allowance	$90,000 - $120,000 per year, based on experience	\N	t	t	2025-03-13 03:34:40.386757	\N
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, name, email, phone, service, message, created_at, read) FROM stdin;
1	Nawazuddin F Mohammed-Khaja	kfnawaz@gmail.com	2817451997	residential	Service Interested In	2025-03-07 20:33:59.056151	t
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter_subscribers (id, email, first_name, last_name, subscribed, created_at) FROM stdin;
1	test@example.com	Test	User	t	2025-03-08 09:31:44.802367
2	kfnawaz@gmail.com			t	2025-03-08 10:00:04.015376
\.


--
-- Data for Name: project_gallery; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_gallery (id, project_id, image_url, caption, display_order, is_feature) FROM stdin;
255	41	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hb87emxTPDtOVmxrgZuSC6kLz0KBf3E79JiPYo	Project image 1	1	f
256	41	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbovEsCPegHX2BerjURCvqW9iLGkhI8ZOmbFTc	Project image 2	2	f
257	41	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbjvtyR9ZWUbvZnqu0hYI7zSHgtx5MEkfawOpy	Project image 3	3	t
258	41	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbWDwNh6Kw8pStm5cLnrlQYOB1Iub9TsA0MkHK	Project image 4	4	f
259	41	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hb9iwebX7g25NAsY6j4EZCGRKH0cwhWfMQ1o3q	Project image 5	5	f
260	42	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbn02wj2TSitgkxOWDhyfs9maQC73Y8qjKHMNb	Project image 1	1	f
261	42	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hb7x5aDqiMuz8PFtsAyd4Q36jkvbJeqg2fLIxa	Project image 2	2	f
262	42	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbLdNV0fAiCMzNSTaHdJPuIGc583t2fWlsEOwr	Project image 3	3	f
263	42	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hb3DCbmpUIzrkm0d59s3jowi4LVHDCvG2ZqOx1	Project image 4	4	f
264	42	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbMtmJXvRlzoE7eD0ZXPm4SRUqtGaVgB5Yphxu	Project image 5	5	f
265	42	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbye5uTowIglomVz1juEf0bAxNrQ6ZBs8cnp4P	Project image 6	6	f
266	42	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbG4Z41987VFmMTuCwOEQ54zBKqHl28IkPJs3t	Project image 7	7	f
267	42	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hblGBMr5FJI3QgZT5cikPObDx4znostAEypXNr	Project image 8	8	f
268	42	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbfkPKcAJ3MQeYmWUAbVG8xSdsnrDJLzl7a2Fh	Project image 9	9	t
269	42	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbpBjmA7354D9kTfIwgcMCraFhOysvUj3AHBY7	Project image 10	10	f
270	43	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbPhYbO9FnX18hbEAsIFukNZYdRopJGafej907	Project image 1	1	f
276	43	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbYEudJetD2abumsG5djXvCOh4lRAigzL9HP7B	Project image 7	7	t
271	43	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbjy0G6sWUbvZnqu0hYI7zSHgtx5MEkfawOpy1	Project image 2	2	f
277	43	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbJPT1A6jFfX45K7txTbUwp38PIzNuYeEkQgyi	Project image 8	8	f
272	43	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbimxXO6wN6LbHSYrtdJjg0qVp8oIkCzXDETh7	Project image 3	3	f
273	43	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbgjb7yfXeLaIGd86O0wjzMsPbFREfTHCAkilt	Project image 4	4	f
278	44	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbmsCpiVGBKeJF0Pru5A6cXasUpqYMd7Ohw3QL	Project image 1	1	f
274	43	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbLz1NpLiCMzNSTaHdJPuIGc583t2fWlsEOwrn	Project image 5	5	f
275	43	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbrFCYmkSsjtlYyNmMuswxcQeaK42WEPXLOGig	Project image 6	6	f
279	44	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbY2rZZltD2abumsG5djXvCOh4lRAigzL9HP7B	Project image 2	2	t
280	45	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hb7lqRkQMuz8PFtsAyd4Q36jkvbJeqg2fLIxaM	Project image 1	1	t
281	45	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hboSSGPf4egHX2BerjURCvqW9iLGkhI8ZOmbFT	Project image 2	2	f
282	45	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbFOMOr4skhw4KiYWFVnc8DA6zblU3tTECg2um	Project image 3	3	f
283	45	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbr8Au0IsjtlYyNmMuswxcQeaK42WEPXLOGigV	Project image 4	4	f
284	45	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbtP6g3rjGF6z7TZrnY4EamiyMBltgD2bPexpd	Project image 5	5	f
285	45	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hb8JPH6jDtOVmxrgZuSC6kLz0KBf3E79JiPYoQ	Project image 6	6	f
292	47	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbjvBi4HgWUbvZnqu0hYI7zSHgtx5MEkfawOpy	Project image 1	1	f
293	47	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hb5oHf9XcuODpJcjVQA2uq6gT8t9BsHha5FPWf	Project image 2	2	f
294	47	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbp85cPe354D9kTfIwgcMCraFhOysvUj3AHBY7	Project image 3	3	f
295	47	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbQUh9lBhp7DhCf9rRBl8kcZFgiPTwuE4eHXbU	Project image 4	4	f
296	47	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hblEeT6DW5FJI3QgZT5cikPObDx4znostAEypX	Project image 5	5	t
297	47	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hb0g4X4Oa4JA6XowIxFSdpZaGVRTehDYkqEMrg	Project image 6	6	f
298	47	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbHCT0TozB1RFYSXntoEjDzf8AgJZVeyM2Qsvh	Project image 7	7	f
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, title, category, description, image, featured, created_at, overview, challenges, solutions, results, client, location, size, completion_date, services_provided) FROM stdin;
43	Golden Tree	Commercial	Golden Tree	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbYEudJetD2abumsG5djXvCOh4lRAigzL9HP7B	t	2025-04-04 20:44:51.571992	Golden Tree		\N						
44	Tenant Improvement	Commercial	Tenant Improvement	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbY2rZZltD2abumsG5djXvCOh4lRAigzL9HP7B	t	2025-04-04 20:45:50.769349	Tenant Improvement		\N						
45	C-Store Gas Station	Commercial	C-Store Gas Station	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hb7lqRkQMuz8PFtsAyd4Q36jkvbJeqg2fLIxaM	t	2025-04-04 20:52:47.419339	C-Store Gas Station		\N						
42	Truck Stop	Commercial	Truck Stop	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbfkPKcAJ3MQeYmWUAbVG8xSdsnrDJLzl7a2Fh	t	2025-04-04 20:43:11.923837	Truck Stop		\N						
41	Mecca Cemetery 	Other		https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hbjvtyR9ZWUbvZnqu0hYI7zSHgtx5MEkfawOpy	t	2025-04-04 20:39:03.6078	Mecca Cemetery 		\N						
47	T-Mobile Store	Commercial	T-Mobile Store	https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hblEeT6DW5FJI3QgZT5cikPObDx4znostAEypX	t	2025-04-04 21:02:27.364854	T-Mobile Store		\N						
\.


--
-- Data for Name: quote_request_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_request_attachments (id, quote_request_id, file_name, file_url, file_key, file_size, file_type, created_at) FROM stdin;
1	7	f47eec8c-f347-449c-b9f1-e408614562fa copy.jpeg	https://utfs.io/f/PFuaKVnX18hbA4ZXYjVSGC30jWHrqkRzialsn18IwyDL6NMU	PFuaKVnX18hbA4ZXYjVSGC30jWHrqkRzialsn18IwyDL6NMU	338187	jpeg	2025-04-05 00:44:17.688981
2	7	20250108-statements-5259-.pdf	https://utfs.io/f/PFuaKVnX18hbvJTy1EBK2TgpdhPU6AjyFnXRQ5a84vDOJ0WZ	PFuaKVnX18hbvJTy1EBK2TgpdhPU6AjyFnXRQ5a84vDOJ0WZ	208471	pdf	2025-04-05 00:44:17.82088
\.


--
-- Data for Name: quote_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_requests (id, name, email, phone, company, project_type, project_size, budget, timeframe, description, status, reviewed, created_at) FROM stdin;
7	abc	asdfa@gmad.com	2242424242	dasldkjfa	commercial				Project Project Project Project Project 	pending	t	2025-04-05 00:44:17.553929
\.


--
-- Data for Name: service_gallery; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_gallery (id, service_id, image_url, alt, "order", created_at, caption) FROM stdin;
116	21	/uploads/services/services.jpg	Mechanical, Electrical & Plumbing services by ARCEMUSA	0	2025-04-04 21:15:44.978616	
111	16	/uploads/services/services.jpg	Residential Construction services by ARCEMUSA	0	2025-04-04 21:15:43.680947	
112	17	/uploads/services/services.jpg	Commercial Construction services by ARCEMUSA	0	2025-04-04 21:15:43.940379	
113	18	/uploads/services/services.jpg	Renovation & Remodeling services by ARCEMUSA	0	2025-04-04 21:15:44.202079	
114	19	/uploads/services/services.jpg	Construction Management services by ARCEMUSA	0	2025-04-04 21:15:44.461563	
115	20	/uploads/services/services.jpg	Industrial Construction services by ARCEMUSA	0	2025-04-04 21:15:44.720292	
117	22	/uploads/services/services.jpg	Civil Engineering services by ARCEMUSA	0	2025-04-04 21:15:45.236672	
118	23	/uploads/services/services.jpg	Sustainable Construction services by ARCEMUSA	0	2025-04-04 21:15:45.494648	
119	24	/uploads/services/services.jpg	Project Consulting services by ARCEMUSA	0	2025-04-04 21:15:45.753287	
120	25	/uploads/services/services.jpg	Real Estate Development services by ARCEMUSA	0	2025-04-04 21:15:46.011631	
125	16	/uploads/services/construction-projects.jpg	Residential Construction construction projects by ARCEMUSA	1	2025-04-04 21:16:50.527915	
126	16	/uploads/services/our-passion-led-us-here.jpg	Residential Construction passion-driven services by ARCEMUSA	2	2025-04-04 21:16:50.786957	
127	17	/uploads/services/construction-projects.jpg	Commercial Construction construction projects by ARCEMUSA	1	2025-04-04 21:16:51.046641	
128	17	/uploads/services/our-passion-led-us-here.jpg	Commercial Construction passion-driven services by ARCEMUSA	2	2025-04-04 21:16:51.307479	
129	18	/uploads/services/construction-projects.jpg	Renovation & Remodeling construction projects by ARCEMUSA	1	2025-04-04 21:16:51.566817	
130	18	/uploads/services/our-passion-led-us-here.jpg	Renovation & Remodeling passion-driven services by ARCEMUSA	2	2025-04-04 21:16:51.828448	
131	19	/uploads/services/construction-projects.jpg	Construction Management construction projects by ARCEMUSA	1	2025-04-04 21:16:52.087192	
132	19	/uploads/services/our-passion-led-us-here.jpg	Construction Management passion-driven services by ARCEMUSA	2	2025-04-04 21:16:52.346035	
133	20	/uploads/services/construction-projects.jpg	Industrial Construction construction projects by ARCEMUSA	1	2025-04-04 21:16:52.604742	
134	20	/uploads/services/our-passion-led-us-here.jpg	Industrial Construction passion-driven services by ARCEMUSA	2	2025-04-04 21:16:52.863718	
135	21	/uploads/services/construction-projects.jpg	Mechanical, Electrical & Plumbing construction projects by ARCEMUSA	1	2025-04-04 21:16:53.122691	
136	21	/uploads/services/our-passion-led-us-here.jpg	Mechanical, Electrical & Plumbing passion-driven services by ARCEMUSA	2	2025-04-04 21:16:53.381877	
137	22	/uploads/services/construction-projects.jpg	Civil Engineering construction projects by ARCEMUSA	1	2025-04-04 21:16:53.641274	
138	22	/uploads/services/our-passion-led-us-here.jpg	Civil Engineering passion-driven services by ARCEMUSA	2	2025-04-04 21:16:53.900132	
139	23	/uploads/services/construction-projects.jpg	Sustainable Construction construction projects by ARCEMUSA	1	2025-04-04 21:16:54.16017	
140	23	/uploads/services/our-passion-led-us-here.jpg	Sustainable Construction passion-driven services by ARCEMUSA	2	2025-04-04 21:16:54.418696	
141	24	/uploads/services/construction-projects.jpg	Project Consulting construction projects by ARCEMUSA	1	2025-04-04 21:16:54.677399	
142	24	/uploads/services/our-passion-led-us-here.jpg	Project Consulting passion-driven services by ARCEMUSA	2	2025-04-04 21:16:54.936064	
143	25	/uploads/services/construction-projects.jpg	Real Estate Development construction projects by ARCEMUSA	1	2025-04-04 21:16:55.194874	
144	25	/uploads/services/our-passion-led-us-here.jpg	Real Estate Development passion-driven services by ARCEMUSA	2	2025-04-04 21:16:55.455191	
146	14		Gallery image 1	1	2025-04-04 21:41:40.331769	
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, title, description, icon, features) FROM stdin;
15	Design & Engineering	We offer comprehensive design and engineering services that translate your vision into practical, buildable plans while meeting all regulatory requirements.	pencil-ruler	{"Architectural design","Structural engineering","MEP systems design","3D modeling and visualization","Sustainable design solutions","Code compliance review"}
18	Renovation & Remodeling	Transform existing spaces with our renovation and remodeling services, breathing new life into homes and commercial properties.	pencil-ruler	{"Kitchen renovations","Bathroom remodels","Whole-house renovations","Commercial renovations","Historic property restoration","Adaptive reuse"}
21	Mechanical, Electrical & Plumbing	Our comprehensive MEP services ensure that the vital systems running through your building operate efficiently and safely.	tool	{"HVAC systems","Electrical installations","Plumbing systems","Fire protection","Energy-efficient solutions","Smart building technology"}
24	Project Consulting	Our consulting services provide expert advice at any stage of your project, helping you make informed decisions that align with your goals.	hard-hat	{"Pre-construction consulting","Value engineering","Project troubleshooting","Expert witness services","Due diligence for acquisitions","Construction technology consulting"}
23	Sustainable Construction	Build for the future with our sustainable construction services, incorporating eco-friendly practices and materials into your project.	clipboard	{"Green building certification","Energy-efficient design","Renewable energy integration","Sustainable materials","Water conservation solutions","Waste reduction strategies"}
22	Civil Engineering	Our civil engineering services address site development, infrastructure, and environmental considerations for projects of all scales.	hard-hat	{"Site development","Grading and drainage","Utilities installation","Road construction","Environmental compliance","Stormwater management"}
25	Real Estate Development	From site selection to occupancy, our development services navigate the complex process of bringing real estate projects to life.	home	{"Market analysis","Site selection","Entitlement assistance","Investment analysis","Project financing strategies","Development management"}
14	Project Planning	Our project planning services provide a solid foundation for your construction project, ensuring it starts on the right track and stays there.	bar-chart	{"Feasibility studies","Site analysis","Budget planning","Schedule development","Risk assessment","Stakeholder coordination"}
16	Residential Construction	From custom homes to multi-family complexes, our residential construction services deliver exceptional living spaces tailored to your needs.	home	{"Custom home building","Multi-family developments","High-end residential projects","Energy-efficient construction","Interior finishing","Outdoor living spaces"}
17	Commercial Construction	Our commercial construction services create functional, attractive spaces that help businesses thrive while meeting operational requirements and budget constraints.	building	{"Office buildings","Retail spaces",Restaurants,Hotels,"Medical facilities","Tenant improvements"}
19	Construction Management	Our construction management services provide expert oversight throughout the building process, ensuring quality, efficiency, and accountability.	hard-hat	{"Budget management","Schedule oversight","Quality control","Contract administration","Subcontractor coordination","Progress reporting"}
20	Industrial Construction	We design and build industrial facilities that support efficient operations, meet safety standards, and accommodate specialized equipment and workflows.	industry	{"Manufacturing facilities",Warehouses,"Distribution centers","Process facilities","Heavy industrial projects","Specialized infrastructure"}
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
F6dlH4HCuejZncRWNgxCjJ9LCxH7sb5z	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-04-22T08:13:49.826Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-05-05 01:05:28
QoVm6ykcIuj1RntFu9tqjEawcC9REk48	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-05T03:07:04.936Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-05-05 03:57:23
PGrA-_SrKXD-1tMcfbD6LsWwMq31IPQF	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-04T20:11:14.133Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-05-06 10:37:01
n56EbUO6oSI1WumC0tW5nE4McJHYq87h	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-04-18T18:26:20.483Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-05-04 22:26:18
0lLvXdK530a_fbNyXyMyN-Q5Qnu06rl7	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-04-22T07:10:36.166Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-05-07 00:10:04
14BzCs6TwU16gasbLDWIr7DigJhMKDlB	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-04-24T01:58:31.204Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-05-07 00:01:44
fACpW7kI1V3d3Z25kXCCG2zvgb4EiB7_	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-04-22T07:11:17.501Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-04-24 01:39:49
TRPRhjV4dNXM5l_Fu-Z-Xw6jY4OKW9__	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-04-18T05:19:40.981Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-04-19 01:30:42
1_hlhOIRG26FcKS6Ok08689RZLvu--5H	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-04-23T17:22:12.040Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-04-28 06:53:53
\.


--
-- Data for Name: subcontractors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subcontractors (id, company_name, contact_name, email, phone, address, city, state, zip, website, service_types, service_description, years_in_business, insurance, bondable, licenses, "references", how_did_you_hear, status, notes, created_at) FROM stdin;
2	Plaidware Solutions	Nawazuddin F Mohammed-Khaja	kfnawaz@gmail.com	2817451997	3711 Zephyr St	Richmond	Texas	77407	\N	{landscaping,drywall}	Description of Products/Services	3-5	f	f				approved		2025-03-12 06:05:26.584548
1	Plaidware Solutions LLC	Nawazuddin Mohammed Khaja	solutions@plaidware.com	2817451997	10907 Giffnock Dr	Richmond	TX	77407	\N	{electrical,roofing}	Description of Products/Services	1-3	f	f				approved		2025-03-12 05:07:21.741526
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, name, designation, qualification, gender, photo, bio, "order", active, "createdAt", "updatedAt") FROM stdin;
10	Shezad M. Saleem	On-Site PMO, Compliance Supervisory	B.CA	male			6	t	2025-03-26 17:53:46.283014+00	2025-03-26 18:27:35.595+00
4	M. Shehryar	Architect & Interior Designer	B.Arch	male	/uploads/images/team/placeholder-person.jpg		5	t	2025-03-14 05:13:02.092354+00	2025-03-26 18:30:27.212+00
11	Zayne Mughal	Head - Accounts & Procurement	M.Com (Acc. & Finance)	male			4	t	2025-03-26 18:04:35.057972+00	2025-03-26 18:30:40.431+00
1	Aamir (AJ) Qadri	President, CEO	CDCM, CQM-C	male	/uploads/images/team/placeholder-person.jpg		1	t	2025-03-14 05:13:02.092354+00	2025-03-26 18:26:17.587+00
2	Nadia Khalid	V. President, CFO	MBA. (HRM & Marketing)	female	/uploads/images/team/placeholder-person.jpg		2	t	2025-03-14 05:13:02.092354+00	2025-03-26 18:26:20.976+00
3	Ahmad Mujtaba (AK)	Head - Administration  & Project Management.	BBA. (Business & Finance)	male	/uploads/images/team/placeholder-person.jpg		3	t	2025-03-14 05:13:02.092354+00	2025-03-26 18:26:38.734+00
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, name, "position", company, content, rating, image, approved, email, created_at) FROM stdin;
4	John Doe	CEO	ABC Corp	This construction company did an amazing job on our office building. Highly recommended!	5	\N	t	john@example.com	2025-03-08 04:02:05.400684
1	Michael Johnson	CEO	Johnson Enterprises	ARCEMUSA exceeded all our expectations with our commercial building project. Their attention to detail, transparent communication, and exceptional craftsmanship made the entire process smooth and stress-free. The project was completed on time and within budget.	5	https://randomuser.me/api/portraits/men/32.jpg	t	\N	2025-03-08 04:01:39.813874
2	Sarah Thompson	Homeowner		Working with ARCEMUSA on our custom home was a fantastic experience. They truly listened to our vision and brought it to life with exceptional craftsmanship. Their team was professional, responsive, and dedicated to quality at every step.	5	https://randomuser.me/api/portraits/women/44.jpg	t	\N	2025-03-08 04:01:39.813874
3	David Wilson	Owner	Wilson Retail Group	We hired ARCEMUSA for our retail space renovation, and the results were outstanding. Their innovative design solutions maximized our space and created an inviting environment for our customers. The team's expertise and professionalism were evident throughout the project.	5	https://randomuser.me/api/portraits/men/55.jpg	t	\N	2025-03-08 04:01:39.813874
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, role, email) FROM stdin;
1	admin	9312456372a68c29d12afea20db545ee1b72148c0cf0a9968bbdf2dc22e759b8b2f1720833265eda46b391286d3819d6cbd2d191a4a59e5008cd538ca94ad08d.efc8d40608db10550174c1fd52265e63	admin	\N
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendors (id, company_name, contact_name, email, phone, address, city, state, zip, website, supply_types, service_description, years_in_business, "references", how_did_you_hear, status, notes, created_at) FROM stdin;
2	Plaidware Solutions	AFSHAN NOUSHEEN	nousheenfa@gmail.com	2812031626	10907 Giffnock Dr	Richmond	TX	77407	\N	{flooring,concrete}	Description of Products/Services	1-3			pending	\N	2025-03-12 05:33:45.52608
3	Plaidware Solutions	AFSHAN NOUSHEEN	nousheenfa@gmail.com	2812031626	10907 Giffnock Dr	Richmond	TX	77407	\N	{flooring,concrete}	Description of Products/Services	1-3			pending	\N	2025-03-12 05:34:29.126248
4	Plaidware Solutions	AFSHAN NOUSHEEN	nousheenfa@gmail.com	2812031626	10907 Giffnock Dr	Richmond	TX	77407	\N	{flooring,concrete}	Description of Products/Services	1-3			pending	\N	2025-03-12 05:38:54.978151
5	Plaidware Solutions	AFSHAN NOUSHEEN	nousheenfa@gmail.com	2812031626	10907 Giffnock Dr	Richmond	TX	77407	\N	{electrical}	Description of Products/Services	5-10			pending	\N	2025-03-12 05:49:45.925175
6	Personal	Nawazuddin F Mohammed-Khaja	kfnawaz@gmail.com	2817451997	10907 Giffnock Dr	Richmond	Texas	77407	\N	{other,concrete}	Description of Products/Services	5-10			pending	\N	2025-03-12 06:03:55.305266
7	Personal	Nawazuddin F Mohammed-Khaja	kfnawaz@gmail.com	2817451997	10907 Giffnock Dr	Richmond	Texas	77407	\N	{paint}	Description of Products/Services	3-5			pending	\N	2025-03-12 06:15:51.250151
8	Plaidware Solutions LLC	Nawazuddin Mohammed Khaja	solutions@plaidware.com	2817451997	10907 Giffnock Dr	Richmond	TX	77407	https://www.plaidware.com	{"Tools & Equipment","Windows & Doors","Flooring Materials",Insulation,"Roofing Materials"}	this was the output from my designer for one of my past building construction projects...	5-10 years			pending	\N	2025-03-12 07:44:41.47044
1	Test Company	Test Contact	test@example.com	1234567890	123 Test St	Test City	TS	12345	\N	{building-materials}	Test description	1-3	\N	\N	approved		2025-03-12 05:11:46.560932
\.


--
-- Name: blog_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_categories_id_seq', 6, false);


--
-- Name: blog_gallery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_gallery_id_seq', 4, true);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 4, true);


--
-- Name: blog_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_tags_id_seq', 11, false);


--
-- Name: job_postings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_postings_id_seq', 9, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 2, false);


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.newsletter_subscribers_id_seq', 3, false);


--
-- Name: project_gallery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_gallery_id_seq', 299, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 48, false);


--
-- Name: quote_request_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quote_request_attachments_id_seq', 3, false);


--
-- Name: quote_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quote_requests_id_seq', 8, false);


--
-- Name: service_gallery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_gallery_id_seq', 147, false);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.services_id_seq', 26, false);


--
-- Name: subcontractors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subcontractors_id_seq', 3, false);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.team_members_id_seq', 12, false);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 5, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 2, false);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vendors_id_seq', 9, false);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- Name: blog_gallery blog_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_gallery
    ADD CONSTRAINT blog_gallery_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_unique UNIQUE (slug);


--
-- Name: blog_tags blog_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_tags
    ADD CONSTRAINT blog_tags_pkey PRIMARY KEY (id);


--
-- Name: job_postings job_postings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT job_postings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: project_gallery project_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_gallery
    ADD CONSTRAINT project_gallery_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: quote_request_attachments quote_request_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_request_attachments
    ADD CONSTRAINT quote_request_attachments_pkey PRIMARY KEY (id);


--
-- Name: quote_requests quote_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_requests
    ADD CONSTRAINT quote_requests_pkey PRIMARY KEY (id);


--
-- Name: service_gallery service_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_gallery
    ADD CONSTRAINT service_gallery_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: subcontractors subcontractors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractors
    ADD CONSTRAINT subcontractors_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: quote_request_attachments quote_request_attachments_quote_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_request_attachments
    ADD CONSTRAINT quote_request_attachments_quote_request_id_fkey FOREIGN KEY (quote_request_id) REFERENCES public.quote_requests(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

