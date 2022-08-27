CREATE TABLE IF NOT EXISTS brewhouse (
  brewhouse_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  brewhouse_id BINARY (16) NOT NULL UNIQUE,
  brewery_id BINARY (16) NOT NULL UNIQUE,
  CONSTRAINT fk_brewhouse_brewery_id FOREIGN KEY (brewery_id) REFERENCES brewery (brewery_id),
  mash_tun_vol DECIMAL (10, 3), -- liters
  mash_tun_loss DECIMAL (10, 3),  -- liters
  kettle_vol DECIMAL (10, 3),  -- liters
  kettle_loss DECIMAL (10, 3),  -- liters
  misc_loss DECIMAL (10, 3),  -- liters
  evaporation_rate DECIMAL (10, 3), -- liters/hour
  extract_efficiency DECIMAL (5, 2), -- this decimal represents a whole number percentage, i.e. the value 75 represents an efficiency of 75%, or 0.75
  grain_absorption_rate DECIMAL (5, 2), -- liters/kilogram
  ambient_temp DECIMAL (5, 2) -- degrees Celcius
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