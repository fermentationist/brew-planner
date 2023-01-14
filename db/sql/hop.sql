CREATE TABLE IF NOT EXISTS hop (
  hop_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  hop_uuid BINARY (16) NOT NULL UNIQUE,
  name VARCHAR (100) NOT NULL,
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  UNIQUE KEY (hop_uuid),
  alpha DECIMAL (5, 2) NOT NULL, -- this decimal represents a whole number percentage, i.e. the value 5.5 represents an alpha acid level of 5.5%, or 0.055
  beta DECIMAL (5, 2), -- percentage
  form ENUM ("Pellet", "Plug", "Leaf"),
  notes TEXT,
  origin VARCHAR (100), -- geographical origin
  supplier VARCHAR (100), -- brand
  humulene DECIMAL (5, 2), -- percentage
  caryophyllene DECIMAL (5, 2), -- percentage
  cohumulone DECIMAL (5, 2), -- percentage
  myrcene DECIMAL (5, 2), -- percentage
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE hop ADD INDEX (hop_uuid);

CREATE TABLE IF NOT EXISTS hop_version (
  hop_version_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  hop_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_hop_version_hop_uuid FOREIGN KEY (hop_uuid) REFERENCES hop (hop_uuid),
  name VARCHAR (100) NOT NULL,
  created_by VARCHAR (36) NOT NULL,
  version INT NOT NULL,
  UNIQUE KEY (hop_uuid, version),
  alpha DECIMAL (5, 2) NOT NULL, -- this decimal represents a whole number percentage, i.e. the value 5.5 represents an alpha acid level of 5.5%, or 0.055
  beta DECIMAL (5, 2), -- percentage
  form ENUM ("Pellet", "Plug", "Leaf"),
  notes TEXT,
  origin VARCHAR (100), -- geographical origin
  supplier VARCHAR (100), -- brand
  humulene DECIMAL (5, 2), -- percentage
  caryophyllene DECIMAL (5, 2), -- percentage
  cohumulone DECIMAL (5, 2), -- percentage
  myrcene DECIMAL (5, 2), -- percentage
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_hop (
  hop_uuid  BINARY (16) NOT NULL,
  version INT NOT NULL,
  recipe_uuid  BINARY (16) NOT NULL,
  CONSTRAINT fk_hop_recipe_uuid FOREIGN KEY (recipe_uuid) REFERENCES recipe(recipe_uuid),
  amount DECIMAL (10, 4), -- weight in kilograms
  `use` ENUM ("Mash", "First Wort", "Boil", "Aroma", "Dry Hop") NOT NULL,
  time INT NOT NULL, -- minutes
  UNIQUE KEY (hop_uuid, version, recipe_uuid, `use`, time),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS hop_view;

CREATE VIEW hop_view AS
SELECT * FROM hop 
UNION 
SELECT * FROM hop_version; 

DROP TRIGGER IF EXISTS before_insert_on_hop;
DROP TRIGGER IF EXISTS before_update_on_hop;
DROP TRIGGER IF EXISTS before_insert_on_recipe_hop;

CREATE TRIGGER before_insert_on_hop
  BEFORE INSERT ON hop
  FOR EACH ROW
  BEGIN
    IF (NEW.hop_uuid IS NULL) THEN
      SET NEW.hop_uuid = UUID_TO_BIN(UUID());
    END IF;
  END;

-- This trigger exists in place of FK constraint (because you can't have FK constraint referring to a VIEW). Ensures that the entered id and version match an existing record
CREATE TRIGGER before_insert_on_recipe_hop
  BEFORE INSERT ON recipe_hop
  FOR EACH ROW
  BEGIN
    DECLARE id_count INT;
    SELECT COUNT(*) INTO id_count FROM hop_view
    WHERE hop_uuid = NEW.hop_uuid AND version = NEW.version;
    IF (id_count < 1) THEN
      SIGNAL SQLSTATE "45000"
        SET MESSAGE_TEXT = "Invalid id and/or version";
    END IF;
  END;

CREATE TRIGGER before_update_on_hop
  BEFORE UPDATE ON hop
  FOR EACH ROW
  BEGIN
    INSERT INTO hop_version (
      hop_uuid,
      name,
      created_by,
      version,
      alpha,
      beta,
      form,
      notes,
      origin,
      supplier,
      humulene,
      caryophyllene,
      cohumulone,
      myrcene
    )
    VALUES (
      OLD.hop_uuid,
      OLD.name,
      OLD.created_by,
      OLD.version,
      OLD.alpha,
      OLD.beta,
      OLD.form,
      OLD.notes,
      OLD.origin,
      OLD.supplier,
      OLD.humulene,
      OLD.caryophyllene,
      OLD.cohumulone,
      OLD.myrcene
    );
    SET NEW.version = OLD.version + 1;
  END;