CREATE TABLE IF NOT EXISTS fermentable (
  fermentable_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  fermentable_uuid BINARY (16) NOT NULL UNIQUE,
  created_by VARCHAR (36) NOT NULL,
  brewery_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_fermentable_brewery_uuid FOREIGN KEY (brewery_uuid) REFERENCES brewery (brewery_uuid) ON DELETE CASCADE,
  name VARCHAR (100) NOT NULL,
  UNIQUE KEY (brewery_uuid, name),
  version INT NOT NULL DEFAULT 1,
  type ENUM ("Grain", "Sugar", "Extract", "Dry Extract", "Adjunct"),
  yield DECIMAL (5, 2) NOT NULL, -- this decimal represents a whole number percentage, i.e. the value 33.33 represents a yield of 33.33%, or 0.3333
  color DECIMAL (6, 2) NOT NULL, --  the color contribution of the fermentable, measured in degrees Lovibond (SRM)
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

ALTER TABLE fermentable ADD INDEX (fermentable_uuid);

CREATE TABLE IF NOT EXISTS fermentable_version (
  fermentable_version_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  fermentable_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_fermentable_version_fermentable_uuid FOREIGN KEY (fermentable_uuid) REFERENCES fermentable (fermentable_uuid) ON DELETE CASCADE,
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL,
  brewery_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_fermentable_version_brewery_uuid FOREIGN KEY (brewery_uuid) REFERENCES brewery (brewery_uuid) ON DELETE CASCADE,
  UNIQUE KEY (fermentable_uuid, version),
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
  fermentable_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_recipe_fermentable_fermentable_uuid FOREIGN KEY (fermentable_uuid) REFERENCES fermentable(fermentable_uuid),
  version INT NOT NULL,
  recipe_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_recipe_fermentable_recipe_uuid FOREIGN KEY (recipe_uuid) REFERENCES recipe(recipe_uuid),
  UNIQUE KEY (fermentable_uuid, version, recipe_uuid),
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
    IF (NEW.fermentable_uuid IS NULL) THEN
      SET NEW.fermentable_uuid = UUID_TO_BIN(UUID());
    END IF;
  END;

-- This trigger exists in place of FK constraint (because you can't have FK constraint referring to a VIEW). Ensures that the entered id and version match an existing record
CREATE TRIGGER before_insert_on_recipe_fermentable
  BEFORE INSERT ON recipe_fermentable
  FOR EACH ROW
  BEGIN
    DECLARE id_count INT;
    SELECT COUNT(*) INTO id_count FROM fermentable_view
    WHERE fermentable_uuid = NEW.fermentable_uuid AND version = NEW.version;
    IF (id_count < 1) THEN
      SIGNAL SQLSTATE "45000"
        SET MESSAGE_TEXT = "Invalid id and/or version";
    END IF;
  END;

CREATE TRIGGER before_update_on_fermentable
  BEFORE UPDATE ON fermentable
  FOR EACH ROW
  BEGIN
    SET NEW.version = OLD.version + 1;
    INSERT INTO fermentable_version (
      brewery_uuid,
      fermentable_uuid,
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
      OLD.brewery_uuid,
      OLD.fermentable_uuid,
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
  END;
