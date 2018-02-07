let async = require('async');
let Koa = require('koa');
let bodyParser = require('koa-bodyparser');
let Router = require('koa-router');
let db = require('../data/datageneration.js');
let fs = require('fs');
let cassQuery = require('../data/cassQuery.js');

let app = new Koa();
let router = new Router(); 


router.use(bodyParser());
app.use(router.routes())

let port = 3000;

app.listen(port, () => { 
	// driverCount(0,10);
	console.log("Koa is listening on port 3000");
});

router.post('/driver', (ctx) => {
	let driver = ctx.request.body
	cassQuery.addDriver(driver);
})

router.delete('/driver/', (ctx) => {
	let driver = ctx.request.body
	cassQuery.removeDriver(driver);
})

// let driverMatchByCity = (city) => {
// 	let startTime = new Date();
// 	let query = "SELECT * from driverdetails WHERE city= ?";
// 	let params = [city];
// 	client.execute(query, params) 
//   	.then(function(result){
//   		console.log(result.rows[0]); 
//   	})
// }; 

// let driverCount = (start,end) => {
// 	let cities = Object.keys(db.coordinates);
// 	for (var i=start; i< end; i++){
// 			let closureCity = cities[i];
// 			let query = 'SELECT COUNT(*) from driverdetails WHERE city=?';
// 			client.execute(query, [closureCity], {prepare:true})
// 			.then(result => {
// 				insertCount(closureCity, result)
// 			}).catch(err => {
// 				console.log('drivercount error',err);
// 			})
// 	}
// }

// let insertCount = (city,result) => {
// 	let cityCount = result.rows[0].count; 
// 	let insertQuery = 'INSERT INTO driverCount (city, count) VALUES (?, ?)';
// 		client.execute(insertQuery, [city, cityCount], {prepare:true})
// 		.then(result => {
// 			console.log('inserted', city+':'+cityCount);
// 		}).catch(err => {
// 			console.log('insertcount error',err);
// 		})
// }
