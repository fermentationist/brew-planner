CREATE TABLE IF NOT EXISTS brewhouse (
  brewhouse_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  brewhouse_id BINARY (16) NOT NULL UNIQUE,
  name VARCHAR (100) NOT NULL,
  brewery_id BINARY (16) NOT NULL,
  CONSTRAINT fk_brewhouse_brewery_id FOREIGN KEY (brewery_id) REFERENCES brewery (brewery_id),
  UNIQUE KEY (brewhouse_id, name),
  batch_size DECIMAL (10, 3), -- liters, target volume
  tun_volume DECIMAL (10, 3), -- liters
  tun_weight DECIMAL (10, 3), -- kilograms
  tun_loss DECIMAL (10, 3),  -- liters
  tun_specific_heat DECIMAL (10, 3), -- Cal/gram-deg C
  lauter_deadspace DECIMAL (10, 3), -- liters
  top_up_water DECIMAL (10, 3), -- liters (for partial-boil)
  trub_chiller_loss DECIMAL (10, 3), -- liters
  evaporation_rate DECIMAL (10, 3), -- proper evaporation rate, liters/hour (beerxml uses a percent volume/hour)
  kettle_vol DECIMAL (10, 3),  -- liters
  misc_loss DECIMAL (10, 3),  -- liters
  extract_efficiency DECIMAL (5, 2), -- this decimal represents a whole number percentage, i.e. the value 75 represents an efficiency of 75%, or 0.75
  grain_absorption_rate DECIMAL (5, 2), -- liters/kilogram
  hop_utilization DECIMAL (6, 2) -- "percentage" Large batch hop utilization.  This value should be 100% for batches less than 20 gallons, but may be higher (200% or more) for very large batch equipment (beerxml).
);

DROP TRIGGER IF EXISTS before_insert_on_brewhouse;

CREATE TRIGGER before_insert_on_brewhouse 
  BEFORE INSERT ON brewhouse 
  FOR EACH ROW 
    BEGIN 
      IF (NEW.brewhouse_id IS NULL) THEN
        SET NEW.brewhouse_id = UUID_TO_BIN(UUID());
      END IF;
    END;