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
    Show_Profile_To: String,
    Active_Status: String,
    Email_Verify_Token: String,
    Privacy_Update_Checked: String
    }, 
    { timestamps: true }
);

var Post_NotificationSchema = mongoose.Schema({
    User_Id: { type : String , required : true },
    To_User_Id: { type : String , required : true },
    Notify_Type: { type : String, required : true },
    Capture_Id: { type : String },
    Capture_Text: { type : String },
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

var varPost_Notification = mongoose.model('Post_Notification', Post_NotificationSchema, 'Post_Notification');

module.exports = {
    UserSchema : varUsers,
    Post_NotificationSchema: varPost_Notification
};