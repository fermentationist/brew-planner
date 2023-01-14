CREATE TABLE IF NOT EXISTS mash (
  mash_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  mash_uuid BINARY (16) NOT NULL UNIQUE,
  created_by VARCHAR (36) NOT NULL,
  name VARCHAR (100) NOT NULL,
  UNIQUE KEY (mash_uuid, name),
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

CREATE TABLE IF NOT EXISTS mash_step (
  mash_step_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  mash_step_uuid BINARY (16) NOT NULL UNIQUE,
  mash_uuid BINARY (16) NOT NULL,
  CONSTRAINT fk_mash_step_mash_id FOREIGN KEY (mash_uuid) REFERENCES mash (mash_uuid),
  name VARCHAR (100) NOT NULL,
  UNIQUE KEY (mash_uuid, name),
  type ENUM ("Infusion", "Temperature", "Decoction") NOT NULL,
  infuse_amount DECIMAL (10, 3), -- liters
  step_temp DECIMAL(5, 2) NOT NULL, -- target temperature for the step in degrees Celcius
  step_time INT NOT NULL, -- time in minutes to maintain the temperature
  ramp_time INT, -- time in minutes to achieve the target temperature
  end_temp DECIMAL(5, 2) -- the temperature you can expect the mash to fall to after a long mash step, in degrees Celsius.

);