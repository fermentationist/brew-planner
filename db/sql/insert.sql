INSERT INTO brewery (name)
VALUES ("Fermentationist's Brewery");

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
  (SELECT brewery_id FROM brewery WHERE brewery_key = (SELECT LAST_INSERT_ID())),
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