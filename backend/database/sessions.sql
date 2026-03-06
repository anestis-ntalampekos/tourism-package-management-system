CREATE TABLE software_technology.sessions (
	sid varchar(254) NOT NULL,
	expires INT NOT NULL,
	`data` LONGTEXT NOT NULL,
	CONSTRAINT sessions_pk PRIMARY KEY (sid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci
COMMENT='This table saves the enabled sessions';