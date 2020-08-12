CREATE SCHEMA `passport` ;

CREATE TABLE `passport`.`users` (
  `id` VARCHAR(256) NOT NULL,
  `username` VARCHAR(256) NOT NULL,
  `password` VARCHAR(256) NOT NULL,
  `signup_time` VARCHAR(256) NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  `scope` VARCHAR(256) NOT NULL,
  `2fa` VARCHAR(256) NOT NULL);
