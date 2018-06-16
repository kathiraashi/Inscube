var mongoose = require('mongoose');

   var LoginInfoSchema = mongoose.Schema({
        User_Id: { type : String, required : true},
        From: { type : Object, required : true },
        Ip: { type : Object, required : true },
        Device_Info: { type : Object },
        Active_Status: String
        }, 
        { timestamps: true }
    );

    var AndroidAppInfoSchema = mongoose.Schema({
        User_Id: { type : String, required : true },
        Firebase_Token: { type : Object, required : true },
        Ip: { type : String, required : true },
        Device_Info: { type : Object },
        Active_Status: String
        }, 
        { timestamps: true }
    );

    
    var AndroidVersionSchema = mongoose.Schema({
        DateTime: { type : String , },
        Version: { type : Number , },
        }, 
        { timestamps: true }
    );
        
    
    var varLoginInfo = mongoose.model('LoginInfo', LoginInfoSchema, 'LoginInfo');

    var varAndroidAppInfo = mongoose.model('AndroidAppInfo', AndroidAppInfoSchema, 'AndroidAppInfo');

    var varAndroidVersion = mongoose.model('AndroidVersion', AndroidVersionSchema, 'AndroidVersion');
    
    module.exports = {
        LoginInfoSchema : varLoginInfo,
        AndroidAppInfoSchema: varAndroidAppInfo,
        AndroidVersion : varAndroidVersion
    };