const express = require ('express');
const router = express.Router();
const Driver = require('../data/driverModels.js');

// get a list of Driver from the db
router.get('/driver', function(req, res, next){
    Driver.find({}).then(result =>{
        res.send(result)
    });
    // Driver.geoNear(
    //     {type: 'Point', coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)]},
    //     {maxDistance: 100000, spherical: true}
    // ).then(function(driver){
    //     res.send(driver);
    // }).catch(next);
});

// add a new Driver to the db
router.post('/driver', function(req, res, next){
    Driver.create(req.body).then(function(Driver){
        res.send(Driver);
    }).catch(next);
});



module.exports = router;
