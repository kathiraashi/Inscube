var mongoose = require('mongoose');

var Cube_Captureschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Cube_Ids: { type : Array , required : true },
    Capture_Video: { type : Object },
    Capture_Text: { type : String },
    Shared_Capture: { type : String },
    Shared_Capture_User_Id: { type : String },
    Shared_Capture_Id: { type : String },
    Active_Status: String
    }, 
    { timestamps: true }
);

var Capture_Emoteschema = mongoose.Schema({
    User_Ids: { type : Array , required : true },
    Capture_Id: { type : String , required : true },
    Emote_Text: { type : String, required : true },
    Count: Number,
    Active_Status: String
    }, 
    { timestamps: true }
);

var Capture_Commentschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Capture_Id: { type : String , required : true },
    Comment_Text: { type : String, required : true },
    Active_Status: String
    }, 
    { timestamps: true }
);

var Report_Captureschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Capture_Id: { type : String , required : true },
    Report_Type: { type : String, required : true },
    Report_Text: { type : String },
    Active_Status: String
    }, 
    { timestamps: true }
);


var Report_Capture_Commentschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Comment_Id: { type : String , required : true },
    Report_Type: { type : String, required : true },
    Report_Text: { type : String },
    Active_Status: String
    }, 
    { timestamps: true }
);



var varCube_Captures = mongoose.model('Cube_Captures', Cube_Captureschema, 'Cube_Captures');

var varCapture_Emote = mongoose.model('Capture_Emote', Capture_Emoteschema, 'Capture_Emote');

var varCapture_Comment = mongoose.model('Capture_Comment', Capture_Commentschema, 'Capture_Comment');

var varReport_Capture = mongoose.model('Report_Capture', Report_Captureschema, 'Report_Capture');

var varReport_Capture_Comment = mongoose.model('Report_Capture_Comment', Report_Capture_Commentschema, 'Report_Capture_Comment');



module.exports = {
    Cube_Captureschema : varCube_Captures,
    Capture_Emoteschema : varCapture_Emote,
    Capture_Commentschema : varCapture_Comment,
    Report_Captureschema : varReport_Capture,
    Report_Capture_Commentschema : varReport_Capture_Comment,
};