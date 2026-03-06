CREATE TABLE `accounts` (
  `account_id` varchar(48) NOT NULL,
  `username` varchar(100) NOT NULL,
  `first_name` varchar(254) NOT NULL,
  `last_name` varchar(254) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(254) NOT NULL,
  `account_type` varchar(100) NOT NULL,
  `activated` tinyint(1) NOT NULL DEFAULT 0,
  `request_password_change` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`account_id`),
  CONSTRAINT `accounts_check` CHECK (`account_type` in ('system_admin','secreteriat','travel_agent','customer'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='This table saves the accounts';