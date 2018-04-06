var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    Inscube_Name: { type : String , required : true, unique: true },
    Email: { type : String , lowercase: true, required : true, unique: true },
    Password: { type : String , required : true },
    DOB: { type : String },
    City: { type : String },
    Country: { type : String },
    Gender: String,
    Color_Code: String,
    Image: String,
    Hash_Tag_1: String,
    Hash_Tag_2: String,
    Hash_Tag_3: String,
    Active_Status: String
    }, 
    { timestamps: true }
);

var varUsers = mongoose.model('Users', UserSchema, 'Users');

module.exports = {
    UserSchema : varUsers
};