// let client = redis.createClient();
let fs = require('fs');

let coordinates = {
  sanFrancisco: {
    latitude: [37.788164, 37.722025],
    longitude: [-122.508212, -122.370385]
  },
  seattle: {
    latitude: [47.732895, 47.553408],
    longitude: [-122.425989, -122.266016]
  },
  omaha: {
    latitude: [41.310582, 41.202976],
    longitude: [-96.117089, -95.939122]
  },
  lasVegas: {
    latitude: [36.189783, 36.145853],
    longitude: [-115.240241, -115.105658]
  },
  newYork: {
    latitude: [40.866646, 40.595648],
    longitude: [-74.211799, -73.73899]
  },
  portland: {
    latitude: [45.626458, 45.43942],
    longitude: [-122.828151, -122.523324]
  },
  austin: {
    latitude: [30.318942, 30.19113],
    longitude: [-97.819412, -97.620285]
  },
  losAngeles: {
    latitude: [34.25772, 33.959813],
    longitude: [-118.627374, -118.171441]
  },
  chicago: {
    latitude: [42.01093, 41.646129],
    longitude: [-87.865181, -87.524605]
  },
  phoenix: {
    latitude: [33.713689, 33.295646],
    longitude: [-112.335199, -111.820495]
  },
  philadelphia: {
    latitude: [40.072859, 39.918999],
    longitude: [-75.275969, -74.998564]
  },
  sanAntonio: {
    latitude: [29.662686, 29.292979],
    longitude: [-98.749273, -98.294027]
  },
  sanDiego: {
    latitude: [33.058199, 32.670338],
    longitude: [-117.272435, -117.017003]
  },
  dallas: {
    latitude: [32.951477, 32.65078],
    longitude: [-96.980117, -96.602462]
  },
  sanJose: {
    latitude: [37.396827, 37.248854],
    longitude: [-122.026161, -121.795448]
  },
  jacksonville: {
    latitude: [30.445009, 30.19518],
    longitude: [-81.7559, -81.518321]
  },
  columbus: {
    latitude: [40.087487, 39.873479],
    longitude: [-83.143272, -82.851104]
  },
  indianapolis: {
    latitude: [39.895695, 39.706052],
    longitude: [-86.312659, -86.043494]
  },
  fortWorth: {
    latitude: [32.952743, 32.588705],
    longitude: [-97.492601, -97.153605]
  },
  charlotte: {
    latitude: [35.335937, 35.098933],
    longitude: [-80.977853, -80.693582]
  },
  denver: {
    latitude: [39.792587, 39.650654],
    longitude: [-105.058574, -104.8567]
  },
  elPaso: {
    latitude: [31.984195, 31.660687],
    longitude: [-106.631893, -106.285137]
  },
  washingtonDC: {
    latitude: [38.980633, 38.820774],
    longitude: [-77.134054, -76.937959]
  },
  boston: {
    latitude: [42.36299, 42.259027],
    longitude: [-71.186585, -71.007714]
  },
  detroit: {
    latitude: [42.430407, 42.32719],
    longitude: [-83.285975, -82.92068]
  },
  nashville: {
    latitude: [36.360988, 36.080279],
    longitude: [-86.972129, -86.661422]
  },
  memphis: {
    latitude: [35.207688, 35.018122],
    longitude: [-90.075166, -89.813554]
  },
  oklahomaCity: {
    latitude: [35.626135, 35.313817],
    longitude: [-97.793003, -97.222401]
  },
  louisville: {
    latitude: [38.271786, 38.123124],
    longitude: [-85.870413, -85.471472]
  },
  baltimore: {
    latitude: [39.320816, 39.260636],
    longitude: [-76.708722, -76.552853]
  }
}


let randomCoordinates = (city) => {
  return [city.latitude[0] - Math.random() * (city.latitude[0] - city.latitude[1]), city.longitude[0] - Math.random() * (city.longitude[0] - city.longitude[1])]
}

//string format for cassandra; 
let generateRandomDrivers = (start,end) => {
  let cityArray = Object.keys(coordinates);
  let result = '';
  for (var i = start; i < end; i++) {
    let city = cityArray[Math.floor(Math.random() * cityArray.length)]
    let coord = randomCoordinates(coordinates[city]);
    result += [city,i,coord[0],coord[1]].join(',')+'\n';
      // city: city,
      // currentLocation: [coord[0], coord[1]]
      // availability: new Date()
    }
  return result; 
}

let initialDrivers = generateRandomDrivers(0,1000000);

let generateCount = (drivers) => {
  let result = '';
  let count = drivers.split('\n').reduce((totalDrivers,driver) => {
    let city = driver.split(',')[0];
    if(totalDrivers[city]){
      totalDrivers[city]+=1;
    } else {
      totalDrivers[city]=1;
    }
    return totalDrivers;
  },{});

  for(var city in count){
    if(city !== ''){
      result+=[city,count[city]]+'\n';
    }
  }

  return result;
}

let generateRandomDriversMongoDB = (start,end) => {
  let cityArray = Object.keys(coordinates);
  let result = [];
  for (var i = start; i < end; i++) {
    let city = cityArray[Math.floor(Math.random() * cityArray.length)]
    let coord = randomCoordinates(coordinates[city]);
    result.push({
      driverId : i,
      city: city,
      currentLocation: {type: "Point", 
                        coordinates: [coord[1], coord[0]]
                        }
    });
  }
  return JSON.stringify(result); 
}

// let mongoData = generateRandomDriversMongoDB(6666667,10000000);

let writeToText = (drivers, txtFile) => {
  let writeStream = fs.createWriteStream(txtFile);
// initialDrivers.forEach((driver) => {
  writeStream.write(drivers, 'utf8');
// })
  writeStream.on('finish', () => {
    console.log('finish');
  })
  writeStream.end()
};


// writeToText(mongoData, 'data3.json')
// writeToText(cityCount, 'dataCount.txt');
// writeToText(initialDrivers, 'dataDetails3.txt');

//copy driverdetails from 'dataDetails.txt' with delimiter=',';

module.exports.generateRandomDrivers = generateRandomDrivers;
module.exports.coordinates = coordinates;


//----------------------REDIS INFO --------------------
// let driverInsert = (driver) =>{

//   client.get(driver.city, (err, results) => {
//     if(results === null){
//       results = 1;
//       client.set(driver.city, results, (err, results) =>{
//         console.log(results);
//       })
//     } else {
//       client.incr(driver.city, (err, results) => {
//         console.log(results);
//       })
//     }
//   })
  // client.set(driver.city, 0, (err, reply) => {
  //   client.incr(driver.city, function(err, reply) {
  //     if(err){
  //      console.log(err);
  //     } else {
  //      console.log(reply);
  //     }
  //   });
  // }); 

//   client.geoadd("locations", driver.currentLocation[1], driver.currentLocation[0], "driverID:"+driver.driverId, (err, reply) => {
//     if(err){
//       console.log(err);
//     } else {
//       console.log(reply);
//     }
//   }); 
// }
// let randomTimeBetween = (start, end, daysAgo) => {
//   return moment(faker.date.between(moment().startOf('day').subtract(daysAgo, 'days').add(start, 'hour'), moment().startOf('day').subtract(daysAgo, 'days').add(end, 'hour'))).format();
// }

// let bulkInsert = (drivers) => {
//   drivers.forEach((driver) =>{
//     console.log('driver',driver);
//     driverInsert(driver)
//   })
// }


