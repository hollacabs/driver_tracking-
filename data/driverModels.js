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
		type: String
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
	Location.aggregate().near({
		near: {
			'type': 'Point',
			'coordinates': [parseFloat(longitude),parseFloat(latitude)]
			},
		maxDistance: 1000,
		spherical: true,
		distanceField: "dis"
		}).limit(1)
		.then(result=>{
			updateDriverCount(result[0].city, -1);
			removeById(result[0]._id);
			console.log('matched driver', result)
		}).catch(err=>{
			console.log('broken',err)
		})
}


let addDriver = (context) => {
	Location.create(context)
	.then(result => {
		console.log(result);
	}).catch(err =>{
		console.log(err);
	})
}

let updateDriverCount = (currentCity,updateCount) => {
	Count.update({city:currentCity},{$inc:{count:updateCount}})
	.then(count =>{
		console.log('completed count: ',count);
	}).catch(err=>{
		console.log('uh o no good',err);
	})
}

let removeById = (driverId) => {
	Location.findByIdAndRemove({_id:driverId})
	.then(result =>{
		console.log('deleted');
	}).catch(err =>{
		console.log(err);
	});
}


module.exports.findNearestDriver = findNearestDriver;
module.exports.location = Location; 
module.exports.count = Count;
module.exports.addDriver = addDriver;
module.exports.updateDriverCount = updateDriverCount;
module.exports.removeById = removeById; 


