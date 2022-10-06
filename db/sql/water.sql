CREATE TABLE IF NOT EXISTS water (
  water_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  water_id BINARY (16) NOT NULL UNIQUE,
  created_by VARCHAR(36) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  UNIQUE KEY (water_id), -- there can be only one version per water_id
  name VARCHAR (100) NOT NULL,
  calcium DECIMAL (6, 2) DEFAULT 0, -- parts per million
  bicarbonate DECIMAL (6, 2) DEFAULT 0, -- parts per million
  sulfate DECIMAL (6, 2) DEFAULT 0, -- parts per million
  chloride DECIMAL (6, 2) DEFAULT 0, -- parts per million
  sodium DECIMAL (6, 2) DEFAULT 0, -- parts per million
  magnesium DECIMAL (6, 2) DEFAULT 0, -- parts per million
  ph DECIMAL (4, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE water ADD INDEX (water_id);

-- do not insert into this table directly, it is used to store old versions of water profiles, and entries are created by trigger when the water table is updated
CREATE TABLE IF NOT EXISTS water_version (
  water_version_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  water_id BINARY (16) NOT NULL,
  CONSTRAINT fk_water_version_water_id FOREIGN KEY (water_id) REFERENCES water (water_id), -- reference to current version
  created_by VARCHAR(36) NOT NULL,
  version INT NOT NULL,
  UNIQUE KEY (water_id, version),
  name VARCHAR (100) NOT NULL,
  calcium DECIMAL (6, 2), -- parts per million
  bicarbonate DECIMAL (6, 2), -- parts per million
  sulfate DECIMAL (6, 2), -- parts per million
  chloride DECIMAL (6, 2), -- parts per million
  sodium DECIMAL (6, 2), -- parts per million
  magnesium DECIMAL (6, 2), -- parts per million
  ph DECIMAL (4, 2),
  notes TEXT,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_water (
  water_id BINARY (16) NOT NULL,
  version INT NOT NULL,
  recipe_id BINARY (16) NOT NULL,
  CONSTRAINT fk_water_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id),
  UNIQUE KEY (water_id, version, recipe_id),
  amount DECIMAL (10, 6) NOT NULL, -- volume in liters
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS water_view;

CREATE VIEW water_view AS
SELECT * FROM water 
UNION 
SELECT * FROM water_version; 

DROP TRIGGER IF EXISTS before_insert_on_water;
DROP TRIGGER IF EXISTS before_insert_on_recipe_water;
DROP TRIGGER IF EXISTS before_update_on_water;

CREATE TRIGGER before_insert_on_water
  BEFORE INSERT ON water
  FOR EACH ROW
  BEGIN
    IF (NEW.water_id IS NULL) THEN
      SET NEW.water_id = UUID_TO_BIN(UUID());
    END IF;
  END;

-- This trigger exists in place of FK constraint (because you can't have FK constraint referring to a VIEW). Ensures that the entered id and version match an existing record
CREATE TRIGGER before_insert_on_recipe_water
  BEFORE INSERT ON recipe_water
  FOR EACH ROW
  BEGIN
    DECLARE id_count INT;
    SELECT COUNT(*) INTO id_count FROM water_view
    WHERE water_id = NEW.water_id AND version = NEW.version;
    IF (id_count < 1) THEN
      SIGNAL SQLSTATE "45000"
        SET MESSAGE_TEXT = "Invalid id and/or version";
    END IF;
  END;

CREATE TRIGGER before_update_on_water
  BEFORE UPDATE ON water
  FOR EACH ROW
  BEGIN
    INSERT INTO water_version (
      water_id,
      version,
      created_by,
      name,
      calcium,
      bicarbonate,
      sulfate,
      chloride,
      sodium,
      magnesium,
      ph,
      notes
    )
    VALUES (
      OLD.water_id,
      OLD.version,
      OLD.created_by,
      OLD.name,
      OLD.calcium,
      OLD.bicarbonate,
      OLD.sulfate,
      OLD.chloride,
      OLD.sodium,
      OLD.magnesium,
      OLD.ph,
      OLD.notes
    );
    SET NEW.version = OLD.version + 1;
  END;
