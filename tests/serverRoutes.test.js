let data = require('../data/driverModels')
let app = require('../server/mongoIndex.js')
var agent = require('supertest-koa-agent');
var api = agent(app);

test('response should be 201', (done) => {
    api.post('/driver').then((ctx) => {
        expect(ctx.status).toBe(201);
        done();
    })
});

test('get request to any city should be a number and greater than 0', (done) => {
    api.get('/drivercount/sanFrancisco').then((ctx) => {
        expect(typeof ctx.body).toBe('number');
        expect(ctx.body).toBeGreaterThan(0);
        done();
    })
});

test('delete request should be 200 status', (done) => {
    api.delete('/driver').then((ctx) => {
        expect(ctx.status).toBe(200);
        done();
    })
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

	let newDriver = {"city" : "denver", "currentLocation" : { "type" : "Point", "coordinates" : [ -104.88978433615523, 39.72585861269949 ] }}
    
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
	var city = 'sanFrancisco';
	let oldCount = await data.getCount(city);
	let updatedCount = await data.updateDriverCount(city,1)
	//updated city count, by incrementing 1
	data.getCount(city).then((newer) => {
		expect(typeof newer[0].count).toBe('number');
		console.log(oldCount[0].count);
		expect(newer[0].count).toBeGreaterThan(oldCount[0].count);
		expect(newer[0].count).toBe(oldCount[0].count+=1);
		done();
	})
});




