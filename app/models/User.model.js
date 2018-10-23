var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = mongoose.Schema({
    Inscube_Name: { type : String , required : true, unique: true },
    Email: { type : String , lowercase: true, required : true, unique: true },
    Password: { type : String , required : true },
    DOB: { type : String },
    Country: { type : Object },
    State: { type : Object },
    City: { type : Object },
    Gender: String,
    Color_Code: String,
    Image: String,
    Hash_Tag_1: String,
    Hash_Tag_2: String,
    Hash_Tag_3: String,
    Show_Profile_To: String,
    Active_Status: String,
    Email_Verify_Token: String,
    Privacy_Update_Checked: String,
    Explainer_Completed: Boolean
    }, 
    { timestamps: true }
);

var CountrySchema = mongoose.Schema({
    Continent_GeoNameId: { type : Number },
    Country_GeoNameId: { type : Number },
    Country_Code: { type : String },
    Country_Name: { type : String },
    Country_Lat: { type : String },
    Country_Lng: { type : String },
 });
 
 var StateSchema = mongoose.Schema({
    State_GeoNameId: { type : Number },
    State_Name: { type : String },
    State_Lat: { type : String },
    State_Lng: { type : String },
    Country_GeoNameId: { type : Number },
    Country_DatabaseId: { type: Schema.Types.ObjectId, ref: 'Global_Country' },
 });
 
 var CitySchema = mongoose.Schema({
    City_GeoNameId: { type : Number },
    City_Name: { type : String },
    City_Lat: { type : String },
    City_Lng: { type : String },
    Country_GeoNameId: { type : Number },
    State_GeoNameId: { type : Number },
    Country_DatabaseId: [{ type: Schema.Types.ObjectId, ref: 'Global_Country' }],
    State_DatabaseId: [{ type: Schema.Types.ObjectId, ref: 'Global_State' }],
 });


var Post_NotificationSchema = mongoose.Schema({
    User_Id: { type : String , required : true },
    To_User_Id: { type : String , required : true },
    Notify_Type: { type : String, required : true },
    Capture_Id: { type : String },
    Capture_Text: { type : String },
    Trends_Id: { type : String },
    Trends_Text: { type : String },
    Trends_Tags: { type : Array },
    Post_Id: { type : String },
    Post_Type: { type : String },
    Cube_Id: { type : String },
    Cube_Ids: { type : Array },
    Emote_Id: { type : String },
    Opinion_Id: { type : String },
    Emote_Text: { type : String },
    View_Status: Number,
    Active_Status: String
    }, 
    { timestamps: true }
);


var varUsers = mongoose.model('Users', UserSchema, 'Users');

var VarGlobal_Country = mongoose.model('Global_Country', CountrySchema, 'Global_Country');
var VarGlobal_State = mongoose.model('Global_State', StateSchema, 'Global_State');
var VarGlobal_City = mongoose.model('Global_City', CitySchema, 'Global_City');


var varPost_Notification = mongoose.model('Post_Notification', Post_NotificationSchema, 'Post_Notification');


module.exports = {
    UserSchema : varUsers,
    Global_Country : VarGlobal_Country,
    Global_State : VarGlobal_State,
    Global_City : VarGlobal_City,
    Post_NotificationSchema: varPost_Notification
};