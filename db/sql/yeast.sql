CREATE TABLE IF NOT EXISTS yeast (
  yeast_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  yeast_uuid BINARY (16) NOT NULL UNIQUE,
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  UNIQUE KEY (yeast_uuid), -- there can be only one version per yeast_uuid
  name VARCHAR (100) NOT NULL,
  type ENUM ("Ale", "Lager", "Wheat", "Wine", "Champagne", "Kveik") NOT NULL,
  laboratory VARCHAR (100), -- name of the lab that produced the yeast
  product_id VARCHAR (36), -- manufacturers product id, i.e. WLP001
  min_temperature DECIMAL (5, 2), -- minimum recommended fermentation temperature in degrees Celcius
  max_temperature DECIMAL (5, 2), -- maximum recommended fermentation temperature in degrees Celcius
  flocculation ENUM ("Low", "Medium", "High", "Very High"),
  attenuation DECIMAL (5, 2), -- a percentage, the average attenuation for the strain
  notes TEXT,
  best_for TEXT, -- styles the yeast is recommended for
  max_reuse INT, -- the recommended number of times the yeast may be reused
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE yeast ADD INDEX (yeast_uuid);

CREATE TABLE IF NOT EXISTS yeast_version (
  yeast_version_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  yeast_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_yeast_version_yeast_uuid FOREIGN KEY (yeast_uuid) REFERENCES yeast (yeast_uuid), -- reference to current version
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  UNIQUE KEY (yeast_uuid),
  name VARCHAR (100) NOT NULL,
  type ENUM ("Ale", "Lager", "Wheat", "Wine", "Champagne", "Kveik") NOT NULL,
  laboratory VARCHAR (100), -- name of the lab that produced the yeast
  product_id VARCHAR (36), -- manufacturers product id, i.e. WLP001
  min_temperature DECIMAL (5, 2), -- minimum recommended fermentation temperature in degrees Celcius
  max_temperature DECIMAL (5, 2), -- maximum recommended fermentation temperature in degrees Celcius
  flocculation ENUM ("Low", "Medium", "High", "Very High"),
  attenuation DECIMAL (5, 2), -- a percentage, the average attenuation for the strain
  notes TEXT,
  best_for TEXT, -- styles the yeast is recommended for
  max_reuse INT, -- the recommended number of times the yeast may be reused
  created_at TIMESTAMP
);


CREATE TABLE IF NOT EXISTS recipe_yeast (
  yeast_uuid BINARY (16) NOT NULL,
  version INT NOT NULL,
  recipe_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_yeast_recipe_uuid FOREIGN KEY (recipe_uuid) REFERENCES recipe(recipe_uuid),
  UNIQUE KEY (yeast_uuid, version, recipe_uuid),
  form ENUM ("Liquid", "Dry", "Slant", "Culture") NOT NULL,
  volume DECIMAL (10, 4), -- volume in liters,
  weight DECIMAL (10, 6), -- weight in kilograms
  CONSTRAINT yeast_weight_or_volume CHECK (volume IS NOT NULL OR weight IS NOT NULL),
  packages INT, -- number of commercially packaged units (i.e. pouches/vials)
  times_cultured INT,
  add_to_secondary BOOLEAN DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS yeast_view;

CREATE VIEW yeast_view AS
SELECT * FROM yeast 
UNION 
SELECT * FROM yeast_version; 

DROP TRIGGER IF EXISTS before_insert_on_yeast;
DROP TRIGGER IF EXISTS before_insert_on_recipe_yeast;
DROP TRIGGER IF EXISTS before_update_on_yeast;

CREATE TRIGGER before_insert_on_yeast
  BEFORE INSERT ON yeast
  FOR EACH ROW
  BEGIN
    IF (NEW.yeast_uuid IS NULL) THEN
      SET NEW.yeast_uuid = UUID_TO_BIN(UUID());
    END IF;
  END;

-- This trigger exists in place of FK constraint (because you can't have FK constraint referring to a VIEW). Ensures that the entered id and version match an existing record
CREATE TRIGGER before_insert_on_recipe_yeast
  BEFORE INSERT ON recipe_yeast
  FOR EACH ROW
  BEGIN
    DECLARE id_count INT;
    SELECT COUNT(*) INTO id_count FROM yeast_view
    WHERE yeast_uuid = NEW.yeast_uuid AND version = NEW.version;
    IF (id_count < 1) THEN
      SIGNAL SQLSTATE "45000"
        SET MESSAGE_TEXT = "Invalid id and/or version";
    END IF;
  END;

CREATE TRIGGER before_update_on_yeast
  BEFORE UPDATE ON yeast
  FOR EACH ROW
  BEGIN
    INSERT INTO yeast_version (
      yeast_uuid,
      created_by,
      version,
      name,
      type,
      laboratory,
      product_id,
      min_temperature,
      max_temperature,
      flocculation,
      attenuation,
      notes,
      best_for,
      max_reuse,
      created_at
    )
    VALUES (
      OLD.yeast_uuid,
      OLD.created_by,
      OLD.version,
      OLD.name,
      OLD.type,
      OLD.laboratory,
      OLD.product_id,
      OLD.min_temperature,
      OLD.max_temperature,
      OLD.flocculation,
      OLD.attenuation,
      OLD.notes,
      OLD.best_for,
      OLD.max_reuse,
      OLD.created_at
    );
    SET NEW.version = OLD.version + 1;
  END;
