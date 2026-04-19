CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE circles (
    circle_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    join_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (join_code)
);

CREATE TABLE memberships (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    circle_id BIGINT NOT NULL REFERENCES circles(circle_id),
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, circle_id)
);

CREATE TABLE profiles (
    profile_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    circle_id BIGINT NOT NULL REFERENCES circles(circle_id),
    hobby VARCHAR(500),
    comment VARCHAR(1000),
    UNIQUE (user_id, circle_id)
);

CREATE TABLE locations (
    location_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    circle_id BIGINT NOT NULL REFERENCES circles(circle_id),
    display_latitude DECIMAL(10, 7) NOT NULL,
    display_longitude DECIMAL(10, 7) NOT NULL,
    UNIQUE (user_id, circle_id)
);
