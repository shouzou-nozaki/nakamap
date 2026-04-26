ALTER TABLE circles ADD COLUMN stamp_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE encounters (
    encounter_id BIGSERIAL PRIMARY KEY,
    circle_id    BIGINT NOT NULL REFERENCES circles(circle_id),
    scanner_user_id BIGINT NOT NULL REFERENCES users(user_id),
    target_user_id  BIGINT NOT NULL REFERENCES users(user_id),
    met_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_encounters_circle  ON encounters(circle_id);
CREATE INDEX idx_encounters_scanner ON encounters(scanner_user_id, circle_id);
CREATE INDEX idx_encounters_target  ON encounters(target_user_id,  circle_id);
