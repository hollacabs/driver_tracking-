require('newrelic');
let Koa = require('koa');
let bodyParser = require('koa-bodyparser');
let Router = require('koa-router');
let mongoose = require('mongoose');
let Driver = require('../data/driverModels.js');
let AWS = require('aws-sdk');
let Consumer = require('sqs-consumer');
let access = require('../config.json');
let cron = require('node-cron');
let path = require('path');

AWS.config.update({
  region: access.region,
  accessKeyId: access.accessKeyId,
  secretAccessKey: access.secretAccessKey
});
//AWS SQS
let sqs = new AWS.SQS({apiVersion: "2012-11-05"});
// AWS.config.loadFromPath(path.resolve(__dirname, '../config.json'));

let queueURLS = {
	driverMatch : 'https://sqs.us-west-1.amazonaws.com/642265802339/driverMatch',
	driverSignOn : 'https://sqs.us-west-1.amazonaws.com/642265802339/driverSignOn',
	driverSignOff : 'https://sqs.us-west-1.amazonaws.com/642265802339/driverSignOff', 
	sendDriverCount : "https://sqs.us-west-1.amazonaws.com/278687533626/drivers"
}

// example test { "pickUpLocation": [-97.72, 30.25] }
const driverMatch = Consumer.create({
	// queueUrl: 'https://sqs.us-west-1.amazonaws.com/642265802339/driverMatch',
	queueUrl: queueURLS.driverMatch,
	handleMessage: async (message, done) => {
		let incomingMessage = JSON.parse(message.Body);
		let longitude = incomingMessage.pickUpLocation[0]
		let latitude = incomingMessage.pickUpLocation[1]
		let closestDriver = await Driver.findNearestDriver(longitude,latitude);
		Driver.updateDriverCount(closestDriver[0].city, -1);
		Driver.removeById(closestDriver[0]._id)
		done();
	}
});
//example test {"city" : "denver", "currentLocation" : { "type" : "Point", "coordinates" : [ -104.88978433615523, 39.72585861269949 ]  }}
const driverSignOn = Consumer.create({
	// queueUrl: 'https://sqs.us-west-1.amazonaws.com/642265802339/driverSignOn',
	queueUrl: queueURLS.driverSignOn,
	handleMessage: (message, done) => {
		let incomingMessage = JSON.parse(message.Body);
		console.log('incomingMessage', incomingMessage)
		Driver.addDriver(incomingMessage);
		Driver.updateDriverCount(incomingMessage.city, 1);
		done();
	}
});
//example test {  "_id" : "5a7a26978e7beb4d43d673da", "city" : "denver", "currentLocation" : { "type" : "Point", "coordinates" : [ -104.88978433615523, 39.72585861269949 ]  } }
const driverSignOff = Consumer.create({
    // queueUrl: 'https://sqs.us-west-1.amazonaws.com/642265802339/driverSignOff',
    queueUrl: queueURLS.driverSignOff, 
    handleMessage: (message, done) => {
    	let incomingMessage = JSON.parse(message.Body);
    	console.log('parse', incomingMessage._id);
    	Driver.removeById(incomingMessage._id);
    	Driver.updateDriverCount(incomingMessage.city);
     done();
 	}
 })
//initiliaze queue and listener for driverMatch, driverSignon, and driverSignOff and error handle
driverMatch.on('error', (err) => {
  console.log(err.message);
});
driverSignOn.on('error', (err) => {
  console.log(err.message);
});
driverSignOff.on('error', (err) => {
  console.log(err.message);
})
//initialize queues for driverMatch, driverSignOn, and driverSignOff
driverMatch.start();
driverSignOn.start();
driverSignOff.start();

// var sendCityCounts = async (msgBody, queueUrl) => {
//   let citiesCount = await msgBody()
//   var params = {
//     MessageBody: JSON.stringify(citiesCount),
//     QueueUrl: queueUrl,
//     DelaySeconds: 0
//   };
//     sqs.sendMessage(params, function(err, data) {
//       if(err) {
//       	console.log(err)
//       	return err;
//       }
//       else {
//         console.log('received data',data);
//         return data; 
//       }  
//   });
// };

//CRON JOB FOR DEEEEE CROSSSSS, sending driver count to Derrick
// cron.schedule('* */1 * * *', function(){
//   console.log('running a task every hour');
//   sendCityCounts(Driver.citiesTotalCount, queueURLS.sendDriverCount); 
// });


//initializing Koa and running routes ---------------
let app = new Koa();
let router = new Router(); 
app.use(router.routes())

//connecting to MongoDB with uber as our DB -----------------
mongoose.connect('mongodb://localhost/uber', function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Server successfully!');
    }
});

mongoose.Promise = global.Promise;
//Using middlewear such as body parser
router.use(bodyParser());

//Initilizing server, listening on port 4000
app.listen(process.env.port || 4000, () => { 
	console.log("Koa is listening on port 4000");
});


router.get('/drivercount/:city', async (ctx) => {
	console.log(ctx.params.city);
	try {
		let getCount = await Driver.getCount(ctx.params.city)
		ctx.body = getCount[0].count;
		ctx.status = 200;
	} catch (err) {
		ctx.status = 404;
		return err
	}
})

router.post('/driver', async (ctx) => {
	try {
		let add = Driver.addDriver(ctx.request.body);
		let updateCount = Driver.updateDriverCount(ctx.request.body.city,1);
		let result = await Promise.all([add, updateCount]);
		ctx.status = 201;
	} catch (err) {
		ctx.status = 404;
		return err;
	}
})

router.delete('/driver', async (ctx) => {
	console.log(ctx.request.body, 'kjl;adsfljadlsfadflsaldflsa;dfsadflsals;fdl;s')
	try {
		let removeId = Driver.removeById(ctx.request.body._id);
		let updateCount = Driver.updateDriverCount(ctx.request.body.city, -1);
		let result = await Promise.all([removeId, updateCount]);
		// let updateCount = Driver.updateDriverCount(ctx,-1);
		// let result = await Promise.all([remove, updateCount]);
		ctx.status = 200;
	} catch (err) {
		ctx.status = 404;
		return err;
	}
})

module.exports = app;

//get request takes in a query string with lng and lat, ride matches driver/user, deletes driver, and updates city count by decrementing 1
	//example string query would be http://localhost:4000/driver/?lng=-122.5&lat=37.7
// router.get('/driver', async (ctx) => {
// 	try {
// 		let longitude = ctx.query.lng;
// 		let latitude = ctx.query.lat;
// 		let closestDriver = await Driver.findNearestDriver(longitude,latitude);
// 		ctx.body = closestDriver;
// 		// console.log('found driver and matched');
// 		// let updateCount = Driver.updateDriverCount(closestDriver[0].city,-1); 
// 		Driver.removeById(closestDriver[0]._id);
// 		// console.log('deleted specific id after matching driver to user')
// 		// let result = await Promise.all([updateCount,removeId]);
// 		ctx.status = 200; 
// 		// console.log('anything in the body',closestDriver);
// 	} catch (err) {
// 		console.log(err)
// 		ctx.status = 404;
// 	}
// })

// post request takes an object for body
// 	posts driver into driver db and decrements one from drivercount db.
//delete takes in a request object 
	//removes driver completley from driver db and decrements ne from drivercount db. 


//// SQS THAT TAKES IN ALL MESSAGES

// const DriverTrackingService = Consumer.create({
//   queueUrl: 'https://sqs.us-west-1.amazonaws.com/642265802339/DriverTrackingService',
//   handleMessage: async (message, done) => {
//     let incomingMessage = JSON.parse(message.Body);
//     //if pickuplocation exists, user is looking for driver to match. 
//     //get from albert
//     if(incomingMessage.pickUpLocation){
// 		let longitude = incomingMessage.pickUpLocation[0]
// 		let latitude = incomingMessage.pickUpLocation[1]
// 		let closestDriver = await Driver.findNearestDriver(longitude,latitude);
// 		Driver.updateDriverCount(closestDriver[0].city, -1);
// 		Driver.removeById(closestDriver[0]._id)
// 	//delete the driver, get rid from db
//     } else if (incomingMessage._id){
//     	Driver.removeById(incomingMessage._id)
//     	Driver.updateDriverCount(incomingMessage.city, -1)
//     //user signs on, add to db
//     } else if (incomingMessage.city){
//     	console.log('trying to add driver');
//     	Driver.addDriver(incomingMessage);
//     	Driver.updateDriverCount(incomingMessage.city, 1);
//     }
//     done();
//   }
// });
// DriverTrackingService.on('error', (err) => {
//   console.log(err.message);
// });
// DriverTrackingService.start();






