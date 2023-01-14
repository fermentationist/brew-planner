CREATE TABLE IF NOT EXISTS misc (
  misc_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  misc_uuid BINARY (16) NOT NULL UNIQUE,
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  UNIQUE KEY (misc_uuid), -- there can be only one version per misc_id
  name VARCHAR (100) NOT NULL,
  type ENUM ("Spice", "Fining", "Water Agent", "Herb", "Flavor", "Other") NOT NULL,
  use_for TEXT, -- recommended use
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE misc ADD INDEX (misc_uuid);

CREATE TABLE IF NOT EXISTS misc_version (
  misc_version_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  misc_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_misc_version_misc_uuid FOREIGN KEY (misc_uuid) REFERENCES misc (misc_uuid), -- reference to current version
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL,
  UNIQUE KEY (misc_uuid, version),
  name VARCHAR (100) NOT NULL,
  type ENUM ("Spice", "Fining", "Water Agent", "Herb", "Flavor", "Other") NOT NULL,
  use_for TEXT, -- recommended use
  notes TEXT,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_misc (
  misc_uuid BINARY (16) NOT NULL,
  version INT NOT NULL,
  recipe_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_misc_recipe_uuid FOREIGN KEY (recipe_uuid) REFERENCES recipe(recipe_uuid),
  `use` ENUM ("Boil", "Mash", "Primary", "Secondary", "Bottling") NOT NULL,
  UNIQUE KEY (misc_uuid, version, recipe_uuid, `use`),
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
    IF (NEW.misc_uuid IS NULL) THEN
      SET NEW.misc_uuid = UUID_TO_BIN(UUID());
    END IF;
  END;

-- This trigger exists in place of FK constraint (because you can't have FK constraint referring to a VIEW). Ensures that the entered id and version match an existing record
CREATE TRIGGER before_insert_on_recipe_misc
  BEFORE INSERT ON recipe_misc
  FOR EACH ROW
  BEGIN
    DECLARE id_count INT;
    SELECT COUNT(*) INTO id_count FROM misc_view
    WHERE misc_uuid = NEW.misc_uuid AND version = NEW.version;
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
      misc_uuid,
      created_by,
      version,
      name,
      type,
      use_for,
      notes,
      created_at
    )
    VALUES (
      OLD.misc_uuid,
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
