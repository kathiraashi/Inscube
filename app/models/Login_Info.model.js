var mongoose = require('mongoose');

   var LoginInfoSchema = mongoose.Schema({
        User_Id: { type : String, required : true},
        From: { type : Object, required : true },
        Ip: { type : Object, required : true },
        Device_Info: { type : Object },
        Active_States: String
        }, 
        { timestamps: true }
    );

    var AndroidAppInfoSchema = mongoose.Schema({
        User_Id: { type : String, required : true },
        Firebase_Token: { type : Object, required : true },
        Ip: { type : String, required : true },
        Device_Info: { type : Object },
        Active_States: String
        }, 
        { timestamps: true }
    );
    
    
    var varLoginInfo = mongoose.model('LoginInfo', LoginInfoSchema, 'LoginInfo');

    var varAndroidAppInfo = mongoose.model('AndroidAppInfo', AndroidAppInfoSchema, 'AndroidAppInfo');

    module.exports = {
        LoginInfoSchema : varLoginInfo,
        AndroidAppInfoSchema: varAndroidAppInfo
    };