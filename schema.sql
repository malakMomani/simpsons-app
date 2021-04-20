DROP TABLE IF EXISTS simpsons_quotes;

CREATE TABLE simpsons_quotes (
  id SERIAL PRIMARY KEY NOT NULL,
  quote text,
  character_name VARCHAR(255),
  image VARCHAR(255),
  character_direction VARCHAR(255)
);