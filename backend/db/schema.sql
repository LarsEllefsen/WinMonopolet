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

--
-- Name: set_stock_modified_date(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_stock_modified_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_updated := current_timestamp;
    RETURN NEW;
END;
$$;


--
-- Name: set_untappd_product_modified_date(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_untappd_product_modified_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_updated := current_timestamp;
    RETURN NEW;
END;
$$;


--
-- Name: set_user_modified_date(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_user_modified_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated := current_timestamp;
    RETURN NEW;
END;
$$;


--
-- Name: set_vinmonopolet_product_modified_date(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_vinmonopolet_product_modified_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_updated := current_timestamp;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock (
    store_id text NOT NULL,
    vmp_id text NOT NULL,
    stock_level integer NOT NULL,
    last_updated timestamp with time zone
);


--
-- Name: stores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stores (
    store_id text NOT NULL,
    name text NOT NULL,
    formatted_name text NOT NULL,
    address text NOT NULL,
    city text,
    zip text,
    lon text NOT NULL,
    lat text NOT NULL
);


--
-- Name: untappd_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.untappd_products (
    untappd_id text NOT NULL,
    vmp_id text NOT NULL,
    untappd_name text NOT NULL,
    abv real NOT NULL,
    rating real NOT NULL,
    num_ratings integer NOT NULL,
    untappd_url text NOT NULL,
    picture_url text,
    style text NOT NULL,
    brewery text NOT NULL,
    last_updated timestamp with time zone NOT NULL
);


--
-- Name: upcoming_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upcoming_products (
    vmp_id text NOT NULL,
    release_date date NOT NULL
);


--
-- Name: user_favorited_stores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favorited_stores (
    user_id text NOT NULL,
    store_id text NOT NULL
);


--
-- Name: user_notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notification (
    user_id text NOT NULL,
    email text NOT NULL,
    notification_type text NOT NULL
);


--
-- Name: user_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_products (
    user_id text NOT NULL,
    untappd_id text NOT NULL,
    user_score real NOT NULL
);


--
-- Name: user_wishlist_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_wishlist_products (
    user_id text NOT NULL,
    untappd_id text NOT NULL,
    added timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    user_name text NOT NULL,
    user_avatar text NOT NULL,
    user_avatar_hd text,
    first_name text,
    access_token text NOT NULL,
    salt text NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone NOT NULL
);


--
-- Name: vinmonopolet_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vinmonopolet_products (
    vmp_id text NOT NULL,
    vmp_name text NOT NULL,
    vmp_url text NOT NULL,
    price real NOT NULL,
    category text NOT NULL,
    sub_category text,
    product_selection text NOT NULL,
    container_size text NOT NULL,
    country text NOT NULL,
    added_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp with time zone NOT NULL,
    buyable boolean DEFAULT true NOT NULL
);


--
-- Name: wordlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wordlist (
    id integer NOT NULL,
    value text NOT NULL
);


--
-- Name: wordlist_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wordlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wordlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wordlist_id_seq OWNED BY public.wordlist.id;


--
-- Name: wordlist id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wordlist ALTER COLUMN id SET DEFAULT nextval('public.wordlist_id_seq'::regclass);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (store_id, vmp_id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (store_id);


--
-- Name: untappd_products untappd_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.untappd_products
    ADD CONSTRAINT untappd_products_pkey PRIMARY KEY (vmp_id);


--
-- Name: upcoming_products upcoming_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upcoming_products
    ADD CONSTRAINT upcoming_products_pkey PRIMARY KEY (vmp_id);


--
-- Name: user_favorited_stores user_favorited_stores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorited_stores
    ADD CONSTRAINT user_favorited_stores_pkey PRIMARY KEY (user_id, store_id);


--
-- Name: user_notification user_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification
    ADD CONSTRAINT user_notification_pkey PRIMARY KEY (user_id);


--
-- Name: user_products user_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_products
    ADD CONSTRAINT user_products_pkey PRIMARY KEY (user_id, untappd_id);


--
-- Name: user_wishlist_products user_wishlist_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_wishlist_products
    ADD CONSTRAINT user_wishlist_products_pkey PRIMARY KEY (user_id, untappd_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vinmonopolet_products vinmonopolet_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vinmonopolet_products
    ADD CONSTRAINT vinmonopolet_products_pkey PRIMARY KEY (vmp_id);


--
-- Name: wordlist wordlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wordlist
    ADD CONSTRAINT wordlist_pkey PRIMARY KEY (id);


--
-- Name: stock stock_modified; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER stock_modified BEFORE INSERT OR UPDATE ON public.stock FOR EACH ROW EXECUTE FUNCTION public.set_stock_modified_date();


--
-- Name: untappd_products untappd_product_modified; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER untappd_product_modified BEFORE INSERT OR UPDATE ON public.untappd_products FOR EACH ROW EXECUTE FUNCTION public.set_untappd_product_modified_date();


--
-- Name: users user_modified; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_modified BEFORE INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_user_modified_date();


--
-- Name: vinmonopolet_products vinmonopolet_product_modified; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER vinmonopolet_product_modified BEFORE INSERT OR UPDATE ON public.vinmonopolet_products FOR EACH ROW EXECUTE FUNCTION public.set_vinmonopolet_product_modified_date();


--
-- Name: stock stock_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id) ON DELETE CASCADE;


--
-- Name: stock stock_vmp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_vmp_id_fkey FOREIGN KEY (vmp_id) REFERENCES public.vinmonopolet_products(vmp_id) ON DELETE CASCADE;


--
-- Name: untappd_products untappd_products_vmp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.untappd_products
    ADD CONSTRAINT untappd_products_vmp_id_fkey FOREIGN KEY (vmp_id) REFERENCES public.vinmonopolet_products(vmp_id) ON DELETE CASCADE;


--
-- Name: upcoming_products upcoming_products_vmp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upcoming_products
    ADD CONSTRAINT upcoming_products_vmp_id_fkey FOREIGN KEY (vmp_id) REFERENCES public.vinmonopolet_products(vmp_id) ON DELETE CASCADE;


--
-- Name: user_favorited_stores user_favorited_stores_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorited_stores
    ADD CONSTRAINT user_favorited_stores_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id) ON DELETE CASCADE;


--
-- Name: user_favorited_stores user_favorited_stores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorited_stores
    ADD CONSTRAINT user_favorited_stores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_notification user_notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification
    ADD CONSTRAINT user_notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_products user_products_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_products
    ADD CONSTRAINT user_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_wishlist_products user_wishlist_products_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_wishlist_products
    ADD CONSTRAINT user_wishlist_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20240407142534'),
    ('20240407143109'),
    ('20240407145929'),
    ('20240407153136'),
    ('20240416181416'),
    ('20240416181501'),
    ('20240418182449'),
    ('20240418182644'),
    ('20240418182752'),
    ('20240418182955'),
    ('20240418183052'),
    ('20240418183359'),
    ('20240502211931'),
    ('20240616122035'),
    ('20240616122155');
