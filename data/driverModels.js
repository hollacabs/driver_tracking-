const mongoose = require('mongoose')
const Schema = mongoose.Schema;
//create driver location schema and & model

const GeoSchema = new Schema({
    type: {
        type: String,
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        index: '2dsphere'
    }
});

const DriverSchema = new Schema({
	driverId: {
		type: Number
	},
	city: {
		type: String,
		required: true
	},
	currentLocation: GeoSchema 
})

const DriverCountSchema = new Schema({
	city: {
		type: String,
		required: true
	},
	count: {
		type: Number
	}
})

const Location = mongoose.model('driver', DriverSchema);
const Count = mongoose.model('driverCount', DriverCountSchema);

let findNearestDriver = (longitude,latitude) => {
	return Location.aggregate().near({
		near: {
			'type': 'point',
			'coordinates': [parseFloat(longitude),parseFloat(latitude)]
			},
		maxDistance: 500,
		spherical: true,
		distanceField: "dis"
		}).limit(1)
		.then(result=>{
			// updateDriverCount(result[0].city, -1);
			// removeById(result[0]._id);
			console.log('match driver to user', result)
			return result;
		}).catch(err=>{
			return err;
		})
}


let addDriver = (requestBody) => {
	// let driver = ctx.request.body
	console.log('this is the ctx request body', requestBody)
	return Location.create(requestBody)
	.catch(err => {
		throw err;
	}).then(result =>{
		return result;
	})
}

let updateDriverCount = (city,updateCount) => {
	return Count.update({city:city},{$inc:{count:updateCount}})
	.then(count =>{
		return count;
	}).catch(err=>{
		console.log('updateDriverCount',err);
		throw err;
	})
}

let removeById = (id) => {
	return Location.findByIdAndRemove({_id:id})
	.then(result =>{
		console.log('confirmed to be found by id and deleted without error', result)
		return result;
	}).catch(err =>{
		throw err;
	});
}

//cron job
let citiesTotalCount = () => {
	return Count.find()
	.then(result => {
		// console.log('found total city count', result);
		return result;
	}).catch (err => {
		return err;
	})
}

let getCount = (city) => {
	return Count.find({city:city})
	.catch(err => {
		throw err
	}).then(result => {
		return result 
	})
}

module.exports.citiesTotalCount = citiesTotalCount; 
module.exports.findNearestDriver = findNearestDriver;
module.exports.location = Location; 
module.exports.count = Count;
module.exports.addDriver = addDriver;
module.exports.updateDriverCount = updateDriverCount;
module.exports.removeById = removeById; 
module.exports.getCount = getCount; 

// alternatve way to remove

// let removeById = (id) => {
// 	Location.remove({_id:id})
// 	.then(result => {
// 		console.log(result);
// 		return result;
// 	}).catch(err => {
// 		return err;
// 	})
// }

// let removeById = (ctx) => {
// 	let driverId = ctx.request.body._id;
// 	Location.findByIdAndRemove({_id:driverId})
// 	.then(result =>{
// 		updateDriverCount(result.city, -1)
// 		return result;
// 	}).catch(err =>{
// 		return err;
// 	});
// }

// let findNearestDriver = (longitude,latitude) => {
// 	Location.aggregate().near({
// 		near: {
// 			'type': 'Point',
// 			'coordinates': [parseFloat(longitude),parseFloat(latitude)]
// 			},
// 		maxDistance: 2000,
// 		spherical: true,
// 		distanceField: "dis"
// 		}).limit(1)
// 		.then(result=>{
// 			updateDriverCount(result[0].city, -1);
// 			removeById(result[0]._id);
// 			console.log('match driver to user', result)
// 			return result;
// 		}).catch(err=>{
// 			return err;
// 		})
// }

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


