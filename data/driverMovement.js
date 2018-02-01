let db = require('./datageneration.js');

let randomNumber = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

let degreeChange = {
  //tested for boundaries
  S: (driver,degrees) => {
    if(driver.currentLocation[0] - degrees < coordinates[driver.city].latitude[1]){
      driver.currentLocation[0] -= (degrees * .05)
    } else {
      driver.currentLocation[0] -= degrees;
    }
  },

  //tested for boundaries
  N: (driver,degrees) => {
    if(driver.currentLocation[0] + degrees > coordinates[driver.city].latitude[0]){
      driver.currentLocation[0] += (degrees * .05)
    } else {
      driver.currentLocation[0] += degrees;
    }
  },
  //tested for bounadaries 
  W: (driver,degrees) => {
    if(driver.currentLocation[1] - degrees < coordinates[driver.city].longitude[0]){
      driver.currentLocation[1] -= (degrees * .05)
    } else {
      driver.currentLocation[1] -= degrees;
    }
  },

  //tested for boundaries
  E: (driver,degrees) => {
    if(driver.currentLocation[1] + degrees > coordinates[driver.city].longitude[1]){
      driver.currentLocation[1] += (degrees * .05)
    } else {
      driver.currentLocation[1] += degrees;
    }
  }
}
//for every 1 degree of movement (lon, lat), its about 68 avg miles movement.
let driverMovement = (drivers) => {
  const directions = ['N', 'E', 'S', 'W'];
  //at 20 mph in degrees
  var minMovement = .001280
  //at 60 mph in degrees
  var maxMovement = .002169
  //degree range is .001488743
  drivers.forEach((driver)=>{
    //trying to get the degree movement based on min and max movement.
    let degreeMovement = Math.random() * (maxMovement - minMovement) + minMovement;
    //getting a cardinal direction
    let direction = directions[randomNumber(4)]
    degreeChange[direction](driver, degreeMovement);
  })
  return drivers;
}
//initialize drivers
let firstDrivers = db.generateRandomDrivers(10); 
console.log(firstDrivers);

//driver movement
let movingDrivers = driverMovement(firstDrivers);
console.log('moving driviers',movingDrivers);

module.exports.driverMovement = driverMovement