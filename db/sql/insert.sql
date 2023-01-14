DROP PROCEDURE IF EXISTS insert_test;

CREATE PROCEDURE insert_test () 
  BEGIN
    DECLARE breweryKey INT;
    DECLARE recipeKey INT;
    DECLARE recipeId BINARY (16);
    DECLARE waterKey INT;
    DECLARE waterId BINARY (16);
    INSERT IGNORE INTO brewery (name)
    VALUES ("Fermentationist's Brewery");
    SELECT LAST_INSERT_ID() INTO breweryKey;

    INSERT INTO recipe (
      brewery_uuid,
      name,
      batch_size,
      og,
      fg,
      boil_time,
      fermentation_temp,
      strike_water_vol,
      strike_water_temp,
      boil_size
    )
    VALUES
    (
      (SELECT brewery_uuid FROM brewery WHERE brewery_key = breweryKey),
      "Test recipe",
      5.25,
      1.048,
      1.010,
      70,
      68,
      7.5,
      167,
      8.5
    );
    SELECT LAST_INSERT_ID() INTO recipeKey;
    SELECT recipe_uuid FROM recipe WHERE recipe_key = recipeKey INTO recipeId;

    INSERT INTO water (name, created_by, calcium) VALUES ("Test water", "Fermentationist", 35);
    SELECT LAST_INSERT_ID() INTO waterKey;
    SELECT water_uuid FROM water WHERE water_key = waterKey INTO waterId;

    INSERT INTO recipe_water (water_uuid, version, recipe_uuid, amount) VALUES (waterId, 1, recipeId, 1000);
  END;

CALL insert_test();