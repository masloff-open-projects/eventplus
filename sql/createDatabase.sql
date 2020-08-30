CREATE SCHEMA `passport` ;

CREATE TABLE `passport`.`users` (
  `id` VARCHAR(256) NOT NULL,
  `username` VARCHAR(256) NOT NULL,
  `password` VARCHAR(256) NOT NULL,
  `signup_time` VARCHAR(256) NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  `scope` VARCHAR(256) NOT NULL,
  `2fa` VARCHAR(256) NOT NULL);

CREATE TABLE `passport`.`sessions` (
  `id` VARCHAR(255) NOT NULL,
  `time` VARCHAR(45) NOT NULL,
  `ip` VARCHAR(45) NOT NULL);

CREATE TABLE `passport`.`thoughts` (
  `id` VARCHAR(255) NOT NULL,
  `time` VARCHAR(45) NOT NULL,
  `title` VARCHAR(45) NOT NULL,
  `thought` VARCHAR(2048) NOT NULL,
  `likes` VARCHAR(45) NOT NULL,
  `public` VARCHAR(45) NOT NULL);