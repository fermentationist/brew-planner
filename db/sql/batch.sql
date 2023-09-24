CREATE TABLE IF NOT EXISTS batch (
  batch_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  batch_uuid BINARY (16) NOT NULL UNIQUE,
  recipe_uuid BINARY (16) NOT NULL UNIQUE,
  CONSTRAINT fk_batch_recipe_uuid FOREIGN KEY (recipe_uuid) REFERENCES recipe (recipe_uuid),
  brewhouse_uuid BINARY (16),
  CONSTRAINT fk_batch_brewhouse_uuid FOREIGN KEY (brewhouse_uuid) REFERENCES brewhouse(brewhouse_uuid),
  status ENUM ("planning", "brewing", "fermenting", "completed") DEFAULT "planning",
  date_brewed TIMESTAMP NULL DEFAULT NULL,
  date_packaged TIMESTAMP NULL DEFAULT NULL,
  notes TEXT,
  actual_og DECIMAL (4, 3), -- specific gravity (SG)
  actual_fg DECIMAL (4, 3), -- specific gravity (SG)
  actual_efficiency DECIMAL (5, 2), -- percentage
  ambient_temp DECIMAL (5, 2) -- degrees Celcius
  brewer VARCHAR (100),
  asst_brewer VARCHAR (100),
  actual_strike_water_vol DECIMAL (10, 4), -- liters
  actual_strike_water_temp DECIMAL (5, 2), -- degrees Celcius
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

DROP TRIGGER IF EXISTS before_insert_on_batch;

CREATE TRIGGER before_insert_on_batch 
  BEFORE INSERT ON batch 
  FOR EACH ROW 
    BEGIN 
      IF (NEW.batch_uuid IS NULL) THEN
        SET NEW.batch_uuid = UUID_TO_BIN(UUID());
      END IF;
    END;
