let data = require('../data/driverModels')
let app = require('../server/mongoIndex.js')
var agent = require('supertest-koa-agent');
var api = agent(app);

test('response should be 201', async (done) => {
	let response = await api.post('/driver')
		.set('Accept', 'application/json')
		.send({"city" : "denver", "currentLocation" : { "type" : "Point","coordinates" : [ -104.88978433615523, 39.72585861269949 ]}})
       expect(response.status).toBe(201);
       done();
});


test('response should be 404', async (done) => {
	let response = await api.post('/driver')
	   .set('Accept', 'application/json')
	   .send([123,undefined,null])
       expect(response.status).toBe(404);
       done();
});

test('get request to any city should be a number and greater than 0', (done) => {
    api.get('/drivercount/sanFrancisco').then((ctx) => {
        expect(typeof ctx.body).toBe('number');
        expect(ctx.body).toBeGreaterThan(0);
        expect(ctx.status).toBe(200);
        done();
    })
});

test('expect this to be 404 for get', (done) => {
	var wrongInput = {city:'sanFrancisco'}
    api.get(`/drivercount/${wrongInput}`).then((ctx) => {
        expect(ctx.status).toBe(404);
        done();
    })
});

test('this delete request should be 404 status', async (done) => {
    let response = await api.delete('/driver')
		.set('Accept', 'application/json')
		.send([123,undefined,null])
       expect(response.status).toBe(404);
       done();
  //   let currentCityCount = await data.count.find({city:driver.city}); 
  //   let newCityCount = await data.count.find({city:driver.city})
		// console.log(currentCityCount, newCityCount);
});

test('this delete request should be 200 status', async (done) => {
    let response = await api.delete('/driver')
		.set('Accept', 'application/json')
		.send({"_id" : "5a7a26978e7beb4d43d673da","city" : "denver", "currentLocation" : { "type" : "Point","coordinates" : [ -104.88978433615523, 39.72585861269949 ]}})
       expect(response.status).toBe(200);
       done();
  //   let currentCityCount = await data.count.find({city:driver.city}); 
  //   let newCityCount = await data.count.find({city:driver.city})
		// console.log(currentCityCount, newCityCount);
});


test('returns driver object with proper properties and distance closer than 1000m', (done) => {
    data.findNearestDriver(-97.72, 30.25).then((driver) => {
        expect(driver[0]._id).not.toBeUndefined()
        expect(typeof driver[0].city).toBe('string');
        expect(typeof driver[0].currentLocation).toBe('object');
        expect(driver[0].currentLocation.coordinates[0]).toBeLessThan(0);
        expect(driver[0].currentLocation.coordinates[1]).toBeGreaterThan(0);
        expect(driver[0].currentLocation.type).toBe('Point');
        expect(driver[0].dis).toBeLessThan(1000);
        expect.objectContaining({
      		_id: expect.any(Object),
      		city: expect.any(String),
      		currentLocation: expect.any(Object),
      		dis: expect.any(Number)
    	})
        done();
    })
});

test('add driver to DB, driver gets new ID assigned', (done) => {

	let newDriver = {"city" : "denver", "currentLocation" : { "type" : "Point", "coordinates" : [ -104.88978433615523, 39.72585861269949 ]}}
    
    data.addDriver(newDriver).then((driver) => {
        expect(driver._id).not.toBeUndefined()
        expect(driver.city).toBe(newDriver.city);
        expect(typeof driver.currentLocation).toBe('object');
        expect(driver.currentLocation.coordinates[0]).toBe(newDriver.currentLocation.coordinates[0]);
        expect(driver.currentLocation.coordinates[1]).toBe(newDriver.currentLocation.coordinates[1]);
        expect(driver.currentLocation.type).toBe('Point');
        expect.objectContaining({
      		_id: expect.any(Object),
      		city: expect.any(String),
      		currentLocation: {type:'Point', coordinates:[expect.any(Number), expect.any(Number)]}
    	})
        done();
    })
});

test('testing updated city count', async (done) => {
	let city = 'sanFrancisco';
	let oldCount = await data.getCount(city);
	let updatedCount = await data.updateDriverCount(city,1)
	//updated city count, by incrementing 1
	data.getCount(city).then((newer) => {
		expect(typeof newer[0].count).toBe('number');
		expect(newer[0].count).toBeGreaterThan(oldCount[0].count);
		expect(newer[0].count).toBe(oldCount[0].count+=1);
		done();
	})
});

test('remove id and make sure its not available on the DB anymore', async (done) => {

	let driver = {"city" : "denver", "currentLocation" : { "type" : "Point", "coordinates" : [ -104.88978433615523, 39.72585861269949 ]}}
	
	let addNewDriver = await data.addDriver(driver);
	let driverConfirmed = await data.location.find({_id:addNewDriver._id})
		//found driver
		expect(driverConfirmed.length).toBe(1);
		expect(driverConfirmed[0].city).toBe(addNewDriver.city);
		expect.objectContaining({
      		_id: expect.any(Object),
      		city: expect.any(String),
      		currentLocation: {type:'Point', coordinates:[expect.any(Number), expect.any(Number)]}
    	})
	
	await data.removeById(driverConfirmed[0]._id);
	let driverRemoved = await data.location.find({_id:driverConfirmed._id})
	
		expect(driverRemoved.length).toBe(0)
		expect(driverRemoved._id).toBeUndefined();
		expect(driverRemoved.city).toBeUndefined();
		expect(driverRemoved.currentLocation).toBeUndefined();

	done();
})

test('get counts for all cities', async (done) => {
	let getAllCityCounts = await data.citiesTotalCount()
	expect(getAllCityCounts.length).toBeGreaterThan(30)
	expect(typeof getAllCityCounts[6].city).toBe('string');
	expect.objectContaining({
		city: expect.any(String),
		count: expect.any(Number)
	})
	done()
})






