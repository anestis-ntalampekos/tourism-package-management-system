CREATE TABLE software_technology.system_errors (
	error_id INT auto_increment NOT NULL,
	error_code INT DEFAULT 500 NOT NULL,
	error_metadata LONGTEXT NOT NULL,
	app_part varchar(20) DEFAULT 'backend' NOT NULL,
	CONSTRAINT system_errors_pk PRIMARY KEY (error_id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci
COMMENT='This table saves the system errors';