CREATE TABLE IF NOT EXISTS recipe (
  recipe_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  recipe_id BINARY (16) NOT NULL,
  brewery_id BINARY (16) NOT NULL UNIQUE,
  CONSTRAINT fk_brewery_id FOREIGN KEY (brewery_id) REFERENCES brewery (brewery_id),
  name VARCHAR (100),
  batch_size DECIMAL (8, 2),
  target_og DECIMAL (4, 3),
  target_fg DECIMAL (4, 3),
  boil_time INT,
  fermentation_temp DECIMAL (5, 2),
  strike_water_vol DECIMAL (8, 2),
  strike_water_temp DECIMAL (5, 2),
  preboil_volume DECIMAL (8, 2),
  preboil_sg DECIMAL (4, 3),
  is_private BOOLEAN DEFAULT 1,
  is_draft BOOLEAN DEFAULT 1
);

DROP TRIGGER IF EXISTS before_insert_on_recipe;

CREATE TRIGGER before_insert_on_recipe
  BEFORE INSERT ON recipe
  FOR EACH ROW
  BEGIN
    IF (NEW.recipe_id IS NULL) THEN
      SET NEW.recipe_id = UUID_TO_BIN(UUID());
    END IF;
  END;