CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  display_name VARCHAR(80) NOT NULL,
  handle VARCHAR(40) NOT NULL,
  avatar_url VARCHAR(500) NOT NULL,
  avatar_blurhash VARCHAR(64) NOT NULL,
  is_developer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_handle (handle)
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  session_token VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_token (session_token),
  INDEX idx_sessions_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS countries (
  code CHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS cities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  country_code CHAR(2) NOT NULL,
  name VARCHAR(100) NOT NULL,
  lat DECIMAL(9, 6) NOT NULL,
  lng DECIMAL(9, 6) NOT NULL,
  UNIQUE KEY uq_cities_country_name (country_code, name),
  CONSTRAINT fk_cities_country FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(40) NOT NULL,
  label VARCHAR(60) NOT NULL,
  icon_name VARCHAR(60) NOT NULL,
  UNIQUE KEY uq_categories_slug (slug)
);

CREATE TABLE IF NOT EXISTS places (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  city_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  description VARCHAR(500) NOT NULL,
  lat DECIMAL(9, 6) NOT NULL,
  lng DECIMAL(9, 6) NOT NULL,
  geohash VARCHAR(12) NOT NULL,
  maps_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_places_slug (slug),
  INDEX idx_places_city_category (city_id, category_id),
  INDEX idx_places_geohash (geohash),
  FULLTEXT INDEX ftx_places_name (name),
  CONSTRAINT fk_places_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  CONSTRAINT fk_places_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT chk_places_lat CHECK (lat BETWEEN -90 AND 90),
  CONSTRAINT chk_places_lng CHECK (lng BETWEEN -180 AND 180)
);

CREATE TABLE IF NOT EXISTS location_of_the_day (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  place_id BIGINT UNSIGNED NOT NULL,
  featured_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lotd_featured_date (featured_date),
  INDEX idx_lotd_place (place_id),
  CONSTRAINT fk_lotd_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS place_photos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  place_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  blurhash VARCHAR(64) NOT NULL,
  width INT UNSIGNED NOT NULL,
  height INT UNSIGNED NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_place_photos_place (place_id, sort_order),
  CONSTRAINT fk_place_photos_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  CONSTRAINT chk_place_photos_dims CHECK (width > 0 AND height > 0)
);

CREATE TABLE IF NOT EXISTS visits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  place_id BIGINT UNSIGNED NOT NULL,
  source ENUM('lotd_quick_add', 'gps', 'search', 'explore', 'list') NOT NULL,
  idempotency_key VARCHAR(64) NOT NULL,
  visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_visits_user_place (user_id, place_id),
  UNIQUE KEY uq_visits_idempotency (user_id, idempotency_key),
  INDEX idx_visits_user_time (user_id, visited_at),
  CONSTRAINT fk_visits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_visits_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
);

CREATE OR REPLACE VIEW v_place_details AS
SELECT
  p.id,
  p.slug,
  p.name,
  p.description,
  CAST(p.lat AS DOUBLE) AS lat,
  CAST(p.lng AS DOUBLE) AS lng,
  p.geohash,
  p.maps_url,
  lotd.featured_date,
  c.id AS city_id,
  c.name AS city_name,
  co.code AS country_code,
  co.name AS country_name,
  cat.id AS category_id,
  cat.slug AS category_slug,
  cat.label AS category_label,
  cat.icon_name AS category_icon
FROM places p
JOIN cities c ON c.id = p.city_id
JOIN countries co ON co.code = c.country_code
JOIN categories cat ON cat.id = p.category_id
LEFT JOIN location_of_the_day lotd ON lotd.place_id = p.id;
