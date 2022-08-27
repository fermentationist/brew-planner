CREATE TABLE IF NOT EXISTS misc (
  misc_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  misc_id BINARY (16) NOT NULL,
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  UNIQUE KEY (misc_id), -- there can be only one version per misc_id
  name VARCHAR (100) NOT NULL,
  type ENUM ("Spice", "Fining", "Water Agent", "Herb", "Flavor", "Other") NOT NULL,
  use_for TEXT, -- recommended use
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE misc ADD INDEX (misc_id);

CREATE TABLE IF NOT EXISTS misc_version (
  misc_version_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  misc_id BINARY (16) NOT NULL,
  CONSTRAINT fk_misc_version_misc_id FOREIGN KEY (misc_id) REFERENCES misc (misc_id), -- reference to current version
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL,
  UNIQUE KEY (misc_id, version),
  name VARCHAR (100) NOT NULL,
  type ENUM ("Spice", "Fining", "Water Agent", "Herb", "Flavor", "Other") NOT NULL,
  use_for TEXT, -- recommended use
  notes TEXT,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_misc (
  misc_id BINARY (16) NOT NULL,
  version INT NOT NULL,
  recipe_id BINARY (16) NOT NULL,
  CONSTRAINT fk_misc_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id),
  `use` ENUM ("Boil", "Mash", "Primary", "Secondary", "Bottling") NOT NULL,
  UNIQUE KEY (misc_id, version, recipe_id, `use`),
  time INT NOT NULL, -- minutes
  volume DECIMAL (10, 6), -- volume in liters
  weight DECIMAL (10, 6), -- weight in kilograms
  CONSTRAINT misc_weight_or_volume CHECK (volume IS NOT NULL OR weight IS NOT NULL),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS misc_view;

CREATE VIEW misc_view AS
SELECT * FROM misc 
UNION 
SELECT * FROM misc_version; 

DROP TRIGGER IF EXISTS before_insert_on_misc;
DROP TRIGGER IF EXISTS before_insert_on_recipe_misc;
DROP TRIGGER IF EXISTS before_update_on_misc;

CREATE TRIGGER before_insert_on_misc
  BEFORE INSERT ON misc
  FOR EACH ROW
  BEGIN
    IF (NEW.misc_id IS NULL) THEN
      SET NEW.misc_id = UUID_TO_BIN(UUID());
    END IF;
  END;

-- This trigger exists in place of FK constraint (because you can't have FK constraint referring to a VIEW). Ensures that the entered id and version match an existing record
CREATE TRIGGER before_insert_on_recipe_misc
  BEFORE INSERT ON recipe_misc
  FOR EACH ROW
  BEGIN
    DECLARE id_count INT;
    SELECT COUNT(*) INTO id_count FROM misc_view
    WHERE misc_id = NEW.misc_id AND version = NEW.version;
    IF (id_count < 1) THEN
      SIGNAL SQLSTATE "45000"
        SET MESSAGE_TEXT = "Invalid id and/or version";
    END IF;
  END;

CREATE TRIGGER before_update_on_misc
  BEFORE UPDATE ON misc
  FOR EACH ROW
  BEGIN
    INSERT INTO misc_version (
      misc_id,
      created_by,
      version,
      name,
      type,
      use_for,
      notes,
      created_at
    )
    VALUES (
      OLD.misc_id,
      OLD.created_by,
      OLD.version,
      OLD.name,
      OLD.type,
      OLD.use_for,
      OLD.notes,
      OLD.created_at
    );
    SET NEW.version = OLD.version + 1;
  END;
