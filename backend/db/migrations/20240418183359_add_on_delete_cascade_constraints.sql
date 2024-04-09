-- migrate:up
ALTER TABLE user_products
DROP CONSTRAINT user_products_user_id_fkey,
ADD CONSTRAINT user_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE user_wishlist_products
DROP CONSTRAINT user_wishlist_products_user_id_fkey,
ADD CONSTRAINT user_wishlist_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE user_favorited_stores
DROP CONSTRAINT user_favorited_stores_user_id_fkey,
ADD CONSTRAINT user_favorited_stores_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE user_favorited_stores
DROP CONSTRAINT user_favorited_stores_store_id_fkey,
ADD CONSTRAINT user_favorited_stores_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores (store_id) ON DELETE CASCADE;

ALTER TABLE user_notification
DROP CONSTRAINT user_notification_user_id_fkey,
ADD CONSTRAINT user_notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE upcoming_products
DROP CONSTRAINT upcoming_products_vmp_id_fkey,
ADD CONSTRAINT upcoming_products_vmp_id_fkey FOREIGN KEY (vmp_id) REFERENCES vinmonopolet_products (vmp_id) ON DELETE CASCADE;

ALTER TABLE untappd_products
DROP CONSTRAINT untappd_products_vmp_id_fkey,
ADD CONSTRAINT untappd_products_vmp_id_fkey FOREIGN KEY (vmp_id) REFERENCES vinmonopolet_products (vmp_id) ON DELETE CASCADE;

ALTER TABLE stock
DROP CONSTRAINT stock_store_id_fkey,
ADD CONSTRAINT stock_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores (store_id) ON DELETE CASCADE;

ALTER TABLE stock
DROP CONSTRAINT stock_vmp_id_fkey,
ADD CONSTRAINT stock_vmp_id_fkey FOREIGN KEY (vmp_id) REFERENCES vinmonopolet_products (vmp_id) ON DELETE CASCADE;

-- migrate:down
ALTER TABLE user_products
DROP CONSTRAINT user_products_user_id_fkey,
ADD CONSTRAINT user_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE user_wishlist_products
DROP CONSTRAINT user_wishlist_products_user_id_fkey,
ADD CONSTRAINT user_wishlist_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE user_favorited_stores
DROP CONSTRAINT user_favorited_stores_user_id_fkey,
ADD CONSTRAINT user_favorited_stores_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE user_favorited_stores
DROP CONSTRAINT user_favorited_stores_store_id_fkey,
ADD CONSTRAINT user_favorited_stores_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores (store_id);

ALTER TABLE user_notification
DROP CONSTRAINT user_notification_user_id_fkey,
ADD CONSTRAINT user_notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE upcoming_products
DROP CONSTRAINT upcoming_product_vmp_id_fkey,
ADD CONSTRAINT upcoming_product_vmp_id_fkey FOREIGN KEY (vmp_id) REFERENCES vinmonopolet_products (vmp_id);

ALTER TABLE untappd_products
DROP CONSTRAINT untappd_products_vmp_id_fkey,
ADD CONSTRAINT untappd_products_vmp_id_fkey FOREIGN KEY (vmp_id) REFERENCES vinmonopolet_products (vmp_id);

ALTER TABLE stock
DROP CONSTRAINT stock_store_id_fkey,
ADD CONSTRAINT stock_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores (store_id);

ALTER TABLE stock
DROP CONSTRAINT stock_vmp_id_fkey,
ADD CONSTRAINT stock_vmp_id_fkey FOREIGN KEY (vmp_id) REFERENCES vinmonopolet_products (vmp_id);