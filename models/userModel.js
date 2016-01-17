var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userModel = new Schema({
    login: {
        type: String
    },
    email: {
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
    }
});

userModel.pre('save', function(next) {
    var user = this;
    
    if(!user.isModified('password')) return next();
    
    bcrypt.genSalt(10, function(err, salt) {
       if(err) return next(err);
        
        bcrypt.hash(user.password, salt, null, function(err, hash) {
           if(err) return next(err);
            
            user.password = hash;
            next();
        });
    });
});

module.exports = mongoose.model('User', userModel);