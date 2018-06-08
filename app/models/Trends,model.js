var mongoose = require('mongoose');

var Cube_TrendsSchema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Cube_Ids: { type : Array , required : true },
    Trends_Tags: { type : Array , required : true },
    Trends_Text: { type : String },
    Shared_Trends: { type : String },
    Shared_Trends_User_Id: { type : String },
    Shared_Trends_Id: { type : String },
    Active_Status: String
    }, 
    { timestamps: true }
);

var Trends_TagsSchema = mongoose.Schema({
    Tag: { type : String , required : true },
    User_Id: { type : String , required : true },
    Trends_Ids: { type : Array , required : true },
    Active_Status: String
    }, 
    { timestamps: true }
);

var Trends_Emoteschema = mongoose.Schema({
    User_Ids: { type : Array , required : true },
    Trends_Id: { type : String , required : true },
    Emote_Text: { type : String, required : true },
    Count: Number,
    Active_Status: String
    }, 
    { timestamps: true }
);

var Trends_Commentschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Trends_Id: { type : String , required : true },
    Comment_Text: { type : String, required : true },
    Active_Status: String
    }, 
    { timestamps: true }
);

var Report_TrendsSchema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Trends_Id: { type : String , required : true },
    Report_Type: { type : String, required : true },
    Report_Text: { type : String },
    Active_Status: String
    }, 
    { timestamps: true }
);


var Report_Trends_Commentschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Comment_Id: { type : String , required : true },
    Report_Type: { type : String, required : true },
    Report_Text: { type : String },
    Active_Status: String
    }, 
    { timestamps: true }
);



var varCube_Trends = mongoose.model('Cube_Trends', Cube_TrendsSchema, 'Cube_Trends');

var varTrends_Tags = mongoose.model('Trends_Tags', Trends_TagsSchema, 'Trends_Tags');

var varTrends_Emote = mongoose.model('Trends_Emote', Trends_Emoteschema, 'Trends_Emote');

var varTrends_Comment = mongoose.model('Trends_Comment', Trends_Commentschema, 'Trends_Comment');

var varReport_Trends = mongoose.model('Report_Trends', Report_TrendsSchema, 'Report_Trends');

var varReport_Trends_Comment = mongoose.model('Report_Trends_Comment', Report_Trends_Commentschema, 'Report_Trends_Comment');



module.exports = {
    Cube_TrendsSchema : varCube_Trends,
    Trends_TagsSchema : varTrends_Tags,
    Trends_Emoteschema : varTrends_Emote,
    Trends_Commentschema : varTrends_Comment,
    Report_TrendsSchema : varReport_Trends,
    Report_Trends_Commentschema : varReport_Trends_Comment,
};