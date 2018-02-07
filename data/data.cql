DROP KEYSPACE drivers; 

CREATE KEYSPACE drivers 
	WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 3};

USE drivers; 

CREATE TABLE driverDetails (
	city varchar,
	driverID int, 
	longitude float,
	latitude float,
	PRIMARY KEY(city, driverID)
);

CREATE TABLE driverCount (
	city varchar, 
	count int,
	PRIMARY KEY(city)
);