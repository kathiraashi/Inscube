var UserModel = require('../models/User.model.js');
var LoginInfoModel = require('../models/Login_Info.model.js');

var CaptureModel = require('../models/Capture,model.js');
var PostModel = require('../models/Post.model.js');
var TrendsModel = require('../models/Trends,model.js');

var ErrorManagement = require('./../../app/config/ErrorHandling.js');
var parser = require('ua-parser-js');
var get_ip = require('ipware')().get_ip;
var multer = require('multer');

var CubeModel = require('../models/Cubes.model.js');


var api_key = 'key-1018902c1f72fc21e3dc109706b593e3';
var domain = 'www.inscube.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});


// User Image Upload Disk Storage and Validate Functions ----------------------------------------------------------------------------------------
var User_Image_Storage = multer.diskStorage({
        destination: (req, file, cb) => { cb(null, './Uploads/Users'); },
        filename: (req, file, cb) => { cb(null, 'User_' + Date.now() + '.png'); }
    });
var User_Image_Upload = multer({
        storage: User_Image_Storage,
        fileFilter: function (req, file, callback) {
            let extArray = file.originalname.split(".");
            let extension = (extArray[extArray.length - 1]).toLowerCase();
            if(extension !== 'png' && extension !== 'jpg' && extension !== 'gif' && extension !== 'jpeg') {
                return callback("Only 'png, gif, jpg and jpeg' images are allowed");
            }
            callback(null, true);
        }
    }).single('image');
    

    

// ---------------------------------------------------------------------- Inscube Name Validate ----------------------------------------------------------
exports.InscubeNameValidate = function(req, res) {

    var Inscube_NameValidater = /inscube/gi;
    if(!Inscube_NameValidater.test(req.params.Inscube_Name)){
        var Ins_name = req.params.Inscube_Name;
            Ins_name = Ins_name.replace(/@/gi, "");
        UserModel.UserSchema.findOne({'Inscube_Name': '@' + Ins_name}, function(err, data) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Inscube Name Validate Query Error', 'SignIn_SignUp.controller.js - 11', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Validate The Inscube Name."});
            } else {
                if(data === null){
                    res.status(200).send({ Status:"True", Output: "True", Available: "True" });
                }else{
                    res.status(200).send({ Status:"True", Output: "True", Available: "False" });
                } 
            }
        });
    }else {
        res.status(200).send({ Status:"True", Output: "True", Available: "False" });
    }
};

// ---------------------------------------------------------------------- User Email Validate ----------------------------------------------------------
exports.UserEmailValidate = function(req, res) {
    var EmailValidater = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(EmailValidater.test(req.params.Email)){
        UserModel.UserSchema.findOne({'Email': req.params.Email.toLowerCase()}, function(err, data) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Email Validate Query Error', 'SignIn_SignUp.controller.js - 11', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Validate The User E-mail."});
            } else {
                if(data === null){
                    res.status(200).send({ Status:"True", Output: "True", Available: "True" });
                }else{
                    res.status(200).send({ Status:"True", Output: "True", Available: "False" });
                } 
            }
        });
    }else {
        res.status(200).send({ Status:"True", Output: "False", Message: 'Invalid Email Format!' });
    }
};

// ---------------------------------------------------------------------- Countries List----------------------------------------------------------
exports.Country_List = function(req, res) {
    UserModel.Global_Country.find({}, {Country_Name: 1}, {}, function(err, result) {
        if(err) {
            res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Find the Country List"});           
        } else {
            res.status(200).send({ Status:"True", Output: "True", Response: result });
        }
    });
};

// ---------------------------------------------------------------------- States List ----------------------------------------------------------
exports.State_List = function(req, res) {
    if(!req.params.Country_Id || req.params.Country_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Country Id can not be empty" });
    }else{
        UserModel.Global_State.find({ Country_DatabaseId: req.params.Country_Id }, { State_Name: 1}, {}, function(err, result) {
            if(err) {
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Find the State List"});           
            } else {
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
    }
};

// ---------------------------------------------------------------------- Cities List ----------------------------------------------------------
exports.City_List = function(req, res) {
    if(!req.params.State_Id || req.params.State_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "State Id can not be empty" });
    }else{
        UserModel.Global_City.find({ State_DatabaseId: req.params.State_Id }, { City_Name: 1}, {}, function(err, result) {
            if(err) {
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Find the City List"});           
            } else {
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
    }
};

// ---------------------------------------------------------------------- User Register ---------------------------------------------------------------
exports.UserRegister = function(req, res) {
    if(!req.body.Inscube_Name || req.body.Inscube_Name === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Inscube Name can not be empty" });
    }else if(!req.body.Email || req.body.Email === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Email can not be empty" });
    }else if(!req.body.Password || req.body.Password === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Password can not be empty" });
    }else{
        var Ins_name = req.body.Inscube_Name;
            Ins_name = Ins_name.replace(/@/gi, "");
        var varUserSchema = new UserModel.UserSchema({
            Inscube_Name: '@' + Ins_name,
            Email: req.body.Email,
            Password: req.body.Password,
            Color_Code: '',
            Image: 'UserImage.png',
            DOB: '',
            City: {},
            Country: {},
            State: {},
            Gender: '',
            Hash_Tag_1: '',
            Hash_Tag_2: '',
            Hash_Tag_3: '',
            Show_Profile_To : 'Everyone',
            Active_Status: 'Active'
        });
        varUserSchema.save(function(err, result) { // User Creation -----------------------------
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Query Error', 'SignIn_SignUp.controller.js - 51', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while User Register"});           
            } else {
                result = JSON.parse(JSON.stringify(result));
                delete result.Password;
                
                var getIp = get_ip(req);
                    getIp = getIp.clientIp;
                    getIp = getIp.split(':');
                var Ip = getIp[getIp.length - 1];
                var DeviceInfo = parser(req.headers['user-agent']);
                var Req_From = 'Web';
                if (req.body.Firebase_Token) { Req_From = 'App'; }

                var varLoginInfoSchema = new LoginInfoModel.LoginInfoSchema({
                    User_Id: result._id,
                    From: Req_From,
                    Ip: Ip,
                    Device_Info: DeviceInfo,
                    Active_Status: 'Active'
                });
                varLoginInfoSchema.save(function(err_0, result_0) { // Login Info Creation  -----------------------------
                    if(err_0) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Login Info Save Query Error', 'SignIn_SignUp.controller.js - 71', err_0);
                        res.status(200).send({ Status:"True", Output:"True", Response: result, Message: "Login Info Create Error! " });          
                    } else {
                        if (req.body.Firebase_Token) { // Register from App  -----------------------------
                            LoginInfoModel.AndroidAppInfoSchema.findOne({'Firebase_Token': req.body.Firebase_Token}, function(err_1, result_1) {
                                if(err_1) {
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Android App Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err_1);
                                    res.status(200).send({ Status:"True", Output:"True", Response: result, Message: "Android App Info Find Error! " });
                                } else {
                                    if(result_1 === null){ // Firebase_Token Not Registered  -----------------------------
                                        var varAndroidAppInfo = new LoginInfoModel.AndroidAppInfoSchema({
                                            User_Id:  result._id,
                                            Firebase_Token: req.body.Firebase_Token,
                                            Ip: Ip,
                                            Device_Info: DeviceInfo,
                                            Active_Status: 'Active'
                                        });
                                        varAndroidAppInfo.save(function(err_2, result_2) { // Android App SignIn Info Creation -----------------------------
                                            if(err_2) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Android App Info Save Query Error', 'SignIn_SignUp.controller.js - 74', err_2);
                                                res.status(200).send({ Status:"True", Output:"True", Response: result, Message: "Android App Info Creation Error! " });           
                                            } else {
                                                res.status(200).send({ Status:"True", Output:"True", Response: result, Message: 'Successfully Registered' });
                                            }
                                        });
                                    }else{ // Firebase_Token Already Registered  -----------------------------
                                        result_1.Ip = Ip;
                                        result_1.User_Id = result._id;
                                        result_1.Active_Status = 'Active';
                                        result_1.save( function(err_3, result_3) { // Android App SignIn Info Update -----------------------------
                                            if(err_3) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Android App Info Update Query Error', 'SignIn_SignUp.controller.js - 85', err_3);
                                                res.status(200).send({ Status:"True", Output:"True", Response: result, Message: "Android App Info Update Error! " });            
                                            } else {
                                                res.status(200).send({ Status:"True", Output:"True", Response: result, Message: 'Successfully Registered' });
                                            }
                                        });
                                    }
                                }
                            });
                        }else { // Register from Web  -----------------------------
                            res.status(200).send({ Status:"True", Output:"True", Response: result, Message: 'Successfully Registered' });
                        }
                    }
                });
            }
        });
    }
};

// ---------------------------------------------------------------------- User Register Completion ---------------------------------------------------------------
exports.UserRegisterCompletion = function(req, res) {
    User_Image_Upload(req, res, function(upload_err) {
        
        if(!req.body.User_Id || req.body.User_Id === '' ) {
            res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
        }else if(!req.body.Country && req.body.Country === '' ){
            res.status(200).send({Status:"True", Output:"False", Message: "Country can not be empty" });
        }else if(upload_err){
            res.status(200).send({Status:"True", Output:"False", Message: "Only 'png, gif, jpg and jpeg' images are allowed" });
        }else{
            UserModel.UserSchema.findOne({'_id': req.body.User_Id}, function(err, result) {
                if(err) {
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                    res.status(500).send({ Status:"False", Error:err, Message: "User Info Find Error! " });
                } else {
                    if (result !== null) {
                        var User_Image = 'UserImage.png';
                        if (req.file !== undefined) {
                            User_Image = req.file.filename;
                        } else if(result.Image !== '' ) {
                            User_Image = result.Image;
                        }
                        var State = {};
                        var City = {};
                        if (req.body.State !== '') {
                            State = JSON.parse(req.body.State);
                        }
                        if (req.body.City !== '') {
                            City = JSON.parse(req.body.City);
                        }
                        result.Color_Code = req.body.Color_Code || 'Color1';
                        result.Image = User_Image;
                        result.DOB = req.body.DOB;
                        result.City = req.body.City;
                        result.Country = req.body.Country;
                        result.Gender = req.body.Gender;
                        result.Country = JSON.parse(req.body.Country);
                        result.State = State;
                        result.City = City;
                        result.Hash_Tag_1 = req.body.Hash_Tag_1;
                        result.Hash_Tag_2 = req.body.Hash_Tag_2;
                        result.Hash_Tag_3 = req.body.Hash_Tag_3;

                        result.save(function(err_1, result_1) { // User Creation -----------------------------
                            if(err) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Update Query Error', 'SignIn_SignUp.controller.js - 51', err);
                                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while User Info Update"});           
                            } else {
                                result_1 = JSON.parse(JSON.stringify(result_1));
                                delete result_1.Password;

                                res.status(200).send({ Status:"True", Output:"True", Response: result_1, Message: 'Successfully Registered' });
                            }
                        });
                    }else {
                        res.status(200).send({ Status:"True", Output:"False", Response: result_1, Message: 'Invalid User Info' });
                    }
                }
            });
        }
    });
};

// ---------------------------------------------------------------------- User Sign in Validate ---------------------------------------------------------------
exports.UserValidate = function(req, res) {
    if(!req.body.Email || req.body.Email === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Email can not be empty" });
    }else if(!req.body.Password || req.body.Password === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Password can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'Email': req.body.Email.toLowerCase(), 'Password': req.body.Password, 'Active_Status': 'Active' }, { Password: 0 }, {}, function(err, result) { // User Validate -----------------------------
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Validate Query Error', 'SignIn_SignUp.controller.js - 134', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while User Validate"});           
            } else {
                if (result === null) {
                    UserModel.UserSchema.findOne({'Email': req.body.Email.toLowerCase() }, { Password: 0 }, {}, function(err_check, result_check) { // User Login Email Validate -----------------------------
                        if(err_check) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Email Validate Query Error', 'SignIn_SignUp.controller.js - 140', err_check);
                            res.status(500).send({Status:"False", Error:err_check, Message: "Some error occurred while User Email Validate"});           
                        } else {
                            if (result_check === null) {
                                res.status(200).send({ Status:"True", Output:"False", Message: "Invalid account details!" });
                            }else{
                                res.status(200).send({ Status:"True", Output:"False",  Message: "Email and password do not match!" });
                            }
                        }
                    });
                }else {
                    var getIp = get_ip(req);
                        getIp = getIp.clientIp;
                        getIp = getIp.split(':');
                    var Ip = getIp[getIp.length - 1];
                    var DeviceInfo = parser(req.headers['user-agent']);
                    var Req_From = 'Web';
                    if (req.body.Firebase_Token) { Req_From = 'App'; }

                    var varLoginInfoSchema = new LoginInfoModel.LoginInfoSchema({
                        User_Id: result._id,
                        From: Req_From,
                        Ip: Ip,
                        Device_Info: DeviceInfo,
                        Active_Status: 'Active'
                    });
                    varLoginInfoSchema.save(function(err_0, result_0) { // Login Info Creation  -----------------------------
                        if(err_0) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Login Info Save Query Error', 'SignIn_SignUp.controller.js - 71', err_0);
                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: "Login Info Create Error! " });
                        } else {
                            if (req.body.Firebase_Token) { // Login from App  -----------------------------
                                result = JSON.parse(JSON.stringify(result));
                                const AndroidUserUpdate = result =>
                                    Promise.all([
                                        LoginInfoModel.AndroidAppInfoSchema.findOne({'Firebase_Token': req.body.Firebase_Token, 'User_Id': result._id}).exec(),
                                        LoginInfoModel.AndroidAppInfoSchema.findOne({'Firebase_Token': req.body.Firebase_Token}).exec(),
                                        LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result._id, 'Active_Status': 'Active'}).exec(),
                                        ]).then( Data => {
                                            var Condition_1 = Data[0];
                                            var Condition_2 = Data[1];
                                            var Condition_3 = Data[2];

                                            if (Condition_2 === null && Condition_3 === null) {
                                                var varAndroidAppInfo = new LoginInfoModel.AndroidAppInfoSchema({
                                                    User_Id:  result._id,
                                                    Firebase_Token: req.body.Firebase_Token,
                                                    Ip: Ip,
                                                    Device_Info: DeviceInfo,
                                                    Active_Status: 'Active'
                                                });
                                                varAndroidAppInfo.save(function(err_3, result_3) {
                                                    res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                                });
                                            } else if (Condition_1 !== null && Condition_3 === null) {
                                                Condition_1.Ip = Ip;
                                                Condition_1.Active_Status = 'Active';
                                                Condition_1.save( function(err_4, result_4) {
                                                        res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                                });
                                            } else if (Condition_1 !== null && Condition_3 !== null) {
                                                var _Id1 = JSON.parse(JSON.stringify(Condition_1))._id;
                                                var _Id2 = JSON.parse(JSON.stringify(Condition_3))._id;
                                                if (_Id1 === _Id2 ) {
                                                    res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                                } else {
                                                    Condition_3.Active_Status = 'Inactive';
                                                    Condition_3.save( function(err_4, result_4) {
                                                        Condition_1.Ip = Ip;
                                                        Condition_1.Active_Status = 'Active';
                                                        Condition_1.save( function(err_5, result_5) {
                                                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                                        });
                                                    });
                                                }
                                            } else if (Condition_2 !== null) {
                                                if (Condition_3 === null) {
                                                    Condition_2.Ip = Ip;
                                                    Condition_2.User_Id = result._id;
                                                    Condition_2.Active_Status = 'Active';
                                                    Condition_2.save( function(err_4, result_4) {
                                                        res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                                    });
                                                } else {
                                                    Condition_3.Active_Status = 'Inactive';
                                                    Condition_3.save( function(err_4, result_4) {
                                                        Condition_2.Ip = Ip;
                                                        Condition_2.User_Id = result._id;
                                                        Condition_2.Active_Status = 'Active';
                                                        Condition_2.save( function(err_5, result_5) {
                                                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                                        });
                                                    });
                                                }
                                            } else if (Condition_2 === null && Condition_3 !== null ) {
                                                Condition_3.Active_Status = 'Inactive';
                                                Condition_3.save( function(err_4, result_4) {
                                                    var varAndroidAppInfo = new LoginInfoModel.AndroidAppInfoSchema({
                                                        User_Id:  result._id,
                                                        Firebase_Token: req.body.Firebase_Token,
                                                        Ip: Ip,
                                                        Device_Info: DeviceInfo,
                                                        Active_Status: 'Active'
                                                    });
                                                    varAndroidAppInfo.save(function(err_3, result_3) {
                                                        res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                                    });
                                                });
                                            } else {
                                                res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success'});
                                            }
                                        }).catch(error => {
                                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                        });     
                                AndroidUserUpdate(result);
                            }else { // Login from Web  -----------------------------
                                res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                            }
                        }
                    });
                }
            }
        });
    }
};

// ---------------------------------------------------------------------- User inside the App ---------------------------------------------------------------
exports.User_App_Entry = function(req, res) {
    if(!req.body.User_Id || req.body.User_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Firebase_Token || req.body.Firebase_Token === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Firebase Token can not be empty" });
    }else{
        var getIp = get_ip(req);
            getIp = getIp.clientIp;
            getIp = getIp.split(':');
        var Ip = getIp[getIp.length - 1];
        var DeviceInfo = parser(req.headers['user-agent']);
        UserModel.UserSchema.findOne({'_id': req.body.User_Id}, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Login Android App Info Find Query Error', 'SignIn_SignUp.controller.js', err);
                res.status(200).send({ Status:"True", Output:'False', Message: "User Id Can not be Valid!" });
            } else {
                result = JSON.parse(JSON.stringify(result));
                const AndroidUserUpdate = result =>
                    Promise.all([
                        LoginInfoModel.AndroidAppInfoSchema.findOne({'Firebase_Token': req.body.Firebase_Token, 'User_Id': result._id}).exec(),
                        LoginInfoModel.AndroidAppInfoSchema.findOne({'Firebase_Token': req.body.Firebase_Token}).exec(),
                        LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result._id, 'Active_Status': 'Active'}).exec(),
                        ]).then( Data => {
                            var Condition_1 = Data[0];
                            var Condition_2 = Data[1];
                            var Condition_3 = Data[2];

                            if (Condition_2 === null && Condition_3 === null) {
                                var varAndroidAppInfo = new LoginInfoModel.AndroidAppInfoSchema({
                                    User_Id:  result._id,
                                    Firebase_Token: req.body.Firebase_Token,
                                    Ip: Ip,
                                    Device_Info: DeviceInfo,
                                    Active_Status: 'Active'
                                });
                                varAndroidAppInfo.save(function(err_3, result_3) {
                                    res.status(200).send({ Status:"True", Output:'True', Message: 'Success' });
                                });
                            } else if (Condition_1 !== null && Condition_3 === null) {
                                Condition_1.Ip = Ip;
                                Condition_1.Active_Status = 'Active';
                                Condition_1.save( function(err_4, result_4) {
                                        res.status(200).send({ Status:"True", Output:'True', Message: 'Success' });
                                });
                            } else if (Condition_1 !== null && Condition_3 !== null) {
                                var _Id1 = JSON.parse(JSON.stringify(Condition_1))._id;
                                var _Id2 = JSON.parse(JSON.stringify(Condition_3))._id;
                                if (_Id1 === _Id2 ) {
                                    res.status(200).send({ Status:"True", Output:'True', Message: 'Success' });
                                } else {
                                    Condition_3.Active_Status = 'Inactive';
                                    Condition_3.save( function(err_4, result_4) {
                                        Condition_1.Ip = Ip;
                                        Condition_1.Active_Status = 'Active';
                                        Condition_1.save( function(err_5, result_5) {
                                            res.status(200).send({ Status:"True", Output:'True', Message: 'Success' });
                                        });
                                    });
                                }
                            } else if (Condition_2 !== null) {
                                if (Condition_3 === null) {
                                    Condition_2.Ip = Ip;
                                    Condition_2.User_Id = result._id;
                                    Condition_2.Active_Status = 'Active';
                                    Condition_2.save( function(err_4, result_4) {
                                        res.status(200).send({ Status:"True", Output:'True', Message: 'Success' });
                                    });
                                } else {
                                    Condition_3.Active_Status = 'Inactive';
                                    Condition_3.save( function(err_4, result_4) {
                                        Condition_2.Ip = Ip;
                                        Condition_2.User_Id = result._id;
                                        Condition_2.Active_Status = 'Active';
                                        Condition_2.save( function(err_5, result_5) {
                                            res.status(200).send({ Status:"True", Output:'True', Message: 'Success' });
                                        });
                                    });
                                }
                            } else if (Condition_2 === null && Condition_3 !== null ) {
                                Condition_3.Active_Status = 'Inactive';
                                Condition_3.save( function(err_4, result_4) {
                                    var varAndroidAppInfo = new LoginInfoModel.AndroidAppInfoSchema({
                                        User_Id:  result._id,
                                        Firebase_Token: req.body.Firebase_Token,
                                        Ip: Ip,
                                        Device_Info: DeviceInfo,
                                        Active_Status: 'Active'
                                    });
                                    varAndroidAppInfo.save(function(err_3, result_3) {
                                        res.status(200).send({ Status:"True", Output:'True', Message: 'Success' });
                                    });
                                });
                            } else {
                                res.status(200).send({ Status:"True", Output:'True', Message: "Success" });
                            }
                        }).catch(error => {
                            res.status(200).send({ Status:"True", Output:'True', Message: "Android App Info Find Error!" });
                        });     
                AndroidUserUpdate(result);
            }
        });
    }
};

// ---------------------------------------------------------------------- Privacy Update Check ---------------------------------------------------------------
exports.Privacy_Update_Check = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'_id': req.params.User_Id}, { Password: 0, __v: 0 }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                res.status(500).send({ Status:"False", Error:err, Message: "User Info Find Error! " });
            } else {
                if (result !== null) {
                    Status = '';
                    if(result.Privacy_Update_Checked === 'Success' ) {
                        Status = 'Success';
                    }
                    res.status(200).send({ Status:"True", Output:"True", Response: Status });
                }else {
                    res.status(200).send({ Status:"True", Output:"False", Message: 'Invalid User Info' });
                }
            }
        });
    }
};

// ---------------------------------------------------------------------- Privacy Update Agree ---------------------------------------------------------------
exports.Privacy_Update_Agree = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'_id': req.params.User_Id}, { Password: 0, __v: 0 }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                res.status(500).send({ Status:"False", Error:err, Message: "User Info Find Error! " });
            } else {
                if (result !== null) {
                    result.Privacy_Update_Checked = 'Success';
                    result.save(function(err_1, result_1) {
                        if(err) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Update Query Error', 'SignIn_SignUp.controller.js - 51', err);
                            res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while User Info Update"});           
                        } else {
                            res.status(200).send({ Status:"True", Output:"True", Response: result_1, Message: 'Successfully Updated' });
                        }
                    });
                }else {
                    res.status(200).send({ Status:"True", Output:"False", Message: 'Invalid User Info' });
                }
            }
        });
    }
};


// ---------------------------------------------------------------------- User Info ---------------------------------------------------------------
exports.User_Info = function(req, res) {
        if(!req.params.User_Id || req.params.User_Id === '' ) {
            res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
        }else{
            UserModel.UserSchema.findOne({'_id': req.params.User_Id}, { Password: 0, __v: 0 }, function(err, result) {
                if(err) {
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                    res.status(500).send({ Status:"False", Error:err, Message: "User Info Find Error! " });
                } else {
                    if (result !== null) {
                        if(result.Show_Profile_To === undefined || result.Show_Profile_To === '' ) {
                            result.Show_Profile_To = 'Everyone';
                        }
                         res.status(200).send({ Status:"True", Output:"True", Response: result });
                    }else {
                        res.status(200).send({ Status:"True", Output:"False", Message: 'Invalid User Info' });
                    }
                }
            });
        }
};


// ---------------------------------------------------------------------- User Delete ---------------------------------------------------------------
exports.User_Delete = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Type || req.body.Type === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "Type can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'_id': req.body.User_Id}, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                res.status(500).send({ Status:"False", Error:err, Message: "User Info Find Error! " });
            } else {
                if (result !== null) {
                    var ActionUser_Id = req.body.User_Id;
                    var Changing_Status = 'Delete';
                    if (req.body.Type === 'Deactivate') {
                        Changing_Status = 'Deactivate';
                    }
                    Promise.all([
                        // User Status Change
                        UserModel.UserSchema.updateMany(
                            { _id: ActionUser_Id },
                            { $set: { Active_Status: Changing_Status } }
                        ).exec(),

                        // User Cube Status Change
                        CubeModel.CubesSchema.updateMany(
                            { User_Id: ActionUser_Id },
                            { $set: { Active_Status: Changing_Status } }
                        ).exec(),

                        // User Topic Status Change
                        CubeModel.Cube_Topicschema.updateMany(
                            { User_Id: ActionUser_Id },
                            { Active_Status: Active_Status }
                        ).exec(),

                        // User Followers Status Change
                        CubeModel.Cube_Followersschema.updateMany(
                            { User_Id: ActionUser_Id },
                            { $set: { Active_Status: Changing_Status } }
                        ).exec(),

                        // User Post Status Change
                        PostModel.Cube_Postschema.updateMany(
                            { User_Id: ActionUser_Id },
                            { $set: { Active_Status: Changing_Status } }
                        ).exec(),

                        // if User Post Shared -> this Post Ownership Change to Shared User
                        PostModel.Cube_Postschema.updateMany(
                            { Shared_Post: 'True', Shared_Post_User_Id: ActionUser_Id },
                            { $set: { Shared_Post: 'False'}, $unset: {Shared_Post_User_Id: 1, Shared_Post_Id: 1} }
                        ).exec(),

                        // if User is the One of this Post Emote -> Remove User Id From this Emote
                        PostModel.Post_Emoteschema.updateMany(
                            { User_Ids: ActionUser_Id, 'User_Ids.1': { $exists: true } },
                            { $pull: { User_Ids: ActionUser_Id } }
                        ).exec(),

                        // If Only The User of This Post Emote -> Status Change 
                        PostModel.Post_Emoteschema.updateMany(
                            { User_Ids: ActionUser_Id, 'User_Ids.1': { $exists: false } },
                            { $set: { Active_Status: Changing_Status} }
                        ).exec(),

                        // User Post Comment Status Change
                        PostModel.Post_Commentschema.updateMany(
                            { User_Id: ActionUser_Id },
                            { $set: { Active_Status: Changing_Status} }
                        ).exec(),

                        // User Notification Status Change
                        UserModel.Post_NotificationSchema.updateMany(
                            {  $or: [ { User_Id: ActionUser_Id }, { To_User_Id: ActionUser_Id } ] },
                            { $set: { Active_Status: Changing_Status} }
                        ).exec()
                    ]).then( Data => {
                        res.status(200).send({ Status:"True", Output:"True", Return: Data });
                    }).catch( error => {
                        res.status(200).send({ Status:"True", Output:"False", Return: error });
                    });
                }else {
                    res.status(200).send({ Status:"True", Output:"False", Response: result_1, Message: 'Invalid User Info' });
                }
            }
        });
    }
};


// ---------------------------------------------------------------------- User Privacy Update ---------------------------------------------------------------
exports.Privacy_Update = function(req, res) {

        if(!req.body.User_Id || req.body.User_Id === '' ) {
            res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
        }else if(!req.body.Show_Profile_To || req.body.Show_Profile_To === '' ){
            res.status(200).send({Status:"True", Output:"False", Message: " Show Profile To can not be empty" });
        }else{
            UserModel.UserSchema.findOne({'_id': req.body.User_Id}, function(err, result) {
                if(err) {
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                    res.status(500).send({ Status:"False", Error:err, Message: "User Info Find Error! " });
                } else {
                    if (result !== null) {
                        result.Show_Profile_To = req.body.Show_Profile_To;

                        result.save(function(err_1, result_1) { // User Creation -----------------------------
                            if(err) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Update Query Error', 'SignIn_SignUp.controller.js - 51', err);
                                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while User Info Update"});           
                            } else {
                                result_1 = JSON.parse(JSON.stringify(result_1));
                                delete result_1.Password;

                                res.status(200).send({ Status:"True", Output:"True", Response: result_1, Message: 'Successfully Updated' });
                            }
                        });
                    }else {
                        res.status(200).send({ Status:"True", Output:"False", Response: result_1, Message: 'Invalid User Info' });
                    }
                }
            });
        }
};


// ---------------------------------------------------------------------- User Password Update ---------------------------------------------------------------
exports.Password_Change = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Old_Password || req.body.Old_Password === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: " Old Password can not be empty" });
    }else if(!req.body.New_Password || req.body.New_Password === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: " New Password can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'_id': req.body.User_Id, 'Password' :req.body.Old_Password }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                res.status(500).send({ Status:"False", Error:err, Message: "User Info Find Error! " });
            } else {
                if (result !== null) {
                    result.Password = req.body.New_Password;
                    result.save(function(err_1, result_1) { // User Creation -----------------------------
                        if(err) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Update Query Error', 'SignIn_SignUp.controller.js - 51', err);
                            res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while User Info Update"});           
                        } else {
                            result_1 = JSON.parse(JSON.stringify(result_1));
                            delete result_1.Password;

                            res.status(200).send({ Status:"True", Output:"True", Response: result_1, Message: 'Successfully Updated' });
                        }
                    });
                }else {
                    res.status(200).send({ Status:"True", Output:"False", Message: 'Old password invalid!' });
                }
            }
        });
    }
};


exports.Send_Email_Password_Reset_Request = function(req, res) {
    if(!req.params.Email || req.params.Email === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "Email can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'Email': req.params.Email.toLowerCase()}, function(err, data) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                res.status(500).send({ Status:"False", Error:err, Message: "Some error occurred while Validate The E-mail " });
            } else {
                if(data === null){
                    res.status(200).send({ Status:"True", Output:"False", Message: 'Invalid account!' });
                }else{
                var rand=Math.floor((Math.random() * 100) + 54);
                    var link = "http://www.inscube.com/Reset_Password/" + data._id + "/" + rand;
                    var SendData = {
                        from: 'Inscube <insocialcube@gmail.com>',
                        to: req.params.Email,
                        subject: 'E-mail Verification',
                        html: '<div style="background-color:#f6f6f6;font-size:14px;height:100%;line-height:1.6;margin:0;padding:0;width:100%" bgcolor="#f6f6f6" height="100%" width="100%"><table style="background-color:#f6f6f6;border-collapse:separate;border-spacing:0;box-sizing:border-box;width:100%" width="100%" bgcolor="#f6f6f6"><tbody><tr><td style="box-sizing:border-box;display:block;font-size:14px;font-weight:normal;margin:0 auto;max-width:500px;padding:10px;text-align:center;width:auto" valign="top" align="center" width="auto"><div style="background-color:#dedede; box-sizing:border-box;display:block;margin:0 auto;max-width:500px;padding:10px;text-align:left" align="left"><table style="background:#fff;border:1px solid #e9e9e9;border-collapse:separate;border-radius:3px;border-spacing:0;box-sizing:border-box;width:100%"><tbody><tr><td style="box-sizing:border-box;font-size:14px;font-weight:normal;margin:0;padding:30px;vertical-align:top" valign="top"><table style="border-collapse:separate;border-spacing:0;box-sizing:border-box;width:100%" width="100%"><tbody><tr style="font-family: sans-serif; line-height:20px" ><td style="box-sizing:border-box;font-size:14px;font-weight:normal;margin:0;vertical-align:top" valign="top"><img src="http://www.inscube.com/assets/images/logo.png" style="width:40%; margin-left:30%" alt="Inscube Logo"><p style="font-size:14px;">Hi there,</p><p style="font-size:14px;"> To complete the email verification process, Please click the link below then Reset Your Password .</p><table style="border-collapse:separate;border-spacing:0;box-sizing:border-box;margin-bottom:15px;width:auto" width="auto"><tbody><tr><td style="background-color:#e9472c;box-shadow: 0 1px 8px 0 hsla(0,0%,40%,.47);" valign="top" bgcolor="#ffda00" align="center"><a href="'+ link +'"  data-saferedirecturl="'+ link +'" style="background-color:#e9472c ;box-sizing:border-box;color:#ffffff;display:inline-block;font-size:14px;margin:0;padding:12px 25px;text-decoration:none;text-transform:capitalize;cursor:pointer;letter-spacing: 0.5px" bgcolor="#ffda00" target="_blank"> Verify Your E-mail</a></td></tr></tbody></table><p style="font-size:14px;font-weight:normal;margin:0;margin-bottom:15px;padding:0">Thanks, Inscube Team</p></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div>'
                    };
                    
                    mailgun.messages().send(SendData, function (error, body) {
                        if (error) {
                            res.status(500).send({ Status:"False", Error:error, Message: "Some error occurred while send The E-mail " });
                        } else {
                            data.Email_Verify_Token = rand;
                            data.save(function (newerr, newresult) {
                                if (newerr){
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', newerr);
                                    res.status(500).send({ Status:"False", Error:newerr, Message: "Some error occurred" });
                                }else{
                                    res.status(200).send({ Status:"True", Output:"True", Response: body, Message: 'Email send successfully!' });
                                }
                            });
                        }
                    });
                } 
            }
        }); 
    }
}; 


// ---------------------------------------------------------------------- User Email Validate ----------------------------------------------------------
exports.Password_reset_Email_Validate = function(req, res) {
    if(!req.params.Email || req.params.Email === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "Email can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'Email': req.params.Email.toLowerCase()}, function(err, data) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Email Validate Query Error', 'SignIn_SignUp.controller.js - 11', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Validate The User E-mail."});
            } else {
                if(data === null){
                    res.status(200).send({ Status:"True", Output: "False" });
                }else{
                    res.status(200).send({ Status:"True", Output: "True", User_Id: data._id });
                } 
            }
        });
    }
};


exports.Send_Email_Password_Reset_OTP = function(req, res) {
    if(!req.params.Email || req.params.Email === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "Email can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'Email': req.params.Email.toLowerCase()}, function(err, data) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                res.status(500).send({ Status:"False", Error:err, Message: "Some error occurred while Validate The E-mail " });
            } else {
                if(data === null){
                    res.status(200).send({ Status:"True", Output:"False", Message: 'Invalid account!' });
                }else{
                    var OTP = Math.floor(100000 + Math.random() * 900000);
                    var SendData = {
                        from: 'Inscube <insocialcube@gmail.com>',
                        to: req.params.Email,
                        subject: 'E-mail Verification OTP',
                        html: '<div style="background-color:#f6f6f6;font-size:14px;height:100%;line-height:1.6;margin:0;padding:0;width:100%" bgcolor="#f6f6f6" height="100%" width="100%"><table style="background-color:#f6f6f6;border-collapse:separate;border-spacing:0;box-sizing:border-box;width:100%" width="100%" bgcolor="#f6f6f6"><tbody><tr><td style="box-sizing:border-box;display:block;font-size:14px;font-weight:normal;margin:0 auto;max-width:500px;padding:10px;text-align:center;width:auto" valign="top" align="center" width="auto"><div style="background-color:#dedede; box-sizing:border-box;display:block;margin:0 auto;max-width:500px;padding:10px;text-align:left" align="left"><table style="background:#fff;border:1px solid #e9e9e9;border-collapse:separate;border-radius:3px;border-spacing:0;box-sizing:border-box;width:100%"><tbody><tr><td style="box-sizing:border-box;font-size:14px;font-weight:normal;margin:0;padding:30px;vertical-align:top" valign="top"><table style="border-collapse:separate;border-spacing:0;box-sizing:border-box;width:100%" width="100%"><tbody><tr style="font-family: sans-serif; line-height:20px" ><td style="box-sizing:border-box;font-size:14px;font-weight:normal;margin:0;vertical-align:top" valign="top"><img src="http://www.inscube.com/assets/images/logo.png" style="width:40%; margin-left:30%" alt="Inscube Logo"><p style="font-size:14px;">Hi there,</p><p style="font-size:14px;"> To complete the email verification process, <br> Your OTP (one time password) is .</p><table style="border-collapse:separate;border-spacing:0;box-sizing:border-box;margin-bottom:15px;width:auto" width="auto"><tbody><tr><td style="background-color:#e9472c;box-shadow: 0 1px 8px 0 hsla(0,0%,40%,.47);" valign="top" bgcolor="#ffda00" align="center"><a  style="background-color:#e9472c ;box-sizing:border-box;color:#ffffff;display:inline-block;font-size:14px;margin:0;padding:12px 25px;text-decoration:none;text-transform:capitalize;cursor:pointer;letter-spacing: 0.5px" bgcolor="#ffda00" target="_blank"> ' + OTP + ' </a></td></tr></tbody></table><p style="font-size:14px;font-weight:normal;margin:0;margin-bottom:15px;padding:0">Thanks, Inscube Team</p></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div>'
                    };
                    
                    mailgun.messages().send(SendData, function (error, body) {
                        if (error) {
                            res.status(500).send({ Status:"False", Error:error, Message: "Some error occurred while send The E-mail " });
                        } else {
                            data.Email_Verify_Token = OTP;
                            data.save(function (newerr, newresult) {
                                if (newerr){
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', newerr);
                                    res.status(500).send({ Status:"False", Error:newerr, Message: "Some error occurred" });
                                }else{
                                    res.status(200).send({ Status:"True", Output:"True", Response: body, Message: 'Email send successfully!' });
                                }
                            });
                        }
                    });
                } 
            }
        }); 
    }
};

exports.password_reset_url_check = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "User id can not be empty" });
    } else if(!req.params.Token || req.params.Token === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "Token can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'_id': req.params.User_Id, 'Email_Verify_Token': req.params.Token}, { Email: 1, Email_Verify_Token: 1, Inscube_Name: 1 }, function(err, data) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                res.status(500).send({ Status:"False", Error:err, Message: "Some error occurred while Validate The E-mail " });
            } else {
                if(data === null){
                    res.status(200).send({ Status:"True", Output:"False", Message: 'Invalid account!' });
                }else{
                    res.status(200).send({ Status:"True", Output:"True", Response: data});
                } 
            }
        }); 
    }
};

exports.password_reset_OTP_check = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "User id can not be empty" });
    } else if(!req.params.OTP || req.params.OTP === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "OTP can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'_id': req.params.User_Id, 'Email_Verify_Token': req.params.OTP}, { Email: 1, Email_Verify_Token: 1, Inscube_Name: 1 }, function(err, data) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                res.status(500).send({ Status:"False", Error:err, Message: "Some error occurred while Validate The E-mail " });
            } else {
                if(data === null){
                    res.status(200).send({ Status:"True", Output:"False", Message: 'Invalid account!' });
                }else{
                    res.status(200).send({ Status:"True", Output:"True", Message: ' OTP is valid'});
                } 
            }
        }); 
    }
};

exports.password_reset_submit = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.params.New_Password || req.params.New_Password === '' ) {
        res.status(200).send({Status:"True", Output:"False", Message: " New Password can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'_id': req.params.User_Id}, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                res.status(500).send({ Status:"False", Error:err, Message: "User info find error! " });
            } else {
                if (result !== null) {
                    result.Password = req.params.New_Password;
                    result.Email_Verify_Token = '';
                    result.save(function(err_1, result_1) { // User Creation -----------------------------
                        if(err) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Update Query Error', 'SignIn_SignUp.controller.js - 51', err);
                            res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while User Info Update"});           
                        } else {
                            result_1 = JSON.parse(JSON.stringify(result_1));
                            delete result_1.Password;

                            res.status(200).send({ Status:"True", Output:"True", Message: 'Successfully Updated' });
                        }
                    });
                }else {
                    res.status(200).send({ Status:"True", Output:"False", Message: 'Password reset failed please try again!' });
                }
            }
        });
    }
};

exports.AndroidVersionSubmit = function(req, res) {
    if(!req.params.Version) {
        res.status(400).send({status:"False", message: " Version can not be Empty! "});
    }
    else{
        LoginInfoModel.AndroidVersion.remove({}, function(err, data) {
            if(err) {
                res.status(500).send({status:"False", message: "Some error occurred while Android Version Submit."});
            } else {
                var varAndroidVersion = new LoginInfoModel.AndroidVersion({
                    DateTime: new Date(),
                    Version: req.params.Version,
                });

                varAndroidVersion.save(function(err, result) {
                    if(err) {
                        res.status(500).send({status:"False", Error:err, message: "Some error occurred while Submit the Android Version."});            
                    } else {
                        res.send({status:"True", data: result });
                    }
                });
            }
        });
    }
};

exports.AndroidVersionUpdate = function(req, res) {
    if(!req.params.Version) {
        res.status(400).send({status:"False", message: " Version can not be Empty! "});
    }
    else{
        LoginInfoModel.AndroidVersion.find({}, {}, function(err, data) {
            if(err) {
                res.status(500).send({status:"False", message: "Some error occurred while Android Version Update."});
            } else {
                data[0].Version = req.params.Version;
                data[0].save(function (newerr, newresult) {
                    if (newerr){
                        res.status(500).send({status:"False", Error: newerr,  message: "Some error occurred while Update Android Version ."});
                    }else{
                        res.send({ status:"True", data: newresult });
                    }
                });
            }
        });
    }
};

exports.AndroidVersionGet = function(req, res) {
    LoginInfoModel.AndroidVersion.find({}, {}, function(err, data) {
        if(err) {
            res.status(500).send({status:"False", message: "Some error occurred while Android Version Find."});
        } else {
            res.send({status:"True", data: data[0] });
        }
    });
};




