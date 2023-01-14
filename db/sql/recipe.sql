CREATE TABLE IF NOT EXISTS recipe (
  recipe_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  recipe_uuid BINARY (16) NOT NULL,
  brewery_uuid BINARY (16) NOT NULL UNIQUE,
  CONSTRAINT fk_brewery_uuid FOREIGN KEY (brewery_uuid) REFERENCES brewery (brewery_uuid),
  name VARCHAR (100) NOT NULL,
  UNIQUE KEY (brewery_uuid, name),
  type ENUM ("Extract", "Partial Mash", "All Grain") DEFAULT "All Grain",
  brewer VARCHAR (100),
  asst_brewer VARCHAR (100),
  batch_size DECIMAL (10, 4), -- liters
  og DECIMAL (4, 3), -- specific gravity (SG)
  fg DECIMAL (4, 3), -- specific gravity (SG)
  boil_time INT, -- minutes
  fermentation_temp DECIMAL (5, 2), -- degrees Celcius
  strike_water_vol DECIMAL (10, 4), -- liters
  strike_water_temp DECIMAL (5, 2), -- degrees Celcius
  boil_size DECIMAL (10, 4), -- liters, (preboil volume, named to match beerxml)
  preboil_sg DECIMAL (4, 3), -- specific gravity (SG)
  efficiency DECIMAL (5, 2), -- efficiency assumed by recipe - this decimal represents a whole number percentage, i.e. the value 75 represents an efficiency of 75%, or 0.75
  notes TEXT,
  taste_notes TEXT,
  fermentation_stages INT, -- number of fermentation stages used
  primary_age INT, -- in days
  primary_temp DECIMAL (5, 2), -- degrees Celcius
  secondary_age INT, -- in days
  secondary_temp DECIMAL (5, 2), -- degrees Celcius
  tertiary_age INT, -- in days
  tertiary_temp DECIMAL (5, 2), -- degrees Celcius
  taste_rating DECIMAL (4, 2), -- a number between 0 and 50
  age INT, -- days to age after packaging
  age_temp DECIMAL (5, 2), -- degrees Celcius
  date TIMESTAMP, -- beerxml uses string
  carbonation DECIMAL (5, 2), -- in volumes of CO2
  forced_carbonation BOOLEAN,
  priming_sugar_name VARCHAR (25), -- type of priming sugar
  carbonation_temp DECIMAL (5, 2),
  priming_sugar_equiv DECIMAL (5, 2), -- Factor used to convert this priming agent to an equivalent amount of corn sugar
  keg_priming_factor DECIMAL (4, 2), -- Used to factor in the smaller amount of sugar needed for large containers.  For example, this might be 0.5 for a typical 5 gallon keg since naturally priming a keg requires about 50% as much sugar as priming bottles.
  is_private BOOLEAN DEFAULT 1,
  is_draft BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE recipe ADD INDEX (recipe_uuid);

DROP TRIGGER IF EXISTS before_insert_on_recipe;

CREATE TRIGGER before_insert_on_recipe
  BEFORE INSERT ON recipe
  FOR EACH ROW
  BEGIN
    IF (NEW.recipe_uuid IS NULL) THEN
      SET NEW.recipe_uuid = UUID_TO_BIN(UUID());
    END IF;
  END;