const cassandra = require('cassandra-driver');
const client = new cassandra.Client({contactPoints:['localhost'], keyspace:'drivers'})

let selectDriverCount = (driver) => {
  return `SELECT * from drivercount WHERE city='${driver.city}'`;
}

let updateCityDriverCount = (driverCount, city) => {
  return `INSERT INTO driverCount (count, city) VALUES(${driverCount},'${city}')`; 
}

let driverInsert = (driver) => {
  return `INSERT INTO driverdetails (city, driverID, latitude, longitude) VALUES('${driver.city}',${driver.driverId},${driver.currentLocation[0]},${driver.currentLocation[1]})`;
}

let deleteDriver = (driver) => {
  return `DELETE from driverdetails WHERE city='${driver.city}' and driverid=${driver.driverId}`
}

let addDriver = (driver) => {
  client.execute(selectDriverCount(driver))
    .then(result => {
    let incrDriver = result.rows[0].count += 1; 
    client.execute(driverInsert(driver), {prepare:true})
    client.execute(updateCityDriverCount(incrDriver,driver.city), {prepare:true})
  }).then(result => {
    console.log('inserted')
  }).catch(err => {
    console.log(err);
  })
}

let removeDriver = (driver) => {
  client.execute(selectDriverCount(driver))
    .then(result => {
    let decrDriver = result.rows[0].count -+ 1;
    client.execute(deleteDriver(driver), {prepare:true})
    client.execute(updateCityDriverCount(decrDriver, driver.city), {prepare:true})
  }).then(result => {
    console.log('deleted'); 
  }).catch(err => {
    console.log(err);
  })
}

module.exports.addDriver = addDriver; 
module.exports.removeDriver = removeDriver; 


// function driverInsert (result) {
//   let incrDriver = result.rows[0].count += 1; 
//    let driverInsert = `INSERT INTO driverdetails (city, driverID, latitude, longitude) VALUES('${driver.city}',${driver.driverId},${driver.currentLocation[0]},${driver.currentLocation[1]})`; 
//    let cityCountUpdate = `INSERT INTO driverCount (count, city) VALUES(${incrDriver},'${driver.city}')`;
//   
//    client.execute(driverInsert, {prepare:true})
//    client.execute(cityCountUpdate, {prepare:true})
//    .then(result => {
//      console.log('inserted')
//    }).catch(err => {
//      console.log(err);
//    }) 
// }

