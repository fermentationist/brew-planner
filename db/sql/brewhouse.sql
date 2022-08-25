CREATE TABLE IF NOT EXISTS brewhouse (
  brewhouse_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  brewhouse_id BINARY (16) NOT NULL UNIQUE,
  brewery_id BINARY (16) NOT NULL UNIQUE,
  CONSTRAINT fk_brewhouse_brewery_id FOREIGN KEY (brewery_id) REFERENCES brewery (brewery_id),
  mash_tun_vol DECIMAL (8, 2),
  mash_tun_loss DECIMAL (8, 2),
  kettle_vol DECIMAL (8, 2),
  kettle_loss DECIMAL (8, 2),
  misc_loss DECIMAL (8, 2),
  evaporation_rate DECIMAL (8, 2),
  extract_efficiency DECIMAL (5, 2),
  grain_absorption_rate DECIMAL (5, 2),
  ambient_temp DECIMAL (5, 2)
);

DROP TRIGGER IF EXISTS before_insert_on_brewhouse;

CREATE TRIGGER before_insert_on_brewhouse 
  BEFORE INSERT ON brewhouse 
  FOR EACH ROW 
    BEGIN 
      IF (NEW.brewhouse_id IS NULL) THEN
        SET NEW.brewhouse_id = UUID_TO_BIN(UUID());
      END IF;
    END;