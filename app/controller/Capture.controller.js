var ErrorManagement = require('./../../app/config/ErrorHandling.js');
var CubeModel = require('../models/Cubes.model.js');
var PostModel = require('../models/Post.model.js');
var CaptureModel = require('../models/Capture,model.js');
var UserModel = require('../models/User.model.js');
var LoginInfoModel = require('../models/Login_Info.model.js');
var multer = require('multer');
var moment = require('moment');

var admin = require('firebase-admin');

// Cube Post File Upload Disk Storage and Validate Functions ----------------------------------------------------------------------------------------
var Cube_Capture_File_Storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, './Uploads/Capture_Attachments'); },
    filename: (req, file, cb) => {
        let extArray = file.originalname.split(".");
        let extension = (extArray[extArray.length - 1]).toLowerCase();
     cb(null, 'Capture_' + Date.now() + '.' + extension);
    }
});
var Cube_Capture_File_Upload = multer({
    storage: Cube_Capture_File_Storage,
    fileFilter: function (req, file, callback) {
        let extArray = file.originalname.split(".");
        let extension = (extArray[extArray.length - 1]).toLowerCase();
        if( extension !== 'mp4' && extension !== 'mkv' && extension !== '3gp' && extension !== 'flv') {
            return callback("Only 'mp4, mkv, flv and 3gp' videos are allowed");
        }
        callback(null, true);
    }
}).array('Attachments', 10);



// -----------------------------------------------------------  Cube Capture Submit ------------------------------------------------
exports.CubeCapture_Submit = function(req, res) {
    Cube_Capture_File_Upload(req, res, function(upload_err) {
        
        var Cubes_List =JSON.parse(req.body.Cube_Ids);

        if(!req.body.User_Id || req.body.User_Id === '') {
            res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
        }else if(!req.body.Capture_Text || req.body.Capture_Text === ''){
            res.status(200).send({Status:"True", Output:"False", Message: "Text can not be empty" });
        }else if( req.files.length <= 0 ){
            res.status(200).send({Status:"True", Output:"False", Message: "File not be empty" });
        }else if( Cubes_List.length <= 0 ){
            res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
        }else{

            var Attachments_Json = [];
            if ( req.files.length > 0) {
                var Json = JSON.parse(JSON.stringify(req.files));
                Attachments_Json = Json.map((Objects) => {
                    return { File_Name: Objects.filename, File_Type: 'Video', Size: Objects.size};
                });
            }
                
            var varCube_Captureschema = new CaptureModel.Cube_Captureschema({
                User_Id: req.body.User_Id,
                Cube_Ids: Cubes_List,
                Capture_Video: Attachments_Json,
                Capture_Text: req.body.Capture_Text,
                Shared_Capture: 'False',
                Active_Status: 'Active'
            });

            varCube_Captureschema.save(function(err, result) {
                if(err) {
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Submit Query Error', 'Capture.controller.js', err);
                    res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Capture Submit"});           
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                        if(err_user) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Capture.controller.js', err_user);
                            res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The  User Info."});
                        } else {
                            result.Time_Ago = moment(result.updatedAt).fromNow();
                            result.User_Name = User_Info.Inscube_Name;
                            result.User_Image = User_Info.Image;
                            result.Emotes = [];
                            result.Comments = [];
                            var CubeIds = result.Cube_Ids;
                            const GetCategory_Info = (CubeIds) => Promise.all( CubeIds.map(info => Category_Info(info)) 
                            ).then( result_1 => {
                                    result.Cubes_Info = result_1;
                                    res.status(200).send({ Status:"True", Output: "True", Response: result });
                            }).catch( err_1 => { 
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Submit Category Info Find Main Promise Error', 'Capture.controller.js ', err_1);
                                res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Capture Submit Category Info Find Promise Error "});
                            });
                            const Category_Info = info =>
                                Promise.all([
                                    CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                    CubeModel.Cube_Followersschema.find({'Cube_Id': info, 'Active_Status': 'Active' }).exec(),
                                    ]).then( Data => {
                                        var Users_List = JSON.parse(JSON.stringify(Data[1]));
                                        const Send_Notification = (Users_List) => Promise.all(
                                                Users_List.map(_info => To_Notify(_info)) 
                                            ).then( result_2 => { return Data[0]; });
                                            const To_Notify = _info => {
                                                LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': _info.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                                    if (result.User_Id !== _info.User_Id) {
                                                        var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                            User_Id: result.User_Id,
                                                            To_User_Id: _info.User_Id,
                                                            Notify_Type: 'New_Capture',
                                                            Capture_Id: result._id,
                                                            Capture_Text: result.Capture_Text,
                                                            Cube_Id: info,
                                                            Emote_Id: '',
                                                            Opinion_Id: '',
                                                            Emote_Text: '',
                                                            View_Status: 0,
                                                            Active_Status: 'Active'
                                                        });
                                                        varPost_NotificationSchema.save();
                                                    }
                                                    if (App_Info !== null && result.User_Id !== _info.User_Id) {
                                                        var registrationToken = App_Info.Firebase_Token;
                                                        var payload = {
                                                            notification: {
                                                                title: 'New Moment Captured',
                                                                body: User_Info.Inscube_Name + ' shared a new moment in ' + Data[0].Name,
                                                            },
                                                            data: {
                                                                type: 'Capture',
                                                                _id: result._id
                                                            }
                                                        };
                                                        var options = {
                                                            priority: 'high',
                                                            timeToLive: 60 * 60 * 24
                                                        };
                                                        admin.messaging().sendToDevice(registrationToken, payload, options);
                                                    }
                                                });
                                                return _info;
                                            };
                                        return Send_Notification(Users_List);
                                    }).catch(error => {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Submit Category Info Find Sub Promise Error', 'Capture.controller.js', error);
                                    });     
                            GetCategory_Info(CubeIds);
                        }
                    });
                }
            });
         }
    });
};

// -----------------------------------------------------------  Cube Capture List --------------------------------------------------
exports.CubeCapture_List = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        CubeModel.Cube_Followersschema.find({'User_Id': req.params.User_Id, 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Capture.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The User Followed Cube List."});
            } else {
                var CubesArray = [];
                var Return_Json = result.map((Objects) => { CubesArray.push(Objects.Cube_Id); });
                var Skip_Count = parseInt(req.params.Skip_Count);
                CaptureModel.Cube_Captureschema.find({'Cube_Ids': { $in: CubesArray }, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 }, skip: Skip_Count, limit: 15 }, function(err_1, result_1) {
                    if(err_1) {
                        res.status(500).send({status:"False", Error:err_1});
                    } else {
                        
                        result_1 = JSON.parse(JSON.stringify(result_1));
                        
                        const Get_Capture_Info = (result_1) => Promise.all(
                            result_1.map(info_1 => CaptureInfo(info_1)) 
                        ).then( result_2 => {
                                result_2 = result_2.map((Objects) => { Objects.Time_Ago = moment(Objects.Time_Ago).fromNow();  return Objects; });
                                res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                        }).catch( err_2 => {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture List Category Info Find Main Promise Error', 'Capture.controller.js', err_2);
                            res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Capture Info Find Promise Error "});
                        });
                        const CaptureInfo = info_1 =>
                            Promise.all([
                                UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                                CaptureModel.Capture_Emoteschema.find({ 'Capture_Id': info_1._id }).exec(),
                                UserModel.UserSchema.findOne({ '_id': info_1.Shared_Capture_User_Id }, { Inscube_Name: 1}).exec(),
                                ]).then( Data => {
                                    info_1.User_Name = Data[0].Inscube_Name;
                                    info_1.User_Image = Data[0].Image;
                                    info_1.Time_Ago = info_1.updatedAt;
                                    info_1.Emotes = Data[1];
                                    if(Data[2] !== null){ info_1.Capture_Owner_Name = Data[2].Inscube_Name; }
                                    info_1.Comments = [];
                                    var cubeIds = info_1.Cube_Ids;

                                        const GetCube_Info = (cubeIds) => Promise.all(
                                                cubeIds.map(info => Cube_Info(info)) 
                                            ).then( result_3 => {
                                                info_1.Cubes_Info = result_3;
                                                return info_1;
                                            }).catch( err_3 => {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Submit Cube Info Find Promise Error', 'Capture.controller.js', err_3);
                                                res.status(500).send({Status:"False", Error:err_3, Message: "Some error occurred while Find the Cube Capture list Cube Info Find Promise Error "});
                                            });
                            
                                            const Cube_Info = info =>
                                                Promise.all([ 
                                                    CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                    ]).then( Datas => {
                                                        return Datas[0];
                                                    }).catch(error => {
                                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture list Cube Info Find Promise Error', 'Capture.controller.js', error);
                                                    });     
                                    return GetCube_Info(cubeIds);

                                }).catch(error_1 => {
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture List Cube Info Find Promise Error', 'Capture.controller.js ', error_1);
                                });     
                        Get_Capture_Info(result_1);
                    }
                });
            }
        });
    }
};

// -----------------------------------------------------------  Cube Capture view ----------------------------------------------------
exports.CubeCapture_View = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.params.Capture_Id || req.params.Capture_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{

        CaptureModel.Cube_Captureschema.find({'_id': req.params.Capture_Id }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                result = JSON.parse(JSON.stringify(result));
                
                const Get_Capture_Info = (result) => Promise.all(
                        result.map(info_1 => CaptureInfo(info_1)) 
                    ).then( result_2 => {
                            res.status(200).send({ Status:"True", Output: "True", Response: result_2  });
                    }).catch( err_2 => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture view Cube Info Find Main Promise Error', 'Posts.controller.js', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Capture View Cube Info Find Promise Error "});
                    });

                    const CaptureInfo = info_1 =>
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            CaptureModel.Capture_Emoteschema.find({ 'Capture_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Capture_User_Id }, { Inscube_Name: 1}).exec(),
                            ]).then( Data => {
                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Time_Ago = moment(info_1.updatedAt).fromNow();
                                info_1.Emotes = Data[1];
                                if(Data[2] !== null){ info_1.Capture_Owner_Name = Data[2].Inscube_Name; }
                                info_1.Comments = [];
                                var cubeIds = info_1.Cube_Ids;

                                    const GetCube_Info = (cubeIds) => Promise.all(
                                            cubeIds.map(info => Cube_Info(info)) 
                                        ).then( result_3 => {
                                            info_1.Cubes_Info = result_3;
                                            return info_1;
                                        }).catch( err_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture View Cube Info Find Main Promise Error', 'Capture.controller.js - 7', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Capture View Cube Info Find Promise Error "});
                                        });
                        
                                        const Cube_Info = info =>
                                            Promise.all([ 
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture View Cube Info Find Main Promise Error', 'Capture.controller.js', error);
                                                });     
                                return GetCube_Info(cubeIds);

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture View Cube Info Find Main Promise Error', 'Capture.controller.js', error_1);
                            });     
                Get_Capture_Info(result);
                            
            }
        });
    }
};

// -----------------------------------------------------------  Cube Capture Update --------------------------------------------------
exports.CubeCapture_Update = function(req, res) {
    Cube_Capture_File_Upload(req, res, function(upload_err) {
    
        var Cubes_List =JSON.parse(req.body.Cube_Ids);

        if(!req.body.Capture_Id || req.body.Capture_Id === '') {
            res.status(200).send({Status:"True", Output:"False", Message: "Capture Id can not be empty" });
        }else{

            CaptureModel.Cube_Captureschema.findOne({'_id': req.body.Capture_Id }, function(capture_err, capture_result) {
                if(capture_err) {
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Capture Info Find Query Error', 'Capture.controller.js', capture_err);
                    res.status(500).send({status:"False", Error:capture_err, message: "Some error occurred while Find The Capture ."});
                } else {

                    var Attachments_Json = [];
                    if ( req.files.length > 0) {
                        var Json = JSON.parse(JSON.stringify(req.files));
                        Attachments_Json = Json.map((Objects) => {
                            return { File_Name: Objects.filename, File_Type: 'Video', Size: Objects.size};
                        });
                    }

                    var OldAttachments_Json = [];
                    if (req.body.Old_Attachments && req.body.Old_Attachments !== undefined ) {
                        OldAttachments_Json = JSON.parse(req.body.Old_Attachments);
                    }

                    var NewAttachments_Json = Attachments_Json.concat(OldAttachments_Json);

                    capture_result.Cube_Ids = Cubes_List;
                    capture_result.Capture_Text = req.body.Capture_Text;
                    capture_result.Capture_Video = NewAttachments_Json;

                    capture_result.save(function(err, result) {
                        if(err) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Update Query Error', 'Capture.controller.js', err);
                            res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Capture Update"});           
                        } else {
                            result = JSON.parse(JSON.stringify(result));
                            delete result.__v;
                            var cubeIds = result.Cube_Ids;
                            

                            const GetCategory_Info = (cubeIds) => Promise.all(
                                cubeIds.map(info => Category_Info(info)) 
                            ).then( result_1 => {
                                result.Cubes_Info = result_1;
                                result.Time_Ago = moment(result.updatedAt).fromNow();

                                UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                                    if(err_user) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Capture.controller.js', err_user);
                                        res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The User Info."});
                                    } else {
                                        CaptureModel.Capture_Emoteschema.find({'Capture_Id': result._id }, function(err_emote, emote_Info) {
                                            if(err_emote) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Capture Emote Find Query Error', 'Capture.controller.js', err_emote);
                                                res.status(500).send({status:"False", Error:err_emote, message: "Some error occurred while Find The Capture Emote List."});
                                            } else {
                                                result.User_Name = User_Info.Inscube_Name;
                                                result.User_Image = User_Info.Image;
                                                result.Emotes = emote_Info;
                                                result.Comments = [];
                                                res.status(200).send({ Status:"True", Output: "True", Response: result });
                                            }
                                        });
                                    }
                                });
                            }).catch( err_1 => { 
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Update Cube Info Find Promise Error', 'Posts.controller.js ', err_1);
                                res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Capture Update Cube Info Find Promise Error "});
                            });
                
                            const Category_Info = info =>
                                Promise.all([ 
                                    CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                    ]).then( Data => {
                                        return Data[0];
                                    }).catch(error => {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Update Cube Info find Promise Error', 'Posts.controller.js', error);
                                    });     
                            GetCategory_Info(cubeIds);
                        }
                    });
                }
            });
         }
    });
};

// -----------------------------------------------------------  Cube Capture Delete ----------------------------------------------------------
exports.CubeCapture_Delete = function(req, res) {
    if(!req.params.Capture_Id || req.params.Capture_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{

        CaptureModel.Cube_Captureschema.findOne({'_id': req.params.Capture_Id }, function(Capture_err, Capture_result) {
            if(Capture_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Find Query Error', 'Cubes.controller.js - 12', Capture_err);
                res.status(500).send({status:"False", Error:Capture_err, message: "Some error occurred while Find The  Cube Capture info."});
            } else {
                
                UserModel.Post_NotificationSchema.where({ Capture_Id: req.params.Capture_Id }).updateMany({ $set: { Active_Status: 'Inactive' }}).exec();
                Capture_result.Active_Status = 'Inactive';

                Capture_result.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Delete Query Error', 'Capture.controller.js', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Capture Delete"});           
                    } else {
                        res.status(200).send({ Status:"True", Output: "True", Response: result });
                    }
                });
            }
        });
    }
};

// -----------------------------------------------------------  Report Capture Submit Check --------------------------------------------------
exports.Report_Capture_Check = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Capture_Id || req.body.Capture_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Capture Id can not be empty" });
    }else{
        CaptureModel.Report_Captureschema.findOne({'User_Id': req.body.User_Id, 'Capture_Id': req.body.Capture_Id }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Report find Query Error', 'Posts.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Capture Find"});           
            } else {
                if (result === null) {
                    res.status(200).send({ Status:"True", Output: "True", Available: 'True' });
                }else{
                    res.status(200).send({ Status:"True", Output: "True", Available: 'False' });
                }
            }
        });
    }
};

// -----------------------------------------------------------  Report Post Submit ----------------------------------------------------------
exports.Report_Capture_Submit = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Capture_Id || req.body.Capture_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else if(!req.body.Report_Type || req.body.Report_Type === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Report Type can not be empty" });
    }else{

        var varReport_Captureschema = new CaptureModel.Report_Captureschema({
            User_Id: req.body.User_Id,
            Capture_Id: req.body.Capture_Id,
            Report_Type: req.body.Report_Type,
            Report_Text: req.body.Report_Text || '',
            Active_Status: 'Active'
        });
        varReport_Captureschema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Report Submit Query Error', 'Posts.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Capture Report Submit"});           
            } else {
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
     }
};

// -----------------------------------------------------------  Cube Based Capture List ----------------------------------------------------------
exports.Cube_Based_Capture_List = function(req, res) {

    if(!req.params.Cube_Id || req.params.Cube_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else{
        CaptureModel.Cube_Captureschema.find({ 'Cube_Ids': req.params.Cube_Id, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 } }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Find Query Error', 'Capture.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The Cube Capture."});
            } else {
                result =  JSON.parse(JSON.stringify(result));
                
                const Get_Post_Info = (result) => Promise.all(
                    result.map(info_1 => PostInfo(info_1)) 
                    ).then( result_2 => {
                            result_2.sort(function(a,b) { return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); });
                            result_2 = result_2.map((Objects) => {  Objects.Time_Ago = moment(Objects.Time_Ago).fromNow();  return Objects; });
                            result_2.reverse();
                            res.status(200).send({ Status:"True", Output: "True", Response: result_2  });
                    }).catch( err_2 => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Capture Info Find Promise Error', 'Capture.controller.js', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Related Capture Info Promise Error"});
                    });

                    const PostInfo = info_1 =>
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            CaptureModel.Capture_Emoteschema.find({ 'Capture_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Capture_User_Id }, { Inscube_Name: 1}).exec(),
                            ]).then( Data => {

                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Time_Ago = info_1.updatedAt;
                                info_1.Emotes = Data[1];
                                if(Data[2] !== null){ info_1.Post_Owner_Name = Data[2].Inscube_Name; }
                                info_1.Comments = [];
                                var cubeIds = info_1.Cube_Ids;

                                    const GetCategory_Info = (cubeIds) => Promise.all(
                                            cubeIds.map(info => Category_Info(info)) 
                                        ).then( result_3 => {
                                            info_1.Cubes_Info = result_3;
                                            return info_1;
                                        }).catch( err_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Capture Cube Info Find Promise Error', 'Capture.controller.js', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Related Capture Cube Info Promise Error "});
                                        });
                        
                                        const Category_Info = info =>
                                            Promise.all([
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Capture Cube Info Find Promise Error', 'Capture.controller.js', error);
                                                });     
                                return GetCategory_Info(cubeIds);

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Capture Info Find Promise Error', 'Capture.controller.js', error_1);
                            });     
                Get_Post_Info(result);              
            }
        });
    }
};

// -----------------------------------------------------------   User Captures ----------------------------------------------------------
exports.User_Captures = function(req, res) {

    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else{
        CaptureModel.Cube_Captureschema.find({ 'User_Id': req.params.User_Id, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 } }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Capture List Find Query Error', 'Capture.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The User Based Cube Capture List."});
            } else {
                result =  JSON.parse(JSON.stringify(result));
                
                const Get_Post_Info = (result) => Promise.all(
                    result.map(info_1 => PostInfo(info_1)) 
                    ).then( result_2 => {
                            result_2.sort(function(a,b) {
                                return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                            });
                            result_2 = result_2.map((Objects) => {
                                    Objects.Time_Ago = moment(Objects.Time_Ago).fromNow();
                                return Objects;
                            });
                            result_2.reverse();

                            res.status(200).send({ Status:"True", Output: "True", Response: result_2  });
                    }).catch( err_2 => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Capture List Find Promise Error', 'Capture.controller.js', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the User Based Cube Capture List Promise Error "});
                    });

                    const PostInfo = info_1 =>
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            PostModel.Post_Emoteschema.find({ 'Capture_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Capture_User_Id }, { Inscube_Name: 1}).exec(),
                            ]).then( Data => {

                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Time_Ago = info_1.updatedAt;
                                info_1.Emotes = Data[1];
                                if(Data[2] !== null){ info_1.Post_Owner_Name = Data[2].Inscube_Name; }
                                info_1.Comments = [];
                                var cubeIds = info_1.Cube_Ids;

                                    const GetCategory_Info = (cubeIds) => Promise.all(
                                            cubeIds.map(info => Category_Info(info)) 
                                        ).then( result_3 => {
                                            info_1.Cubes_Info = result_3;
                                            return info_1;
                                        }).catch( err_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Capture List Cube Info Find Promise Error', 'Capture.controller.js', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the User Based Cube Capture List Cube Info Promise Error "});
                                        });
                        
                                        const Category_Info = info =>
                                            Promise.all([ 
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Capture List Cube Info Promise Error', 'Capture.controller.js', error);
                                                });     
                                return GetCategory_Info(cubeIds); 

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Capture List Promise Error', 'Capture.controller.js', error_1);
                            });     
                Get_Post_Info(result);
                            
            }
        });
    }
};

// -----------------------------------------------------------  Cube Capture Share ----------------------------------------------------------
exports.Cube_Capture_Share = function(req, res) {
    
    var Cubes_List =JSON.parse(req.body.Cube_Ids);

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Capture_Id || req.body.Capture_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Capture Id can not be empty" });
    }else if(!Cubes_List || Cubes_List.length <= 0 ){
        res.status(200).send({Status:"True", Output:"False", Message: "Selected Cubes can not be empty" });
    }else{
        CaptureModel.Cube_Captureschema.findOne({'_id': req.body.Capture_Id }, function(post_err, Post_result) {
            if(post_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Find Query Error', 'Capture.controller.js', post_err);
                res.status(500).send({status:"False", Error:post_err, message: "Some error occurred while Find The Cube Capture."});
            } else {
                
                var varCube_Captureschema = new CaptureModel.Cube_Captureschema({
                    User_Id: req.body.User_Id,
                    Cube_Ids: Cubes_List,
                    Capture_Text: Post_result.Capture_Text,
                    Shared_Capture: 'True',
                    Shared_Capture_User_Id: Post_result.User_Id,
                    Shared_Capture_Id: Post_result._id,
                    Capture_Video: Post_result.Attachments,
                    Active_Status: 'Active'
                });
                varCube_Captureschema.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Share Submit Query Error', 'Capture.controller.js', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Capture Share Submit"});           
                    } else {
                        result = JSON.parse(JSON.stringify(result));
                        UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                            if(err_user) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Capture.controller.js', err_user);
                                res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The User Info."});
                            } else {
                                UserModel.UserSchema.findOne({'_id': result.Shared_Capture_User_Id }, { Inscube_Name: 1}, function(err_share_user, Share_User_Info) {
                                    if(err_share_user) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Info FindOne Query Error', 'Capture.controller.js', err_share_user);
                                        res.status(500).send({status:"False", Error:err_share_user, message: "Some error occurred while Find The User Info."});
                                    } else {
                                        result.Time_Ago = moment(result.updatedAt).fromNow();
                                        result.User_Name = User_Info.Inscube_Name;
                                        result.Capture_Owner_Name = Share_User_Info.Inscube_Name;
                                        result.User_Image = User_Info.Image;
                                        result.Emotes = [];
                                        result.Comments = [];
                                        
                                        var cubeIds = result.Cube_Ids;
        
                                        const GetCategory_Info = (cubeIds) => Promise.all(
                                            cubeIds.map(info => Category_Info(info)) 
                                        ).then( result_1 => {
                                                var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                    User_Id: req.body.User_Id,
                                                    To_User_Id: Post_result.User_Id,
                                                    Notify_Type: 'Capture_Shared',
                                                    Capture_Id: result._id,
                                                    Capture_Text: result.Capture_Text,
                                                    Cube_Id: cubeIds[0],
                                                    Emote_Id: '',
                                                    Opinion_Id: '',
                                                    Emote_Text: '',
                                                    View_Status: 0,
                                                    Active_Status: 'Active'
                                                });
                                                varPost_NotificationSchema.save();

                                                result.Cubes_Info = result_1;
                                                res.status(200).send({ Status:"True", Output: "True", Response: result });
                                        }).catch( err_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Share Capture Info Promise Error', 'Capture.controller.js', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Capture Share Capture Info Promise "});
                                        });
                            
                                        const Category_Info = info =>
                                            Promise.all([
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                CubeModel.Cube_Followersschema.find({'Cube_Id': info, 'Active_Status': 'Active' }).exec(),
                                                ]).then( Data => {
                                                    var Users_List = JSON.parse(JSON.stringify(Data[1]));
                                                    const Send_Notification = (Users_List) => Promise.all(
                                                            Users_List.map(_info => To_Notify(_info)) 
                                                        ).then( result_2 => { 
                                                            return Data[0];
                                                        }).catch( err_2 => { console.log( err_2 ); });
        
                                                        const To_Notify = _info => {
                                                            if (result.User_Id !== _info.User_Id) {
                                                                var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                                    User_Id: result.User_Id,
                                                                    To_User_Id: _info.User_Id,
                                                                    Notify_Type: 'Shared_Capture',
                                                                    Capture_Id: result._id,
                                                                    Capture_Text: result.Capture_Text,
                                                                    Cube_Id: info,
                                                                    Emote_Id: '',
                                                                    Opinion_Id: '',
                                                                    Emote_Text: '',
                                                                    View_Status: 0,
                                                                    Active_Status: 'Active'
                                                                });
                                                                varPost_NotificationSchema.save();
                                                            }
                                                            return _info;
                                                        };
                                                    return Send_Notification(Users_List);
    
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Share Capture Info Find Promise Error', 'Capture.controller.js', error);
                                                });     
                                        GetCategory_Info(cubeIds);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

};









// ----------------------------------------------------------------------  Capture Emote Submit ----------------------------------------------------------
exports.Capture_Emote_Submit = function(req, res) {
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Capture_Id || req.body.Capture_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Capture Id can not be empty" });
    }else if(!req.body.Emote_Text || req.body.Emote_Text === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Emote Text can not be empty" });
    }else{

        CaptureModel.Capture_Emoteschema.findOne({'Capture_Id': req.body.Capture_Id, 'User_Ids': req.body.User_Id, 'Emote_Text' : req.body.Emote_Text.toLowerCase(), 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Capture Emote FindOne Query ', 'Capture.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The Capture Emote FindOne."});
            } else {
                if ( result === null) {
                    CaptureModel.Capture_Emoteschema.findOne({'Capture_Id': req.body.Capture_Id, 'Emote_Text' : req.body.Emote_Text.toLowerCase(), 'Active_Status': 'Active' }, function(err_1, result_1) {
                        if(err_1) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Capture Emote FindOne Query', 'Capture.controller.js', err_1);
                            res.status(500).send({status:"False", Error:err_1, message: "Some error occurred while Find The Capture Emote FindOne."});
                        } else {
                            if ( result_1 !== null) {
                                result_1.User_Ids.push(req.body.User_Id);
                                result_1.Count = result_1.Count + 1;
                                result_1.save(function(err_2, result_2) {
                                    if(err_2) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Capture Emote Update Query Error', 'Posts.controller.js', err_2);
                                        res.status(500).send({Status:"False", Error: err_2, Message: "Some error occurred while Update the Capture Emote "});           
                                    } else {
                                        CaptureModel.Cube_Captureschema.findOne({'_id': result_1.Capture_Id }, function(err_4, result_4) {
                                            if(err_4) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture FindOne Query Error', 'Posts.controller.js', err_2);
                                                res.status(200).send({ Status:"True", Output: "True", Response: result_2 });           
                                            } else {
                                                result_4 = JSON.parse(JSON.stringify(result_4));
                                                if (result_4.User_Id !== req.body.User_Id) {
                                                    LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                                        var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                            User_Id: req.body.User_Id,
                                                            To_User_Id: result_4.User_Id,
                                                            Notify_Type: 'Capture_Emote',
                                                            Capture_Id: req.body.Capture_Id,
                                                            Capture_Text: result_4.Capture_Text,
                                                            Cube_Id: result_4.Cubes_Id[0],
                                                            Cube_Ids: result_4.Cubes_Id,
                                                            Emote_Id: result_2._id,
                                                            Opinion_Id: '',
                                                            Emote_Text: result_1.Emote_Text,
                                                            View_Status: 0,
                                                            Active_Status: 'Active'
                                                        });
                                                        varPost_NotificationSchema.save();
                                                        if (App_Info !== null) {
                                                            UserModel.UserSchema.findOne({'_id': req.body.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                                                                CubeModel.CubesSchema.findOne({ '_id':  result_4.Cubes_Id[0] }, {Category_Id: 1, Image: 1, Name: 1}, function(err_cube, Cube_Info) {
                                                                    var registrationToken = App_Info.Firebase_Token;
                                                                    var payload = {
                                                                        notification: {
                                                                            title: 'New Comment Added Your Capture Moment',
                                                                            body: User_Info.Inscube_Name + ' Commented ' + result_1.Emote_Text + ' to your Capture Moment in ' + Cube_Info.Name,
                                                                        },
                                                                        data: {
                                                                            type: 'Capture',
                                                                            _id: result_4._id
                                                                        }
                                                                    };
                                                                    var options = {
                                                                        priority: 'high',
                                                                        timeToLive: 60 * 60 * 24
                                                                    };
                                                                    admin.messaging().sendToDevice(registrationToken, payload, options);
                                                                    res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                                                                });
                                                            });
                                                        }else{
                                                            res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                                                        }
                                                    });
                                                } else {
                                                    res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                                                }
                                            }
                                        });
                                    }
                                });
                            } else {
                                var Ids = [];
                                Ids.push(req.body.User_Id);
                                var varCapture_Emoteschema = new CaptureModel.Capture_Emoteschema({
                                    User_Ids: Ids,
                                    Capture_Id: req.body.Capture_Id,
                                    Emote_Text: req.body.Emote_Text.toLowerCase(),
                                    Count: 1,
                                    Active_Status: 'Active'
                                });
                                varCapture_Emoteschema.save(function(err_3, result_3) {
                                    if(err_3) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Emote Submit Query Error', 'Capture.controller.js', err_3);
                                        res.status(500).send({Status:"False", Error:err_3, Message: "Some error occurred while Submit the Capture Emote"});           
                                    } else {
                                        CaptureModel.Cube_Captureschema.findOne({'_id': req.body.Capture_Id }, function(err_4, result_4) {
                                            if(err_4) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture_Id FindOne Query Error', 'Capture.controller.js', err_2);
                                                res.status(200).send({ Status:"True", Output: "True", Response: result_3 });           
                                            } else {
                                                result_4 = JSON.parse(JSON.stringify(result_4));
                                                if (result_4.User_Id !== req.body.User_Id) {
                                                    LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                                        var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                            User_Id: req.body.User_Id,
                                                            To_User_Id: result_4.User_Id,
                                                            Notify_Type: 'Capture_Emote',
                                                            Capture_Id: req.body.Capture_Id,
                                                            Capture_Text: result_4.Capture_Text,
                                                            Cube_Id: result_4.Cubes_Id[0],
                                                            Cube_Ids: result_4.Cubes_Id,
                                                            Emote_Id: result_3._id,
                                                            Opinion_Id: '',
                                                            Emote_Text: result_3.Emote_Text,
                                                            View_Status: 0,
                                                            Active_Status: 'Active'
                                                        });
                                                        varPost_NotificationSchema.save();
                                                        if (App_Info !== null) {
                                                            UserModel.UserSchema.findOne({'_id': req.body.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                                                                CubeModel.CubesSchema.findOne({ '_id':  result_4.Cubes_Id[0] }, {Category_Id: 1, Image: 1, Name: 1}, function(err_cube, Cube_Info) {
                                                                    var registrationToken = App_Info.Firebase_Token;
                                                                    var payload = {
                                                                        notification: {
                                                                            title: 'New Comment Added Your Capture Moment',
                                                                            body: User_Info.Inscube_Name + ' Commented ' + result_1.Emote_Text + ' to your Capture Moment in ' + Cube_Info.Name,
                                                                        },
                                                                        data: {
                                                                            type: 'Capture',
                                                                            _id: result_4._id
                                                                        }
                                                                    };
                                                                    var options = {
                                                                        priority: 'high',
                                                                        timeToLive: 60 * 60 * 24
                                                                    };
                                                                    admin.messaging().sendToDevice(registrationToken, payload, options);
                                                                    res.status(200).send({ Status:"True", Output: "True", Response: result_3 });
                                                                });
                                                            });
                                                        }else{
                                                            res.status(200).send({ Status:"True", Output: "True", Response: result_3 });
                                                        }
                                                    });
                                                } else {
                                                    res.status(200).send({ Status:"True", Output: "True", Response: result_3 });
                                                }
                                            }
                                        });
                                    }
                                });
                            } 
                        }
                    });
                } else {
                    res.status(200).send({ Status:"True", Output: "False", Message: 'Already exists! vote for it' });
                }

            }
        });
    }
};

// ----------------------------------------------------------------------  Capture Emote Update ----------------------------------------------------------
exports.Capture_Emote_Update = function(req, res) {
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Capture_Id || req.body.Capture_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Capture Id can not be empty" });
    }else if(!req.body.Emote_Id || req.body.Emote_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Emote Id can not be empty" });
    }else{

        CaptureModel.Capture_Emoteschema.findOne({'Capture_Id': req.body.Capture_Id, '_id': req.body.Emote_Id, 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                if ( result !== null) {
                    result.User_Ids.push(req.body.User_Id);
                    result.Count = result.Count + 1;
                    result.save(function(err_1, result_1) {
                        if(err_1) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err_1);
                            res.status(500).send({Status:"False", Error: err_1, Message: "Some error occurred while Cube Post Submit"});           
                        } else {
                            CaptureModel.Cube_Captureschema.findOne({'_id': req.body.Capture_Id }, function(err_4, result_4) {
                                if(err_4) {
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Submit Query Error', 'Capture.controller.js - 62', err_2);
                                    res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                                } else {
                                    result_4 = JSON.parse(JSON.stringify(result_4));
                                    if (result_4.User_Id !== req.body.User_Id) {
                                        LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                            var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                User_Id: req.body.User_Id,
                                                To_User_Id: result_4.User_Id,
                                                Notify_Type: 'Capture_Emote',
                                                Capture_Id: req.body.Capture_Id,
                                                Capture_Text: result_4.Capture_Text,
                                                Cube_Id: result_4.Cubes_Id[0],
                                                Cube_Ids: result_4.Cubes_Id,
                                                Emote_Id: result_1._id,
                                                Opinion_Id: '',
                                                Emote_Text: result_1.Emote_Text,
                                                View_Status: 0,
                                                Active_Status: 'Active'
                                            });
                                            varPost_NotificationSchema.save();
                                            if (App_Info !== null) {
                                                UserModel.UserSchema.findOne({'_id': req.body.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                                                    CubeModel.CubesSchema.findOne({ '_id':  result_4.Cubes_Id[0] }, {Category_Id: 1, Image: 1, Name: 1}, function(err_cube, Cube_Info) {
                                                        var registrationToken = App_Info.Firebase_Token;
                                                        var payload = {
                                                            notification: {
                                                                title: 'New Comment Added Your Capture Moment',
                                                                body: User_Info.Inscube_Name + ' Commented ' + result_1.Emote_Text + ' to your Capture Moment in ' + Cube_Info.Name,
                                                            },
                                                            data: {
                                                                type: 'Capture',
                                                                _id: result_4._id
                                                            }
                                                        };
                                                        var options = {
                                                            priority: 'high',
                                                            timeToLive: 60 * 60 * 24
                                                        };
                                                        admin.messaging().sendToDevice(registrationToken, payload, options);
                                                        res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                                                    });
                                                });
                                            }else{
                                                res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                                            }
                                        });
                                    } else {
                                        res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                                    }
                                }
                            });
                        }
                    });
                } else {
                    res.status(200).send({ Status:"True", Output: "False", Message: 'Some Error Occurred!' });
                }
            }
        });
    }
};

// ----------------------------------------------------------------------  Capture Comment Submit ----------------------------------------------------------
exports.Capture_Comment_Submit = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Capture_Id || req.body.Capture_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Capture Id can not be empty" });
    }else if(!req.body.Comment_Text || req.body.Comment_Text === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Comment can not be empty" });
    }else{

        var varCapture_Commentschema = new CaptureModel.Capture_Commentschema({
            User_Id: req.body.User_Id,
            Capture_Id: req.body.Capture_Id,
            Comment_Text: req.body.Comment_Text,
            Active_Status: 'Active'
        });
        varCapture_Commentschema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment Submit Query Error', 'Capture.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Submit the Cube Capture Comment"});           
            } else {
                
                UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                    if(err_user) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Capture.controller.js', err_user);
                        res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The User Info."});
                    } else {
                        result = JSON.parse(JSON.stringify(result));
                        result.User_Name = User_Info.Inscube_Name;
                        result.User_Image = User_Info.Image;
                        result.Time_Ago = moment(result.updatedAt).fromNow();
                        CaptureModel.Cube_Captureschema.findOne({'_id': req.body.Capture_Id }, function(err_4, result_4) {
                            if(err_4) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture FindOne Query Error', 'Capture.controller.js', err_2);
                                res.status(200).send({ Status:"True", Output: "True", Response: result });           
                            } else {
                                result_4 = JSON.parse(JSON.stringify(result_4));
                                if (result_4.User_Id !== req.body.User_Id) {
                                    LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                        var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                            User_Id: req.body.User_Id,
                                            To_User_Id: result_4.User_Id,
                                            Notify_Type: 'Capture_Opinion',
                                            Capture_Id: req.body.Capture_Id,
                                            Capture_Text: result_4.Capture_Text,
                                            Cube_Id: result_4.Cubes_Id[0],
                                            Cube_Ids: result_4.Cubes_Id,
                                            Emote_Id: '',
                                            Opinion_Id: result._id,
                                            Emote_Text: '',
                                            View_Status: 0,
                                            Active_Status: 'Active'
                                        });
                                        varPost_NotificationSchema.save();
                                        if (App_Info !== null) {
                                            CubeModel.CubesSchema.findOne({ '_id':  result_4.Cubes_Id[0] }, {Category_Id: 1, Image: 1, Name: 1}, function(err_cube, Cube_Info) {
                                                var registrationToken = App_Info.Firebase_Token;
                                                var payload = {
                                                    notification: {
                                                        title: 'New Opinion on your Capture Moment',
                                                        body: User_Info.Inscube_Name + ' Shared an Opinion on your Capture Moment in ' + Cube_Info.Name,
                                                    },
                                                    data: {
                                                        type: 'Capture',
                                                        _id: result_4._id
                                                    }
                                                };
                                                var options = {
                                                    priority: 'high',
                                                    timeToLive: 60 * 60 * 24
                                                };
                                                admin.messaging().sendToDevice(registrationToken, payload, options);
                                                res.status(200).send({ Status:"True", Output: "True", Response: result });
                                            });
                                        }
                                    });
                                } else{
                                    res.status(200).send({ Status:"True", Output: "True", Response: result });
                                }
                            }
                        });
                    }
                });
            }
        });
     }
};

// ----------------------------------------------------------------------  Capture Comment List ----------------------------------------------------------
exports.Capture_Comment_List = function(req, res) {

    if(!req.params.Capture_Id || req.params.Capture_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Capture Id can not be empty" });
    }else{
        CaptureModel.Capture_Commentschema.find({'Capture_Id': req.params.Capture_Id, 'Active_Status': 'Active' }, {__v: 0}, {sort: { updatedAt: -1 }}, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment Find Query Error', 'Capture.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Find Cube Capture Comment "});          
            } else {
                result = JSON.parse(JSON.stringify(result));
                
                const GetUser_Info = (result) => Promise.all(
                    result.map(info => User_Info(info))
                ).then( result_1 => { 
                            res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                }).catch( err_1 => { 
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment Find Promise Error', 'Capture.controller.js', err_1);
                    res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find Cube Capture Comment  "});
                });
    
                const User_Info = info =>
                    Promise.all([
                        UserModel.UserSchema.findOne({ '_id': info.User_Id }, { Image: 1, Inscube_Name: 1}).exec(),
                        ]).then( Data => {
                            info.User_Name = Data[0].Inscube_Name;
                            info.User_Image = Data[0].Image;
                            info.Time_Ago = moment(info.updatedAt).fromNow();
                            return info;
                        }).catch(error => {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment User Info Find Promise Error', 'Capture.controller.js', error);
                        });     
                GetUser_Info(result);
            }
        });
     }
};

// ----------------------------------------------------------------------  Capture Comment Update ----------------------------------------------------------
exports.Capture_Comment_Update = function(req, res) {

    if(!req.body.Comment_Id || req.body.Comment_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Comment Id can not be empty" });
    }else if(!req.body.Comment_Text || req.body.Comment_Text === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Comment can not be empty" });
    }else{
        CaptureModel.Capture_Commentschema.findOne({'_id': req.body.Comment_Id, 'Active_Status': 'Active' }, function(comment_err, Comment_result) {
            if(comment_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment Find Query Error', 'Capture.controller.js', comment_err);
                res.status(500).send({Status:"False", Error:comment_err, Message: "Some error occurred while Find Cube Capture Find"});           
            } else {
                Comment_result.Comment_Text = req.body.Comment_Text;
                Comment_result.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment Update Query Error', 'Capture.controller.js ', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while  Update Cube Capture Comment"});           
                    } else {
                        UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                            if(err_user) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment UserInfo FindOne Query Error', 'Capture.controller.js', err_user);
                                res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The Cube Capture Comment  User Info."});
                            } else {
                                result = JSON.parse(JSON.stringify(result));
                                result.User_Name = User_Info.Inscube_Name;
                                result.User_Image = User_Info.Image;
                                result.Time_Ago = moment(result.updatedAt).fromNow();
                                res.status(200).send({ Status:"True", Output: "True", Response: result });
                            }
                        });
                    }
                });
            }
        });
     }
};

// ----------------------------------------------------------------------  Capture Comment Delete ----------------------------------------------------------
exports.Capture_Comment_Delete = function(req, res) {

    if(!req.params.Capture_Comment_Id || req.params.Capture_Comment_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Capture Comment Id can not be empty" });
    }else{
        CaptureModel.Capture_Commentschema.findOne({'_id': req.params.Capture_Comment_Id }, function(comment_err, Comment_result) {
            if(comment_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment Info FindOne Query Error', 'Posts.controller.js', comment_err);
                res.status(500).send({Status:"False", Error:comment_err, Message: "Some error occurred while Find The Cube Capture Comment Info"});           
            } else {

                UserModel.Post_NotificationSchema.where({ Opinion_Id: req.params.Capture_Comment_Id}).updateMany({ $set: { Active_Status: 'Inactive' }}).exec();
                Comment_result.Active_Status = 'Inactive';

                Comment_result.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment Update Query Error', 'Posts.controller.js', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Update The Cube Capture Comment"});           
                    } else {
                        res.status(200).send({ Status:"True", Output: "True", Response: result });
                    }
                });
            }
        });
     }
};

// ---------------------------------------------------------------------- Report Capture Comment Submit Check ----------------------------------------------------------
exports.Report_CaptureComment_Check = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Comment_Id || req.body.Comment_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{
        CaptureModel.Report_Capture_Commentschema.findOne({'User_Id': req.body.User_Id, 'Comment_Id': req.body.Comment_Id }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment Report Info FindOne  Query Error', 'Capture.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Find the Cube Capture Comment Report"});           
            } else {
                if (result === null) {
                    res.status(200).send({ Status:"True", Output: "True", Available: 'True' });
                }else{
                    res.status(200).send({ Status:"True", Output: "True", Available: 'False' });
                }
            }
        });
    }
};

// ---------------------------------------------------------------------- Report Capture Comment Submit ----------------------------------------------------------
exports.Report_CaptureComment_Submit = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Comment_Id || req.body.Comment_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Comment Id can not be empty" });
    }else if(!req.body.Report_Type || req.body.Report_Type === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Report Type can not be empty" });
    }else{
        var varReport_Capture_Commentschema = new CaptureModel.Report_Capture_Commentschema({
            User_Id: req.body.User_Id,
            Comment_Id: req.body.Comment_Id,
            Report_Type: req.body.Report_Type,
            Report_Text: req.body.Report_Text,
            Active_Status: 'Active'
        });
        varReport_Capture_Commentschema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Capture Comment Report Submit Query Error', 'Capture.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Submit the Cube Capture Comment Report"});           
            } else {
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
     }
};
