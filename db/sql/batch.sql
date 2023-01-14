CREATE TABLE IF NOT EXISTS batch (
  batch_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  batch_uuid BINARY (16) NOT NULL UNIQUE,
  -- recipe_id BINARY (16) NOT NULL UNIQUE,
  -- CONSTRAINT fk_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id),
  brewhouse_uuid BINARY (16) NOT NULL UNIQUE,
  CONSTRAINT fk_brewhouse_uuid FOREIGN KEY (brewhouse_uuid) REFERENCES brewhouse(brewhouse_uuid),
  status ENUM ("planning", "brewing", "fermenting", "completed") DEFAULT "planning",
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_brewed TIMESTAMP NULL DEFAULT NULL,
  date_packaged TIMESTAMP NULL DEFAULT NULL,
  notes TEXT,
  actual_og DECIMAL (4, 3),
  actual_fg DECIMAL (4, 3),
  ambient_temp DECIMAL (5, 2) -- degrees Celcius
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
