var mongoose = require('mongoose');

var Cube_CategorySchema = mongoose.Schema({
    Name: { type : String , required : true, unique: true },
    Image: { type : String , lowercase: true, required : true, unique: true },
    }, 
    { timestamps: true }
);

var CubesSchema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Name: { type : String , required : true },
    Image: { type : String , required : true },
    Category_Id: { type : String , required : true},
    Security: { type : String , required : true },
    Security_Code: { type : String },
    Description: { type : String },
    Location: { type : String },
    Country: { type : Object },
    State: { type : Object },
    City: { type : Object },
    Web: String,
    Mail: String,
    Contact: String,
    Active_Status: String
    }, 
    { timestamps: true }
);

var Cube_Topicschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Cube_Id: { type : String , required : true },
    Name: { type : String , required : true },
    Description: { type : String },
    Attachments: { type : Array },
    Active_Status: String
    }, 
    { timestamps: true }
);

var Cube_Followersschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Cube_Id: { type : String , required : true },
    Active_Status: String
    }, 
    { timestamps: true }
);


var varCube_Category = mongoose.model('Cube_Category', Cube_CategorySchema, 'Cube_Category');

var varCubes = mongoose.model('Cubes', CubesSchema, 'Cubes');

var varCube_Topics= mongoose.model('Cube_Topics', Cube_Topicschema, 'Cube_Topics');

var varCube_Followers = mongoose.model('Cube_Followers', Cube_Followersschema, 'Cube_Followers');

module.exports = {
    Cube_CategorySchema : varCube_Category,
    CubesSchema : varCubes,
    Cube_Topicschema : varCube_Topics,
    Cube_Followersschema: varCube_Followers
};