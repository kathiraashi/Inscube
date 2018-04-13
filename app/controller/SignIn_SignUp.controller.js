var UserModel = require('../models/User.model.js');
var LoginInfoModel = require('../models/Login_Info.model.js');
var ErrorManagement = require('./../../app/config/ErrorHandling.js');
var parser = require('ua-parser-js');
var get_ip = require('ipware')().get_ip;
var multer = require('multer');

var CubeModel = require('../models/Cubes.model.js');


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


// ---------------------------------------------------------------------- User Register ---------------------------------------------------------------
exports.UserRegister = function(req, res) {
    if(!req.body.Inscube_Name && req.body.Inscube_Name === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Inscube Name can not be empty" });
    }else if(!req.body.Email && req.body.Email === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Email can not be empty" });
    }else if(!req.body.Password && req.body.Password === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Password can not be empty" });
    }else{
        var Ins_name = req.body.Inscube_Name;
            Ins_name = Ins_name.replace(/@/gi, "");
        var varUserSchema = new UserModel.UserSchema({
            Inscube_Name: '@' + Ins_name,
            Email: req.body.Email,
            Password: req.body.Password,
            Color_Code: req.body.Color_Code || '',
            Image: req.body.Image || 'UserImage.png',
            DOB: req.body.DOB || '',
            City: req.body.City || '',
            Country: req.body.Country || '',
            Gender: req.body.Gender || '',
            Hash_Tag_1: req.body.Hash_Tag_1 || '',
            Hash_Tag_2: req.body.Hash_Tag_2 || '',
            Hash_Tag_3: req.body.Hash_Tag_3 || '',
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
                    Active_States: 'Active'
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
                                            Active_States: 'Active'
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
                                        result_1.Device_Info = DeviceInfo;
                                        result_1.User_Id = result._id;
                                        result_1.Active_States = 'Active';
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

        if(!req.body.User_Id && req.body.User_Id === '' ) {
            res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
        }else if(!req.body.Color_Code && req.body.Color_Code === '' ){
            res.status(200).send({Status:"True", Output:"False", Message: "Color Code can not be empty" });
        }else if(upload_err && upload_err === '' && upload_err === undefined && upload_err === null){
            res.status(200).send({Status:"True", Output:"False", Message: "Only 'png, gif, jpg and jpeg' images are allowed" });
        }else{
            UserModel.UserSchema.findOne({'_id': req.body.User_Id}, function(err, result) {
                if(err) {
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                    res.status(500).send({ Status:"False", Error:err, Message: "User Info Find Error! " });
                } else {
                    if (result !== null) {
                        var User_Image = 'UserImage.png';
                        if(req.file !== undefined){
                            User_Image = req.file.filename;
                        }

                        result.Color_Code = req.body.Color_Code;
                        result.Image = User_Image;
                        result.DOB = req.body.DOB;
                        result.City = req.body.City;
                        result.Country = req.body.Country;
                        result.Gender = req.body.Gender;
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
    if(!req.body.Email && req.body.Email === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Email can not be empty" });
    }else if(!req.body.Password && req.body.Password === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Password can not be empty" });
    }else{
        UserModel.UserSchema.findOne({'Email': req.body.Email.toLowerCase(), 'Password': req.body.Password, 'Active_Status': 'Active' }, { Password: 0 }, {}, function(err, result) { // User Validate -----------------------------
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Validate Query Error', 'SignIn_SignUp.controller.js - 134', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while User Validate"});           
            } else {
                if (result === null) {
                    UserModel.UserSchema.findOne({'Email': req.body.Email.toLowerCase() }, { Password: 0 }, {}, function(err_check, result_check) { // User Login Email Validate -----------------------------
                        if(err) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Email Validate Query Error', 'SignIn_SignUp.controller.js - 140', err);
                            res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while User Email Validate"});           
                        } else {
                            if (result_check === null) { 
                                res.status(200).send({ Status:"True", Output:"False", Message: "Invalid Account Details!" });
                            }else{
                                res.status(200).send({ Status:"True", Output:"False",  Message: "Email and Password Not Match!" });
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
                        Active_States: 'Active'
                    });
                    varLoginInfoSchema.save(function(err_0, result_0) { // Login Info Creation  -----------------------------
                        if(err_0) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Login Info Save Query Error', 'SignIn_SignUp.controller.js - 71', err_0);
                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: "Login Info Create Error! " });
                        } else {
                            if (req.body.Firebase_Token) { // Login from App  -----------------------------
                                LoginInfoModel.AndroidAppInfoSchema.findOne({'Firebase_Token': req.body.Firebase_Token}, function(err_1, result_1) {
                                    if(err_1) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Login Android App Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err_1);
                                        res.status(200).send({ Status:"True", Output:'True', Response: result, Message: "Android App Info Find Error! " });
                                    } else {
                                        LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result._id}, function(err_2, result_2) {
                                            if(err_2) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Login Android App Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err_2);
                                                res.status(200).send({ Status:"True", Output:'True', Response: result, Message: "Android App Info Find Error! " });
                                            } else {
                                                if(result_1 === null && result_2 === null){ // Firebase_Token Not Registered  -----------------------------
                                                    var varAndroidAppInfo = new LoginInfoModel.AndroidAppInfoSchema({
                                                        User_Id:  result._id,
                                                        Firebase_Token: req.body.Firebase_Token,
                                                        Ip: Ip,
                                                        Device_Info: DeviceInfo,
                                                        Active_States: 'Active'
                                                    });
                                                    varAndroidAppInfo.save(function(err_3, result_3) { // Android App SignIn Info Creation -----------------------------
                                                        if(err_3) {
                                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Android App Info Save Query Error', 'SignIn_SignUp.controller.js - 74', err_3);
                                                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: "Android App Info Creation Error! " });           
                                                        } else {
                                                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                                        }
                                                    });
                                                }else if(result_1 !== null ) { // Firebase_Token Already Registered  -----------------------------
                                                    result_1.Ip = Ip;
                                                    result_1.Device_Info = DeviceInfo;
                                                    result_1.User_Id = result._id;
                                                    result_1.Active_States = 'Active';
                                                    result_1.save( function(err_4, result_4) { // Android App SignIn Info Update -----------------------------
                                                        if(err_4) {
                                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Android App Info Update Query Error', 'SignIn_SignUp.controller.js - 85', err_4);
                                                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: "Android App Info Update Error! " });            
                                                        } else {
                                                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                                        }
                                                    });
                                                }else if(result_2 !== null ) { // User_Id Already Registered  -----------------------------
                                                    result_2.Ip = Ip;
                                                    result_2.Device_Info = DeviceInfo;
                                                    result_2.Firebase_Token = req.body.Firebase_Token;
                                                    result_2.Active_States = 'Active';
                                                    result_2.save( function(err_5, result_5) { // Android App SignIn Info Update -----------------------------
                                                        if(err_5) {
                                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Android App Info Update Query Error', 'SignIn_SignUp.controller.js - 85', err_5);
                                                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: "Android App Info Update Error! " });            
                                                        } else {
                                                            res.status(200).send({ Status:"True", Output:'True', Response: result, Message: 'Sign In Success' });
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                });
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


// ---------------------------------------------------------------------- User Info ---------------------------------------------------------------
exports.User_Info = function(req, res) {
        if(!req.params.User_Id && req.params.User_Id === '' ) {
            res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
        }else{
            UserModel.UserSchema.findOne({'_id': req.params.User_Id}, { Password: 0, __v: 0 }, function(err, result) {
                if(err) {
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Register Completion User Info Find Query Error', 'SignIn_SignUp.controller.js - 58', err);
                    res.status(500).send({ Status:"False", Error:err, Message: "User Info Find Error! " });
                } else {
                    if (result !== null) {
                         res.status(200).send({ Status:"True", Output:"True", Response: result });
                    }else {
                        res.status(200).send({ Status:"True", Output:"False", Message: 'Invalid User Info' });
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