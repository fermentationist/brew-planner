CREATE TABLE IF NOT EXISTS brewery (
  brewery_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  brewery_id BINARY (16) NOT NULL UNIQUE,
  name VARCHAR (100) NOT NULL UNIQUE,
  street VARCHAR (200),
  unit VARCHAR (100),
  city VARCHAR (100),
  stateOrProvince VARCHAR(50),
  postalCode VARCHAR (20),
  country VARCHAR(100),
  is_private BOOLEAN DEFAULT 1
);

DROP TRIGGER IF EXISTS before_insert_on_brewery;

CREATE TRIGGER before_insert_on_brewery BEFORE
INSERT
  ON brewery FOR EACH ROW BEGIN
    IF (NEW.brewery_id IS NULL) THEN
    SET NEW.brewery_id = UUID_TO_BIN(UUID());

END IF;

END;