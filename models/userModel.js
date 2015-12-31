var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userModel = new Schema({
    login: {
        type: String
    },
    password: {
        type: String  
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String  
    },
    email: {
        type: String
    }
});

module.exports = mongoose.model('User', userModel);