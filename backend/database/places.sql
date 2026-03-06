CREATE TABLE software_technology.places (
	place_id varchar(48) NOT NULL,
	country varchar(254) NOT NULL,
	city varchar(254) NOT NULL,
	postal_code varchar(100) NOT NULL,
	state varchar(254) NOT NULL,
	street TEXT NULL,
	longitude FLOAT NULL,
	latitude FLOAT NULL,
	CONSTRAINT places_pk PRIMARY KEY (place_id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci
COMMENT='This table saves all the places that supported bu the office';
