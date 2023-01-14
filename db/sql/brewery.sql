CREATE TABLE IF NOT EXISTS brewery (
  brewery_key INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  brewery_uuid BINARY (16) NOT NULL UNIQUE,
  name VARCHAR (100) NOT NULL,
  street VARCHAR (200),
  unit VARCHAR (100),
  city VARCHAR (100),
  state_or_province VARCHAR(50),
  postal_code VARCHAR (20),
  country VARCHAR (100),
  is_private BOOLEAN DEFAULT 1
);

DROP TRIGGER IF EXISTS before_insert_on_brewery;

CREATE TRIGGER before_insert_on_brewery 
  BEFORE INSERT ON brewery 
    FOR EACH ROW 
    BEGIN
      IF (NEW.brewery_uuid IS NULL) THEN
        SET NEW.brewery_uuid = UUID_TO_BIN(UUID());
      END IF;
    END;  