let Koa = require('koa');
let redis = require('redis');
let moment = require('moment');
let bodyParser = require('koa-bodyparser');
let Router = require('koa-router');
let db = require('../data/datageneration.js');
let fs = require('fs');
let client = redis.createClient();
// let koaBody = require('koa-body');
//App set up
let app = new Koa();
let router = new Router(); 

router.use(bodyParser());
app.use(router.routes())

router.post('/driver', (ctx) => {
  let driver = ctx.request.body
  driverInsert(driver);
}); 

router.patch('/driver', (ctx) => {
 
}) 

let port = 3000;

app.listen(port, () => { 

  // console.log(db.generateRandomDrivers(db.coordinates, 5)

  var initialDrivers = db.generateRandomDrivers(db.coordinates, 1);
  bulkInsert(initialDrivers);

  console.log("Koa is listening on port " + port);
});

// client.on('connect', () => {
// 	console.log('connected to koa');
// })
let driverInsert = (driver) =>{

  // client.hgetall(driver.city, (err, results) => {

    // counter = parseInt(results.count)
    // counter += 1;
    // console.log('counter',counter);
  // });
  client.get(driver.city, (err, results) => {
    if(results === null){
      results = 1;
      client.set(driver.city, results, (err, results) =>{
        console.log(results);
      })
    } else {
      client.incr(driver.city, (err, results) => {
        console.log(results);
      })
    }
  })
  // client.set(driver.city, 0, (err, reply) => {
  //   client.incr(driver.city, function(err, reply) {
  //     if(err){
  //      console.log(err);
  //     } else {
  //      console.log(reply);
  //     }
  //   });
  // }); 

  client.geoadd("locations", driver.currentLocation[1], driver.currentLocation[0], "driverID:"+driver.driverId, (err, reply) => {
  	if(err){
  		console.log(err);
  	} else {
  		console.log(reply);
  	}
  }); 
}

let bulkInsert = (drivers) => {
	drivers.forEach((driver) =>{
		console.log('driver',driver);
		driverInsert(driver)
	})
}


