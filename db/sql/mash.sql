CREATE TABLE IF NOT EXISTS mash (
  mash_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  mash_uuid BINARY (16) NOT NULL UNIQUE,
  brewery_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_mash_brewery_uuid FOREIGN KEY (brewery_uuid) REFERENCES brewery (brewery_uuid) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  name VARCHAR (100) NOT NULL,
  created_by VARCHAR (36) NOT NULL,
  UNIQUE KEY (brewery_uuid, name),
  grain_temp DECIMAL (5, 2), -- degrees Celcius
  tun_temp DECIMAL (5, 2), -- degrees Celcius
  sparge_temp DECIMAL (5, 2), -- degrees Celcius
  ph DECIMAL (4, 2),
  tun_weight DECIMAL (10, 3), -- kilograms
  notes TEXT,
  tun_specific_heat DECIMAL (10, 3), -- Cal/gram-deg C
  equip_adjust BOOLEAN DEFAULT 0 -- If TRUE, mash infusion and decoction calculations should take into account the temperature effects of the equipment (tun specific heat and tun weight).
);

ALTER TABLE mash ADD INDEX (mash_uuid);

CREATE TABLE IF NOT EXISTS mash_version (
  mash_version_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  mash_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_mash_version_mash_uuid FOREIGN KEY (mash_uuid) REFERENCES mash (mash_uuid) ON DELETE CASCADE,
  brewery_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_mash_version_brewery_uuid FOREIGN KEY (brewery_uuid) REFERENCES brewery (brewery_uuid) ON DELETE CASCADE,
  version INT NOT NULL,
  UNIQUE KEY (mash_uuid, version),
  name VARCHAR (100) NOT NULL,
  created_by VARCHAR (36) NOT NULL,
  grain_temp DECIMAL (5, 2), -- degrees Celcius
  tun_temp DECIMAL (5, 2), -- degrees Celcius
  sparge_temp DECIMAL (5, 2), -- degrees Celcius
  ph DECIMAL (4, 2),
  tun_weight DECIMAL (10, 3), -- kilograms
  notes TEXT,
  tun_specific_heat DECIMAL (10, 3), -- Cal/gram-deg C
  equip_adjust BOOLEAN DEFAULT 0 -- If TRUE, mash infusion and decoction calculations should take into account the temperature effects of the equipment (tun specific heat and tun weight).
);

CREATE TABLE IF NOT EXISTS recipe_mash (
  mash_uuid  BINARY (16) NOT NULL,
  version INT NOT NULL,
  CONSTRAINT fk_recipe_mash_mash_uuid FOREIGN KEY (mash_uuid) REFERENCES mash(mash_uuid),
  recipe_uuid  BINARY (16) NOT NULL UNIQUE,
  CONSTRAINT fk_recipe_mash_recipe_uuid FOREIGN KEY (recipe_uuid) REFERENCES recipe(recipe_uuid),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mash_step (
  mash_step_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  mash_step_uuid BINARY (16) NOT NULL UNIQUE,
  mash_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_mash_step_mash_uuid FOREIGN KEY (mash_uuid) REFERENCES mash (mash_uuid) ON DELETE CASCADE,
  name VARCHAR (100) NOT NULL,
  UNIQUE KEY (mash_uuid, name),
  version INT NOT NULL DEFAULT 1,
  created_by VARCHAR (36) NOT NULL,
  type ENUM ("Infusion", "Temperature", "Decoction") NOT NULL,
  infuse_amount DECIMAL (10, 3), -- liters
  step_temp DECIMAL(5, 2) NOT NULL, -- target temperature for the step in degrees Celcius
  step_time INT NOT NULL, -- time in minutes to maintain the temperature
  ramp_time INT, -- time in minutes to achieve the target temperature
  end_temp DECIMAL(5, 2) -- the temperature you can expect the mash to fall to after a long mash step, in degrees Celsius.
);

ALTER TABLE mash_step ADD INDEX (mash_step_uuid);

CREATE TABLE IF NOT EXISTS mash_step_version (
  mash_step_version_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  mash_step_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_mash_step_version_mash_step_uuid FOREIGN KEY (mash_step_uuid) REFERENCES mash_step (mash_step_uuid) ON DELETE CASCADE,
  mash_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_mash_step_version_mash_uuid FOREIGN KEY (mash_uuid) REFERENCES mash (mash_uuid) ON DELETE CASCADE,
  UNIQUE KEY (mash_step_uuid, version),
  name VARCHAR (100) NOT NULL,
  version INT NOT NULL,
  created_by VARCHAR (36) NOT NULL,
  type ENUM ("Infusion", "Temperature", "Decoction") NOT NULL,
  infuse_amount DECIMAL (10, 3), -- liters
  step_temp DECIMAL(5, 2) NOT NULL, -- target temperature for the step in degrees Celcius
  step_time INT NOT NULL, -- time in minutes to maintain the temperature
  ramp_time INT, -- time in minutes to achieve the target temperature
  end_temp DECIMAL(5, 2) -- the temperature you can expect the mash to fall to after a long mash step, in degrees Celsius.
);

DROP VIEW IF EXISTS mash_view;

CREATE VIEW mash_view AS
SELECT * FROM mash
UNION
SELECT * FROM mash_version;

DROP VIEW IF EXISTS mash_step_view;

CREATE VIEW mash_step_view AS
SELECT * FROM mash_step
UNION
SELECT * FROM mash_step_version;

DROP TRIGGER IF EXISTS before_insert_on_mash;
DROP TRIGGER IF EXISTS before_update_on_mash;
DROP TRIGGER IF EXISTS before_insert_on_recipe_mash;
DROP TRIGGER IF EXISTS before_insert_on_mash_step;
DROP TRIGGER IF EXISTS before_update_on_mash_step;

CREATE TRIGGER before_insert_on_mash
  BEFORE INSERT ON mash
  FOR EACH ROW
  BEGIN
    IF (NEW.mash_uuid IS NULL) THEN
      SET NEW.mash_uuid = UUID_TO_BIN(UUID());
    END IF;
  END;

  -- This trigger exists in place of FK constraint (because you can't have FK constraint referring to a VIEW). Ensures that the entered id and version match an existing record
CREATE TRIGGER before_insert_on_recipe_mash
  BEFORE INSERT ON recipe_mash
  FOR EACH ROW
  BEGIN
    DECLARE id_count INT;
    SELECT COUNT(*) INTO id_count FROM mash_view
    WHERE mash_uuid = NEW.mash_uuid AND version = NEW.version;
    IF (id_count < 1) THEN
      SIGNAL SQLSTATE "45000"
        SET MESSAGE_TEXT = "Invalid id and/or version";
    END IF;
  END;

CREATE TRIGGER before_update_on_mash
  BEFORE UPDATE ON mash
  FOR EACH ROW
  BEGIN
    INSERT INTO mash_version (
      mash_uuid,
      brewery_uuid,
      version,
      name,
      created_by,
      grain_temp,
      tun_temp,
      sparge_temp,
      ph,
      tun_weight,
      notes,
      tun_specific_heat,
      equip_adjust
    )
    VALUES (
      OLD.mash_uuid,
      OLD.brewery_uuid,
      OLD.version,
      OLD.name,
      OLD.created_by,
      OLD.grain_temp,
      OLD.tun_temp,
      OLD.sparge_temp,
      OLD.ph,
      OLD.tun_weight,
      OLD.notes,
      OLD.tun_specific_heat,
      OLD.equip_adjust
    );
    SET NEW.version = OLD.version + 1;
  END;

CREATE TRIGGER before_insert_on_mash_step
  BEFORE INSERT ON mash_step
  FOR EACH ROW
  BEGIN
    IF (NEW.mash_step_uuid IS NULL) THEN
      SET NEW.mash_step_uuid = UUID_TO_BIN(UUID());
    END IF;
  END;

CREATE TRIGGER before_update_on_mash_step
  BEFORE UPDATE ON mash_step
  FOR EACH ROW
  BEGIN
    INSERT INTO mash_step_version (
      mash_step_uuid,
      mash_uuid,
      version,
      created_by,
      name,
      type,
      infuse_amount,
      step_temp,
      step_time,
      ramp_time,
      end_temp
    )
    VALUES (
      OLD.mash_step_uuid,
      OLD.mash_uuid,
      OLD.version,
      OLD.created_by,
      OLD.name,
      OLD.type,
      OLD.infuse_amount,
      OLD.step_temp,
      OLD.step_time,
      OLD.ramp_time,
      OLD.end_temp
    );
    SET NEW.version = OLD.version + 1;
    INSERT INTO mash_version (
      mash_uuid,
      brewery_uuid,
      version,
      name,
      created_by,
      grain_temp,
      tun_temp,
      sparge_temp,
      ph,
      tun_weight,
      notes,
      tun_specific_heat,
      equip_adjust
    )
    SELECT mash_uuid,
      brewery_uuid,
      version + 1,
      name,
      created_by,
      grain_temp,
      tun_temp,
      sparge_temp,
      ph,
      tun_weight,
      notes,
      tun_specific_heat,
      equip_adjust
    FROM mash_view
    WHERE mash_uuid = OLD.mash_uuid AND version = OLD.version;
  END;