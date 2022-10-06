CREATE TABLE IF NOT EXISTS style (
  style_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  style_id BINARY (16) NOT NULL UNIQUE,
  created_by VARCHAR(36) NOT NULL,
  UNIQUE KEY (style_id),
  name VARCHAR (100),
  category VARCHAR (100),
  category_number VARCHAR (4),
  style_letter VARCHAR (4),
  style_guide VARCHAR (20),
  type ENUM ("Lager", "Ale", "Wheat", "Mead", "Mixed", "Cider"),
  og_min DECIMAL (4, 3), -- specific gravity (SG)
  og_max DECIMAL (4, 3), -- specific gravity (SG)
  fg_min DECIMAL (4, 3), -- specific gravity (SG)
  fg_max DECIMAL (4, 3), -- specific gravity (SG)
  ibu_min DECIMAL (5, 2), -- IBU
  ibu_max DECIMAL (5, 2), -- IBU
  color_min DECIMAL (5, 2), -- SRM
  color_max DECIMAL (5, 2), -- SRM
  carb_min DECIMAL (5, 2), -- Volumes CO2
  carb_max DECIMAL (5, 2), -- Volumes CO2
  abv_min DECIMAL (5, 2), -- Percentage, ABV
  abv_max DECIMAL (5, 2), -- Percentage, ABV
  notes TEXT,
  profile TEXT, -- flavor and aroma profile
  ingredients TEXT, -- suggested ingredients for the style
  examples TEXT -- commercial examples
);

ALTER TABLE style ADD INDEX (style_id);

CREATE TABLE IF NOT EXISTS recipe_style (
  style_id BINARY (16) NOT NULL UNIQUE,
  recipe_id BINARY (16) NOT NULL,
  CONSTRAINT fk_style_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id),
  UNIQUE KEY (style_id, recipe_id)
);

DROP TRIGGER IF EXISTS before_insert_on_style;

CREATE TRIGGER before_insert_on_style
  BEFORE INSERT ON style
  FOR EACH ROW
  BEGIN
    IF (NEW.style_id IS NULL) THEN
      SET NEW.style_id = UUID_TO_BIN(UUID());
    END IF;
  END;