CREATE TABLE IF NOT EXISTS fermentable (
  fermentable_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  fermentable_id BINARY (16) NOT NULL UNIQUE,
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  UNIQUE KEY (fermentable_id), -- there can be only one version per fermentable_id
  name VARCHAR (100) NOT NULL,
  type ENUM ("Grain", "Sugar", "Extract", "Dry Extract", "Adjunct"),
  yield DECIMAL (5, 2) NOT NULL, -- this decimal represents a whole number percentage, i.e. the value 33.33 represents a yield of 33.33%, or 0.3333
  color DECIMAL (6, 2), --  the color contribution of the fermentable, measured in degrees Lovibond (SRM)
  origin VARCHAR (100), -- geographical origin
  supplier VARCHAR (100), -- brand
  coarse_fine_diff DECIMAL (5, 2), -- a percentage, only applicable to "grain" or "adjunct types"
  moisture DECIMAL (5, 2), -- a percentage, only applicable to "grain" or "adjunct types"
  diastatic_power DECIMAL (5, 2), -- in degrees Lintner, only applicable to "grain" or "adjunct types"
  protein DECIMAL (5, 2), -- a percentage, only applicable to "grain" or "adjunct types"
  max_in_batch DECIMAL (5, 2), -- The recommended maximum percentage (by weight) this ingredient should represent in a batch of beer
  recommended_mash BOOLEAN,
  notes TEXT, 
  add_after_boil BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE fermentable ADD INDEX (fermentable_id);

CREATE TABLE IF NOT EXISTS fermentable_version (
  fermentable_version_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  fermentable_id BINARY (16) NOT NULL,
  CONSTRAINT fk_fermentable_version_fermentable_id FOREIGN KEY (fermentable_id) REFERENCES fermentable (fermentable_id),
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL,
  UNIQUE KEY (fermentable_id), -- there can be only one version per fermentable_id
  name VARCHAR (100) NOT NULL,
  type ENUM ("Grain", "Sugar", "Extract", "Dry Extract", "Adjunct"),
  yield DECIMAL (5, 2) NOT NULL, -- this decimal represents a whole number percentage, i.e. the value 33.33 represents a yield of 33.33%, or 0.3333
  color DECIMAL (6, 2), --  the color contribution of the fermentable, measured in degrees Lovibond (SRM)
  origin VARCHAR (100), -- geographical origin
  supplier VARCHAR (100), -- brand
  coarse_fine_diff DECIMAL (5, 2), -- a percentage, only applicable to "grain" or "adjunct types"
  moisture DECIMAL (5, 2), -- a percentage, only applicable to "grain" or "adjunct types"
  diastatic_power DECIMAL (5, 2), -- in degrees Lintner, only applicable to "grain" or "adjunct types"
  protein DECIMAL (5, 2), -- a percentage, only applicable to "grain" or "adjunct types"
  max_in_batch DECIMAL (5, 2), -- The recommended maximum percentage (by weight) this ingredient should represent in a batch of beer
  recommended_mash BOOLEAN,
  notes TEXT, 
  add_after_boil BOOLEAN,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_fermentable (
  fermentable_id BINARY (16) NOT NULL,
  version INT NOT NULL,
  recipe_id BINARY (16) NOT NULL,
  CONSTRAINT fk_fermentable_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id),
  UNIQUE KEY (fermentable_id, version, recipe_id),
  amount DECIMAL (10, 3), -- weight in kilograms
  mash BOOLEAN DEFAULT 1, -- whether or not the fermentable will be mashed
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS fermentable_view;

CREATE VIEW fermentable_view AS
SELECT * FROM fermentable 
UNION 
SELECT * FROM fermentable_version; 

DROP TRIGGER IF EXISTS before_insert_on_fermentable;
DROP TRIGGER IF EXISTS before_insert_on_recipe_fermentable;
DROP TRIGGER IF EXISTS before_update_on_fermentable;

CREATE TRIGGER before_insert_on_fermentable
  BEFORE INSERT ON fermentable
  FOR EACH ROW
  BEGIN
    IF (NEW.fermentable_id IS NULL) THEN
      SET NEW.fermentable_id = UUID_TO_BIN(UUID());
    END IF;
  END;

-- This trigger exists in place of FK constraint (because you can't have FK constraint referring to a VIEW). Ensures that the entered id and version match an existing record
CREATE TRIGGER before_insert_on_recipe_fermentable
  BEFORE INSERT ON recipe_fermentable
  FOR EACH ROW
  BEGIN
    DECLARE id_count INT;
    SELECT COUNT(*) INTO id_count FROM fermentable_view
    WHERE fermentable_id = NEW.fermentable_id AND version = NEW.version;
    IF (id_count < 1) THEN
      SIGNAL SQLSTATE "45000"
        SET MESSAGE_TEXT = "Invalid id and/or version";
    END IF;
  END;

CREATE TRIGGER before_update_on_fermentable
  BEFORE UPDATE ON fermentable
  FOR EACH ROW
  BEGIN
    INSERT INTO fermentable_version (
      fermentable_id,
      created_by,
      version,
      name,
      type,
      yield,
      color,
      origin,
      supplier,
      coarse_fine_diff,
      moisture,
      diastatic_power,
      protein,
      max_in_batch,
      recommended_mash,
      notes,
      add_after_boil,
      created_at
    )
    VALUES (
      OLD.fermentable_id,
      OLD.created_by,
      OLD.version,
      OLD.name,
      OLD.type,
      OLD.yield,
      OLD.color,
      OLD.origin,
      OLD.supplier,
      OLD.coarse_fine_diff,
      OLD.moisture,
      OLD.diastatic_power,
      OLD.protein,
      OLD.max_in_batch,
      OLD.recommended_mash,
      OLD.notes,
      OLD.add_after_boil,
      OLD.created_at
    );
    SET NEW.version = OLD.version + 1;
  END;
