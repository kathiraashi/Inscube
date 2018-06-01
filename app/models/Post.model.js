var mongoose = require('mongoose');

var Cube_Postschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Post_Category: { type : String , required : true },
    Cubes_Id: { type : Array , required : true },
    Post_Link: { type : String },
    Post_Link_Info: { type : Object },
    Post_Text: { type : String },
    Shared_Post: { type : String },
    Shared_Post_User_Id: { type : String },
    Shared_Post_Id: { type : String },
    Attachments: { type : Array },
    Active_Status: String
    }, 
    { timestamps: true }
);

var Post_Emoteschema = mongoose.Schema({
    User_Ids: { type : Array , required : true },
    Post_Id: { type : String , required : true },
    Emote_Text: { type : String, required : true },
    Count: Number,
    Active_Status: String
    }, 
    { timestamps: true }
);

var Post_Commentschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Post_Id: { type : String , required : true },
    Comment_Text: { type : String, required : true },
    Active_Status: String
    }, 
    { timestamps: true }
);


var Report_Postschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Post_Id: { type : String , required : true },
    Report_Type: { type : String, required : true },
    Report_Text: { type : String },
    Active_Status: String
    }, 
    { timestamps: true }
);

var Report_Commentschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    Comment_Id: { type : String , required : true },
    Report_Type: { type : String, required : true },
    Report_Text: { type : String },
    Active_Status: String
    }, 
    { timestamps: true }
);

var Report_Userschema = mongoose.Schema({
    User_Id: { type : String , required : true },
    To_User_Id: { type : String , required : true },
    Report_Type: { type : String, required : true },
    Report_Text: { type : String },
    Active_Status: String
    }, 
    { timestamps: true }
);

var varCube_Posts = mongoose.model('Cube_Posts', Cube_Postschema, 'Cube_Posts');

var varPost_Emote = mongoose.model('Post_Emote', Post_Emoteschema, 'Post_Emote');

var varPost_Comment = mongoose.model('Post_Comment', Post_Commentschema, 'Post_Comment');

var varReport_Post = mongoose.model('Report_Post', Report_Postschema, 'Report_Post');

var varReport_Comment = mongoose.model('Report_Comment', Report_Commentschema, 'Report_Comment');

var varReport_User = mongoose.model('Report_User', Report_Userschema, 'Report_User');

module.exports = {
    Cube_Postschema : varCube_Posts,
    Post_Emoteschema : varPost_Emote,
    Post_Commentschema : varPost_Comment,
    Report_Postschema : varReport_Post,
    Report_Commentschema : varReport_Comment,
    Report_Userschema : varReport_User,
};