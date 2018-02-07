let async = require('async');
let Koa = require('koa');
let bodyParser = require('koa-bodyparser');
let Router = require('koa-router');
let fs = require('fs');
let mongoose = require('mongoose');
let datageneration = require('../data/datageneration.js');

let Driver = require('../data/driverModels.js');

let app = new Koa();
let router = new Router(); 

mongoose.connect('mongodb://localhost/uber', function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Server successfully!');
    }
});

mongoose.Promise = global.Promise;

router.use(bodyParser());
app.use(router.routes())

app.listen(process.env.port || 4000, () => { 
	console.log("Koa is listening on port 4000");
});

//get request takes in a query string with lng and lat 
	//example string query would be http://localhost:4000/driver/?lng=-122.5&lat=37.7
router.get('/driver', (ctx) => {
	longitude = ctx.query.lng;
	latitude = ctx.query.lat;
	Driver.findNearestDriver(longitude,latitude);
})

router.get('/driver', (ctx) => {
	let driver = ctx.request.body;
	Driver.updateDriverCount(driver.city,-1)
})


//post request takes an object for body
router.post('/driver', (ctx) => {
	let driver = ctx.request.body;
	Driver.addDriver(driver);
	Driver.updateDriverCount(driver.city,1);
})

//delete takes in a request object 
router.delete('/driver/', (ctx) => {
	let driver = ctx.request.body;
	console.log(driver._id, driver.city);
	Driver.removeById(driver._id);
	Driver.updateDriverCount(driver.city,-1)
})

//during initialize, run this to get count of every city for 10M
// let driverCount = () => {
// 	let cityKeys = Object.keys(datageneration.coordinates)
// 	cityKeys.forEach((city)=>{
// 		let closureCity = city;
// 		Driver.location.find({city:closureCity}).count()
// 		.then(count=>{
// 			console.log(closureCity+';'+count);
// 			Driver.count.create({city:closureCity, count:count})
// 			.then(result=>{
// 				console.log('completed for', result)
// 			}).catch(err =>{
// 				console.log('it broke');
// 			})
// 		}).catch(err => {
// 			console.log(err);
// 		})
// 	})
// }


//confirmed to work through server

//post request takes an object for body
// router.post('/driver', (ctx) => {
// 	Driver.location.create(ctx.request.body)
// 	.then(result => {
// 		Driver.count.update({city:result.city},{$inc:{count:1}})
// 		.then(count=>{
// 			console.log('completed');
// 		}).catch(err=>{
// 			console.log('uh o no good');
// 		})
// 	}).catch(err => {
// 		console.log(err);
// 	});
// })

//get request takes in a query string with lng and lat 
// router.get('/driver', (ctx) => {
// 	Driver.location.aggregate().near({
//       near: {
//       'type': 'Point',
//       'coordinates': [parseFloat(ctx.query.lng),parseFloat(ctx.query.lat)]
//       },
//       maxDistance: 1000,
//       spherical: true,
//       distanceField: "dis"
//      })﻿.limit(1).then(result=>{
//      	Driver.count.update({city:result.city},{$inc:{count:-1}})
//      	Driver.findByIdAndRemove({_id: result[0]._id})
//      	.then(result=>{
//      		console.log('deleted');
//      	})
//      }).catch(err =>{
//      	console.log(err);
//      });
// })





