CREATE TABLE IF NOT EXISTS recipe (
  recipe_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  recipe_id BINARY (16) NOT NULL,
  brewery_id BINARY (16) NOT NULL UNIQUE,
  CONSTRAINT fk_brewery_id FOREIGN KEY (brewery_id) REFERENCES brewery (brewery_id),
  name VARCHAR (100) NOT NULL,
  UNIQUE KEY (brewery_id, name),
  batch_size DECIMAL (10, 4), -- liters
  target_og DECIMAL (4, 3), -- specific gravity (SG)
  target_fg DECIMAL (4, 3), -- specific gravity (SG)
  boil_time INT, -- minutes
  fermentation_temp DECIMAL (5, 2), -- degrees Celcius
  strike_water_vol DECIMAL (10, 4), -- liters
  strike_water_temp DECIMAL (5, 2), -- degrees Celcius
  preboil_volume DECIMAL (10, 4), -- liters
  preboil_sg DECIMAL (4, 3), -- specific gravity (SG)
  is_private BOOLEAN DEFAULT 1,
  is_draft BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE recipe ADD INDEX (recipe_id);

DROP TRIGGER IF EXISTS before_insert_on_recipe;

CREATE TRIGGER before_insert_on_recipe
  BEFORE INSERT ON recipe
  FOR EACH ROW
  BEGIN
    IF (NEW.recipe_id IS NULL) THEN
      SET NEW.recipe_id = UUID_TO_BIN(UUID());
    END IF;
  END;