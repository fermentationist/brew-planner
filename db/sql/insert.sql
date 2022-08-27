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
      brewery_id,
      name,
      batch_size,
      target_og,
      target_fg,
      boil_time,
      fermentation_temp,
      strike_water_vol,
      strike_water_temp,
      preboil_volume
    )
    VALUES
    (
      (SELECT brewery_id FROM brewery WHERE brewery_key = breweryKey),
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
    SELECT recipe_id FROM recipe WHERE recipe_key = recipeKey INTO recipeId;

    INSERT INTO water (name, created_by, calcium) VALUES ("Test water", "Fermentationist", 35);
    SELECT LAST_INSERT_ID() INTO waterKey;
    SELECT water_id FROM water WHERE water_key = waterKey INTO waterId;

    INSERT INTO recipe_water (water_id, version, recipe_id, amount) VALUES (waterId, 1, recipeId, 1000);
  END;

CALL insert_test();