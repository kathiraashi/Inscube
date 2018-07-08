var ErrorManagement = require('./../../app/config/ErrorHandling.js');
var CubeModel = require('../models/Cubes.model.js');
var PostModel = require('../models/Post.model.js');
var UserModel = require('../models/User.model.js');
var LoginInfoModel = require('../models/Login_Info.model.js');
var multer = require('multer');
var moment = require('moment');
var axios = require("axios");

var admin = require('firebase-admin');

// Cube Post File Upload Disk Storage and Validate Functions ----------------------------------------------------------------------------------------
var Cube_Post_File_Storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, './Uploads/Post_Attachments'); },
    filename: (req, file, cb) => {
        let extArray = file.originalname.split(".");
        let extension = (extArray[extArray.length - 1]).toLowerCase();
     cb(null, 'Post_' + Date.now() + '.' + extension);
    }
});
var Cube_Post_File_Upload = multer({
    storage: Cube_Post_File_Storage,
    fileFilter: function (req, file, callback) {
        let extArray = file.originalname.split(".");
        let extension = (extArray[extArray.length - 1]).toLowerCase();
        if(extension !== 'png' && extension !== 'jpg' && extension !== 'gif' && extension !== 'jpeg' && extension !== 'mp4' && extension !== 'mkv' && extension !== '3gp' && extension !== 'flv' && extension !== 'pdf') {
            return callback("Only 'png, gif, jpg, jpeg,  mp4, mkv, flv, 3gp and pdf' are allowed");
        }
        callback(null, true);
    }
}).array('attachments', 20);



exports.Test_Push = function(req, res) {
    if(!req.body.Firebase_Token || req.body.Firebase_Token === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Firebase Token can not be empty" });
    }else if(!req.body.Post_Id || req.body.Post_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{
        var registrationToken = req.body.Firebase_Token;
        var payload = {
            notification: {
                title: ' Test Push Notifications',
                body: 'Test Body of Push Notification in Inscube',
            },
            data: {
                type: 'Highlight',
                _id: req.body.Post_Id
            }
        };
        var options = {
            priority: 'high',
            timeToLive: 60 * 60 * 24
        };
        admin.messaging().sendToDevice(registrationToken, payload, options)
        .then(function(response) {
            res.status(200).send({Status:"True", Output:response });
        }).catch( err => {
            res.status(200).send({Status:"False", Output:err });
        });
    }
};


// ----------------------------------------------------------------------  Cube Post Submit ----------------------------------------------------------
exports.CubePost_Submit = function(req, res) {
    Cube_Post_File_Upload(req, res, function(upload_err) {

        var Cubes_List =JSON.parse(req.body.Cubes_Id);

        if(!req.body.User_Id || req.body.User_Id === '') {
            res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
        }else if(!req.body.Post_Category || req.body.Post_Category === ''){
            res.status(200).send({Status:"True", Output:"False", Message: "Post Category can not be empty" });
        }else if(!Cubes_List || Cubes_List.length <= 0 ){
            res.status(200).send({Status:"True", Output:"False", Message: "Selected Cubes can not be empty" });
        }else{
            var Return_Json = [];
            var Attach_File = [];
            if ( req.files.length > 0) {
                var Json = JSON.parse(JSON.stringify(req.files));
                Json.map((Objects) => {
                    let extArray = Objects.filename.split(".");
                    let extension = (extArray[extArray.length - 1]).toLowerCase();
                    if (extension === 'png' || extension === 'jpg' || extension === 'gif' || extension === 'jpeg' ) {
                        Return_Json.push({ File_Name: Objects.filename, File_Type: 'Image', Size: Objects.size});
                    }else if ( extension === 'mp4' || extension === 'mkv' || extension === '3gp' || extension === 'flv') {
                        Return_Json.push({ File_Name: Objects.filename, File_Type: 'Video', Size: Objects.size});
                    }else {
                        Attach_File.push({ File_Name: Objects.filename, File_Type: 'File', Size: Objects.size} );
                    }
                });
            }
            var LinkInfo = {};
            if(req.body.Post_Link && req.body.Post_Link !== '') {
                var str = req.body.Post_Link;
                var n = str.indexOf('http://www.youtube');
                var n1 = str.indexOf('https://www.youtube');
                var n2 = str.indexOf('https://youtu');
        
                if( n !== -1 || n1 !== -1 || n2 !== -1  ) {
                    gotonext();
                }else{
                    axios.get('http://api.linkpreview.net/?key=5a883a1e4c1cd65a5a1d19ec7011bb4a8ee7426a5cdcb&q='+ req.body.Post_Link )
                    .then(response => {
                         LinkInfo = response.data;
                        gotonext();
                    })
                    .catch(error => {
                        gotonext();
                    });
                }
            }else{
                gotonext();
            }
            function gotonext() {
                
                var varCube_Postschema = new PostModel.Cube_Postschema({
                    User_Id: req.body.User_Id,
                    Cubes_Id: Cubes_List,
                    Post_Category: req.body.Post_Category,
                    Post_Text: req.body.Post_Text || '',
                    Post_Link: req.body.Post_Link,
                    Post_Link_Info: LinkInfo,
                    Shared_Post: 'False',
                    Attachments: Return_Json,
                    Attach_File: Attach_File,
                    Active_Status: 'Active'
                });
                varCube_Postschema.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
                    } else {
                        result = JSON.parse(JSON.stringify(result));
                        UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                            if(err_user) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Cubes.controller.js - 12', err_user);
                                res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The  User Info."});
                            } else {
                                result.Time_Ago = moment(result.updatedAt).fromNow();
                                result.User_Name = User_Info.Inscube_Name;
                                result.User_Image = User_Info.Image;
                                result.Emotes = [];
                                result.Comments = [];
                                
                                var cubeIds = result.Cubes_Id;

                                const GetCategory_Info = (cubeIds) => Promise.all(  // Main Promise For Category info Get --------------
                                    cubeIds.map(info => Category_Info(info)) 
                                ).then( result_1 => {
                                        result.Cubes_Info = result_1;
                                        res.status(200).send({ Status:"True", Output: "True", Response: result });
                                }).catch( err_1 => { 
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_1);
                                    res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Post Submit Category Info Find Promise Error "});
                                });
                    
                                const Category_Info = info => // Sub Promise For Category info Find --------------
                                    Promise.all([
                                        CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                        CubeModel.Cube_Followersschema.find({'Cube_Id': info, 'Active_Status': 'Active' }).exec(),
                                        ]).then( Data => {
                                            var Users_List = JSON.parse(JSON.stringify(Data[1]));

                                            const Send_Notification = (Users_List) => Promise.all(
                                                    Users_List.map(_info => To_Notify(_info)) 
                                                ).then( result_2 => { return Data[0];
                                                }).catch( err_2 => { console.log( err_2 ); });

                                                const To_Notify = _info => {
                                                    LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': _info.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                                        if (result.User_Id !== _info.User_Id) {
                                                            var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                                User_Id: result.User_Id,
                                                                To_User_Id: _info.User_Id,
                                                                Notify_Type: 'New_Post',
                                                                Post_Id: result._id,
                                                                Post_Type: result.Post_Category,
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
                                                            const PType = result.Post_Category;
                                                            var TextAddon = 'a';
                                                            var Post_Type = PType;
                                                            if (PType === 'News' || PType === 'Idea' || PType === 'Article/Blog') { TextAddon = 'an'; }
                                                            if (PType === 'News') {  Post_Type = 'Announcement'; }
                                                            if (PType === 'Article/Blog') { Post_Type = 'Article'; }
                                                            if (PType === 'Moments') { Post_Type = 'Moment'; }

                                                            var registrationToken = App_Info.Firebase_Token;
                                                            var payload = {
                                                                notification: {
                                                                    title: 'New highlight post',
                                                                    body: User_Info.Inscube_Name + ' posted ' + TextAddon + ' ' + Post_Type + ' in ' + Data[0].Name,
                                                                },
                                                                data: {
                                                                    type: 'Highlight',
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

                                            // return Data[0];
                                        }).catch(error => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error);
                                        });     
                                GetCategory_Info(cubeIds); // Main Promise Call Function Category Info --------------
                            }
                        });
                    }
                });
            }
         }
    });
};

// ----------------------------------------------------------------------  Cube Post List ----------------------------------------------------------
exports.CubePost_List = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        CubeModel.Cube_Followersschema.find({'User_Id': req.params.User_Id, 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                var CubesArray = [];
                var Return_Json = result.map((Objects) => {
                    CubesArray.push(Objects.Cube_Id);
                });
                var Skip_Count = parseInt(req.params.Skip_Count);
                PostModel.Cube_Postschema.find({'Cubes_Id': { $in: CubesArray }, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 }, skip: Skip_Count, limit: 15 }, function(err_1, result_1) {
                    if(err_1) {
                        res.status(500).send({status:"False", Error:err_1});
                    } else {
                        result_1 = JSON.parse(JSON.stringify(result_1));
                        
                        const Get_Post_Info = (result_1) => Promise.all(
                            result_1.map(info_1 => PostInfo(info_1)) 
                        ).then( result_2 => {
                                result_2 = result_2.map((Objects) => { Objects.Time_Ago = moment(Objects.Time_Ago).fromNow();  return Objects; });
                                res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                        }).catch( err_2 => {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_2);
                            res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Post Submit Info Find Promise Error "});
                        });
                        const PostInfo = info_1 =>
                            Promise.all([
                                UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                                PostModel.Post_Emoteschema.find({ 'Post_Id': info_1._id }).exec(),
                                UserModel.UserSchema.findOne({ '_id': info_1.Shared_Post_User_Id }, { Inscube_Name: 1}).exec(),
                                ]).then( Data => {
                                    info_1.User_Name = Data[0].Inscube_Name;
                                    info_1.User_Image = Data[0].Image;
                                    info_1.Time_Ago = info_1.updatedAt;
                                    info_1.Emotes = Data[1];
                                    if(Data[2] !== null){ info_1.Post_Owner_Name = Data[2].Inscube_Name; }
                                    info_1.Comments = [];
                                    var cubeIds = info_1.Cubes_Id;

                                        const GetCategory_Info = (cubeIds) => Promise.all(
                                                cubeIds.map(info => Category_Info(info)) 
                                            ).then( result_3 => {
                                                info_1.Cubes_Info = result_3;
                                                return info_1;
                                            }).catch( err_1 => {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_1);
                                                res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Post Submit Category Info Find Promise Error "});
                                            });
                            
                                            const Category_Info = info =>
                                                Promise.all([ 
                                                    CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                    ]).then( Data => {
                                                        return Data[0];
                                                    }).catch(error => {
                                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error);
                                                    });     
                                    return GetCategory_Info(cubeIds);

                                }).catch(error_1 => {
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error_1);
                                });     
                        Get_Post_Info(result_1);
                    }
                });
            }
        });
    }
};

// ----------------------------------------------------------------------  Cube Post All List ----------------------------------------------------------
exports.CubePost_All_List = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        CubeModel.Cube_Followersschema.find({'User_Id': req.params.User_Id, 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                var CubesArray = [];
                var Return_Json = result.map((Objects) => {
                    CubesArray.push(Objects.Cube_Id);
                });
                
                PostModel.Cube_Postschema.find({'Cubes_Id': { $in: CubesArray }, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 } }, function(err_1, result_1) {
                    if(err_1) {
                        res.status(500).send({status:"False", Error:err_1});
                    } else {
                        result_1 = JSON.parse(JSON.stringify(result_1));
                        const Get_Post_Info = (result_1) => Promise.all(
                            result_1.map(info_1 => PostInfo(info_1)) 
                        ).then( result_2 => {
                                result_2 = result_2.map((Objects) => { Objects.Time_Ago = moment(Objects.Time_Ago).fromNow();  return Objects; });
                                res.status(200).send({ Status:"True", Output: "True", Response: result_2  });
                        }).catch( err_2 => {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_2);
                            res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Post Submit Info Find Promise Error "});
                        });
                        const PostInfo = info_1 =>
                            Promise.all([
                                UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                                PostModel.Post_Emoteschema.find({ 'Post_Id': info_1._id }).exec(),
                                UserModel.UserSchema.findOne({ '_id': info_1.Shared_Post_User_Id }, { Inscube_Name: 1}).exec(),
                                ]).then( Data => {
                                    info_1.User_Name = Data[0].Inscube_Name;
                                    info_1.User_Image = Data[0].Image;
                                    info_1.Time_Ago = info_1.updatedAt;
                                    info_1.Emotes = Data[1];
                                    if(Data[2] !== null){ info_1.Post_Owner_Name = Data[2].Inscube_Name; }
                                    info_1.Comments = [];
                                    var cubeIds = info_1.Cubes_Id;

                                        const GetCategory_Info = (cubeIds) => Promise.all(
                                                cubeIds.map(info => Category_Info(info)) 
                                            ).then( result_3 => {
                                                info_1.Cubes_Info = result_3;
                                                return info_1;
                                            }).catch( err_1 => {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_1);
                                                res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Post Submit Category Info Find Promise Error "});
                                            });
                            
                                            const Category_Info = info =>
                                                Promise.all([ 
                                                    CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                    ]).then( Data => {
                                                        return Data[0];
                                                    }).catch(error => {
                                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error);
                                                    });     
                                    return GetCategory_Info(cubeIds);

                                }).catch(error_1 => {
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error_1);
                                });     
                        Get_Post_Info(result_1);
                    }
                });
            }
        });
    }
};

// ----------------------------------------------------------------------  Cube Post view ----------------------------------------------------------
exports.CubePost_View = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.params.Post_Id || req.params.Post_Id === '') {
            res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{

        PostModel.Cube_Postschema.find({'_id': req.params.Post_Id }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                result = JSON.parse(JSON.stringify(result));
                const Get_Post_Info = (result) => Promise.all( // Second Level Main Promise For Category info Get --------------
                        result.map(info_1 => PostInfo(info_1)) 
                    ).then( result_2 => {
                            res.status(200).send({ Status:"True", Output: "True", Response: result_2  });
                    }).catch( err_2 => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Post Submit Info Find Promise Error "});
                    });

                    const PostInfo = info_1 => // Second Level Sub Promise For Category info Find --------------
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            PostModel.Post_Emoteschema.find({ 'Post_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Post_User_Id }, { Inscube_Name: 1}).exec(),
                            ]).then( Data => {
                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Time_Ago = moment(info_1.updatedAt).fromNow();
                                info_1.Emotes = Data[1];
                                if(Data[2] !== null){ info_1.Post_Owner_Name = Data[2].Inscube_Name; }
                                info_1.Comments = [];
                                var cubeIds = info_1.Cubes_Id;

                                    const GetCategory_Info = (cubeIds) => Promise.all(  // Third Main Promise For Category info Get --------------
                                            cubeIds.map(info => Category_Info(info)) 
                                        ).then( result_3 => {
                                            info_1.Cubes_Info = result_3;
                                            return info_1;
                                        }).catch( err_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Post Submit Category Info Find Promise Error "});
                                        });
                        
                                        const Category_Info = info => // Third Sub Promise For Category info Find --------------
                                            Promise.all([ 
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error);
                                                });     
                                return GetCategory_Info(cubeIds); // Third Main Promise Call Function Category Info --------------

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error_1);
                            });     
                Get_Post_Info(result); // Second Level Main Promise Call Function Category Info -------------
                            
            }
        });
    }
};

// ----------------------------------------------------------------------  Cube Post Update ----------------------------------------------------------
exports.CubePost_Update = function(req, res) {
    Cube_Post_File_Upload(req, res, function(upload_err) {
    
        var Cubes_List =JSON.parse(req.body.Cubes_Id);

        if(!req.body.Post_Id || req.body.Post_Id === '') {
            res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
        }else{

            PostModel.Cube_Postschema.findOne({'_id': req.body.Post_Id }, function(post_err, Post_result) {
                if(post_err) {
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', post_err);
                    res.status(500).send({status:"False", Error:post_err, message: "Some error occurred while Find The  User Followed Cube List."});
                } else {

                    var Return_Json = [];
                    var Attach_File = [];
                    if ( req.files.length > 0) {
                        var Json = JSON.parse(JSON.stringify(req.files));
                        Json.map((Objects) => {
                            let extArray = Objects.filename.split(".");
                            let extension = (extArray[extArray.length - 1]).toLowerCase();
                            if (extension === 'png' || extension === 'jpg' || extension === 'gif' || extension === 'jpeg' ) {
                                Return_Json.push({ File_Name: Objects.filename, File_Type: 'Image', Size: Objects.size});
                            }else if ( extension === 'mp4' || extension === 'mkv' || extension === '3gp' || extension === 'flv') {
                                Return_Json.push({ File_Name: Objects.filename, File_Type: 'Video', Size: Objects.size});
                            }else {
                                Attach_File.push({ File_Name: Objects.filename, File_Type: 'File', Size: Objects.size} );
                            }
                        });
                    }

                    var Old_Json = [];
                    var Old_Attach_File = [];
                    if (req.body.Old_Attachments && req.body.Old_Attachments !== undefined ) {
                        Old_Json = JSON.parse(req.body.Old_Attachments);
                    }
                    if (req.body.Old_Attach_File && req.body.Old_Attach_File !== undefined ) {
                        Old_Attach_File = JSON.parse(req.body.Old_Attach_File);
                    }

                    var LinkInfo = Post_result.Post_Link_Info;
                    if(req.body.Post_Link && req.body.Post_Link !== '' && req.body.Post_Link !== Post_result.Post_Link) {
                        var str = req.body.Post_Link;
                        var n = str.indexOf('http://www.youtube');
                        var n1 = str.indexOf('https://www.youtube');
                        var n2 = str.indexOf('https://youtu');
                
                        if( n !== -1 || n1 !== -1 || n2 !== -1  ) {
                            gotonext();
                        }else{
                            axios.get('http://api.linkpreview.net/?key=5a883a1e4c1cd65a5a1d19ec7011bb4a8ee7426a5cdcb&q='+ req.body.Post_Link )
                            .then(response => {
                                 LinkInfo = response.data;
                                gotonext();
                            })
                            .catch(error => {
                                gotonext();
                            });
                        }
                    }else{
                        gotonext();
                    }

                    
                    function gotonext() {
                        var NewReturn_Json = Return_Json.concat(Old_Json);
                        var Attach_Json = Attach_File.concat(Old_Attach_File);
                        Post_result.Cubes_Id = Cubes_List;
                        Post_result.Post_Category = req.body.Post_Category;
                        Post_result.Post_Text = req.body.Post_Text;
                        Post_result.Post_Link_Info = LinkInfo;
                        Post_result.Post_Link = req.body.Post_Link;
                        Post_result.Attachments = NewReturn_Json;
                        Post_result.Attach_File = Attach_Json;

                        Post_result.save(function(err, result) {
                            if(err) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
                            } else {
                                result = JSON.parse(JSON.stringify(result));
                                delete result.__v;
                                var cubeIds = result.Cubes_Id;
                                

                                const GetCategory_Info = (cubeIds) => Promise.all(  // Main Promise For Category info Get --------------
                                    cubeIds.map(info => Category_Info(info)) 
                                ).then( result_1 => {
                                        result.Cubes_Info = result_1;
                                        result.Time_Ago = moment(result.updatedAt).fromNow();

                                        UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                                            if(err_user) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Cubes.controller.js - 12', err_user);
                                                res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The User Info."});
                                            } else {
                                                PostModel.Post_Emoteschema.find({'Post_Id': result._id }, function(err_emote, emote_Info) {
                                                    if(err_emote) {
                                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Cubes.controller.js - 12', err_emote);
                                                        res.status(500).send({status:"False", Error:err_emote, message: "Some error occurred while Find The Post Emote List."});
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
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_1);
                                    res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Post Submit Category Info Find Promise Error "});
                                });
                    
                                const Category_Info = info => // Sub Promise For Category info Find --------------
                                    Promise.all([ 
                                        CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                        ]).then( Data => {
                                            return Data[0];
                                        }).catch(error => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error);
                                        });     
                                GetCategory_Info(cubeIds); // Main Promise Call Function Category Info --------------
                            }
                        });
                    }
                }
            });
         }
    });
};

// ----------------------------------------------------------------------  Cube Post Delete ----------------------------------------------------------
exports.CubePost_Delete = function(req, res) {

    if(!req.params.Post_Id || req.params.Post_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{

        PostModel.Cube_Postschema.findOne({'_id': req.params.Post_Id }, function(post_err, Post_result) {
            if(post_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                
                UserModel.Post_NotificationSchema.where({ Post_Id: req.params.Post_Id}).updateMany({ $set: { Active_Status: 'Inactive' }}).exec();
                Post_result.Active_Status = 'Inactive';

                Post_result.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
                    } else {
                            res.status(200).send({ Status:"True", Output: "True", Response: result });
                    }
                });
            }
        });
        }
};

// ----------------------------------------------------------------------  Post Emote Submit ----------------------------------------------------------
exports.Emote_Submit = function(req, res) {
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Post_Id || req.body.Post_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else if(!req.body.Emote_Text || req.body.Emote_Text === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Emote Text can not be empty" });
    }else{

        PostModel.Post_Emoteschema.findOne({'Post_Id': req.body.Post_Id, 'User_Ids': req.body.User_Id, 'Emote_Text' : req.body.Emote_Text.toLowerCase(), 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                if ( result === null) {
                    PostModel.Post_Emoteschema.findOne({'Post_Id': req.body.Post_Id, 'Emote_Text' : req.body.Emote_Text.toLowerCase(), 'Active_Status': 'Active' }, function(err_1, result_1) {
                        if(err_1) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err_1);
                            res.status(500).send({status:"False", Error:err_1, message: "Some error occurred while Find The  User Followed Cube List."});
                        } else {
                            if ( result_1 !== null) {
                                result_1.User_Ids.push(req.body.User_Id);
                                result_1.Count = result_1.Count + 1;
                                result_1.save(function(err_2, result_2) {
                                    if(err_2) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err_2);
                                        res.status(500).send({Status:"False", Error: err_2, Message: "Some error occurred while Cube Post Submit"});           
                                    } else {
                                        PostModel.Cube_Postschema.findOne({'_id': result_1.Post_Id }, function(err_4, result_4) {
                                            if(err_4) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err_2);
                                                res.status(200).send({ Status:"True", Output: "True", Response: result_2 });           
                                            } else {
                                                result_4 = JSON.parse(JSON.stringify(result_4));
                                                if (result_4.User_Id !== req.body.User_Id) {
                                                    LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                                        var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                            User_Id: req.body.User_Id,
                                                            To_User_Id: result_4.User_Id,
                                                            Notify_Type: 'Emote',
                                                            Post_Id: req.body.Post_Id,
                                                            Post_Type: result_4.Post_Category,
                                                            Cube_Id: result_4.Cubes_Id[0],
                                                            Cube_Ids: result_4.Cubes_Id,
                                                            Emote_Id: result_2._id,
                                                            Opinion_Id: '',
                                                            Emote_Text: result_2.Emote_Text,
                                                            View_Status: 0,
                                                            Active_Status: 'Active'
                                                        });
                                                        varPost_NotificationSchema.save();
                                                        if (App_Info !== null) {
                                                            UserModel.UserSchema.findOne({'_id': req.body.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                                                                CubeModel.CubesSchema.findOne({ '_id':  result_4.Cubes_Id[0] }, {Category_Id: 1, Image: 1, Name: 1}, function(err_cube, Cube_Info) {
                                                                    const PType = result_4.Post_Category;
                                                                    var TextAddon = 'a';
                                                                    var Post_Type = PType;
                                                                    if (PType === 'News' || PType === 'Idea' || PType === 'Article/Blog') { TextAddon = 'an'; }
                                                                    if (PType === 'News') {  Post_Type = 'Announcement'; }
                                                                    if (PType === 'Article/Blog') { Post_Type = 'Article'; }
                                                                    if (PType === 'Moments') { Post_Type = 'Moment'; }

                                                                    var registrationToken = App_Info.Firebase_Token;
                                                                    var payload = {
                                                                        notification: {
                                                                            title: 'New comment added your post',
                                                                            body: User_Info.Inscube_Name + ' commented ' + result_1.Emote_Text + ' to your ' + Post_Type + ' in ' + Cube_Info.Name,
                                                                        },
                                                                        data: {
                                                                            type: 'Highlight',
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
                                var varPost_Emoteschema = new PostModel.Post_Emoteschema({
                                    User_Ids: Ids,
                                    Post_Id: req.body.Post_Id,
                                    Emote_Text: req.body.Emote_Text.toLowerCase(),
                                    Count: 1,
                                    Active_Status: 'Active'
                                });
            
                                varPost_Emoteschema.save(function(err_3, result_3) {
                                    if(err_3) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err_3);
                                        res.status(500).send({Status:"False", Error:err_3, Message: "Some error occurred while Cube Post Submit"});           
                                    } else {
                                        PostModel.Cube_Postschema.findOne({'_id': req.body.Post_Id }, function(err_4, result_4) {
                                            if(err_4) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err_2);
                                                res.status(200).send({ Status:"True", Output: "True", Response: result_3 });
                                            } else {
                                                result_4 = JSON.parse(JSON.stringify(result_4));
                                                if (result_4.User_Id !== req.body.User_Id) {
                                                    LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                                        var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                            User_Id: req.body.User_Id,
                                                            To_User_Id: result_4.User_Id,
                                                            Notify_Type: 'Emote',
                                                            Post_Id: req.body.Post_Id,
                                                            Post_Type: result_4.Post_Category,
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
                                                                    const PType = result_4.Post_Category;
                                                                    var TextAddon = 'a';
                                                                    var Post_Type = PType;
                                                                    if (PType === 'News' || PType === 'Idea' || PType === 'Article/Blog') { TextAddon = 'an'; }
                                                                    if (PType === 'News') {  Post_Type = 'Announcement'; }
                                                                    if (PType === 'Article/Blog') { Post_Type = 'Article'; }
                                                                    if (PType === 'Moments') { Post_Type = 'Moment'; }

                                                                    var registrationToken = App_Info.Firebase_Token;
                                                                    var payload = {
                                                                        notification: {
                                                                            title: 'New comment added your post',
                                                                            body: User_Info.Inscube_Name + ' commented ' + result_3.Emote_Text + ' to your ' + Post_Type + ' in ' + Cube_Info.Name,
                                                                        },
                                                                        data: {
                                                                            type: 'Highlight',
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

// ----------------------------------------------------------------------  Post Emote Update ----------------------------------------------------------
exports.Emote_Update = function(req, res) {
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Post_Id || req.body.Post_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else if(!req.body.Emote_Id || req.body.Emote_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Emote Id can not be empty" });
    }else{
        PostModel.Post_Emoteschema.findOne({'Post_Id': req.body.Post_Id, '_id': req.body.Emote_Id, 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                if ( result !== null) {
                    result.User_Ids.push(req.body.User_Id);
                    result.Count = result.Count + 1;
                    result.save(function(err_1, result_2) {
                        if(err_1) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err_1);
                            res.status(500).send({Status:"False", Error: err_1, Message: "Some error occurred while Cube Post Submit"});           
                        } else {
                            PostModel.Cube_Postschema.findOne({'_id': req.body.Post_Id }, function(err_4, result_4) {
                                if(err_4) {
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err_2);
                                    res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                                } else {
                                    result_4 = JSON.parse(JSON.stringify(result_4));
                                    if (result_4.User_Id !== req.body.User_Id) {
                                        LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                            var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                User_Id: req.body.User_Id,
                                                To_User_Id: result_4.User_Id,
                                                Notify_Type: 'Emote',
                                                Post_Id: req.body.Post_Id,
                                                Post_Type: result_4.Post_Category,
                                                Cube_Id: result_4.Cubes_Id[0],
                                                Cube_Ids: result_4.Cubes_Id,
                                                Emote_Id: result_2._id,
                                                Opinion_Id: '',
                                                Emote_Text: result_2.Emote_Text,
                                                View_Status: 0,
                                                Active_Status: 'Active'
                                            });
                                            varPost_NotificationSchema.save();
                                            if (App_Info !== null) {
                                                UserModel.UserSchema.findOne({'_id': req.body.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                                                    CubeModel.CubesSchema.findOne({ '_id':  result_4.Cubes_Id[0] }, {Category_Id: 1, Image: 1, Name: 1}, function(err_cube, Cube_Info) {
                                                        const PType = result_4.Post_Category;
                                                        var TextAddon = 'a';
                                                        var Post_Type = PType;
                                                        if (PType === 'News' || PType === 'Idea' || PType === 'Article/Blog') { TextAddon = 'an'; }
                                                        if (PType === 'News') {  Post_Type = 'Announcement'; }
                                                        if (PType === 'Article/Blog') { Post_Type = 'Article'; }
                                                        if (PType === 'Moments') { Post_Type = 'Moment'; }

                                                        var registrationToken = App_Info.Firebase_Token;
                                                        var payload = {
                                                            notification: {
                                                                title: 'New comment added your post',
                                                                body: User_Info.Inscube_Name + ' commented ' + result_2.Emote_Text + ' to your ' + Post_Type + ' in ' + Cube_Info.Name,
                                                            },
                                                            data: {
                                                                type: 'Highlight',
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
                    res.status(200).send({ Status:"True", Output: "False", Message: 'Some Error Occurred!' });
                }
            }
        });
    }
};

// ----------------------------------------------------------------------  Post Comment Submit ----------------------------------------------------------
exports.Comment_Submit = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Post_Id || req.body.Post_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else if(!req.body.Comment_Text || req.body.Comment_Text === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Comment can not be empty" });
    }else{

        var varPost_Commentschema = new PostModel.Post_Commentschema({
            User_Id: req.body.User_Id,
            Post_Id: req.body.Post_Id,
            Comment_Text: req.body.Comment_Text,
            Active_Status: 'Active'
        });
        varPost_Commentschema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
            } else {
                UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                    if(err_user) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Cubes.controller.js - 12', err_user);
                        res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The  User Info."});
                    } else {
                        result = JSON.parse(JSON.stringify(result));
                        result.User_Name = User_Info.Inscube_Name;
                        result.User_Image = User_Info.Image;
                        result.Time_Ago = moment(result.updatedAt).fromNow();
                        PostModel.Cube_Postschema.findOne({'_id': req.body.Post_Id }, function(err_4, result_4) {
                            if(err_4) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err_2);
                                res.status(200).send({ Status:"True", Output: "True", Response: result });           
                            } else {
                                result_4 = JSON.parse(JSON.stringify(result_4));
                                if (result_4.User_Id !== req.body.User_Id) {
                                    LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                        var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                            User_Id: req.body.User_Id,
                                            To_User_Id: result_4.User_Id,
                                            Notify_Type: 'Opinion',
                                            Post_Id: req.body.Post_Id,
                                            Post_Type: result_4.Post_Category,
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
                                                const PType = result_4.Post_Category;
                                                var Post_Type = PType;
                                                if (PType === 'News') {  Post_Type = 'Announcement'; }
                                                if (PType === 'Article/Blog') { Post_Type = 'Article'; }
                                                if (PType === 'Moments') { Post_Type = 'Moment'; }

                                                var registrationToken = App_Info.Firebase_Token;
                                                var payload = {
                                                    notification: {
                                                        title: 'New opinion on your post',
                                                        body: User_Info.Inscube_Name + ' shared an opinion on your ' + Post_Type + ' in ' + Cube_Info.Name,
                                                    },
                                                    data: {
                                                        type: 'Highlight',
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
                                        } else{
                                            res.status(200).send({ Status:"True", Output: "True", Response: result });
                                        }
                                    });
                                }else {
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

// ----------------------------------------------------------------------  Post Comment List ----------------------------------------------------------
exports.Comment_List = function(req, res) {

    if(!req.params.Post_Id || req.params.Post_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{

        PostModel.Post_Commentschema.find({'Post_Id': req.params.Post_Id, 'Active_Status': 'Active' }, {__v: 0}, {sort: { updatedAt: -1 }}, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
            } else {
                result = JSON.parse(JSON.stringify(result));

                const GetUser_Info = (result) => Promise.all(  // Main Promise For Category info Get --------------
                    result.map(info => User_Info(info)) 
                ).then( result_1 => { 
                            res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                }).catch( err_1 => { 
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_1);
                    res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Post Submit Category Info Find Promise Error "});
                });
    
                const User_Info = info => // Sub Promise For Category info Find --------------
                    Promise.all([ 
                        UserModel.UserSchema.findOne({ '_id': info.User_Id }, { Image: 1, Inscube_Name: 1}).exec(),
                        ]).then( Data => {
                            info.User_Name = Data[0].Inscube_Name;
                            info.User_Image = Data[0].Image;
                            info.Time_Ago = moment(info.updatedAt).fromNow();
                            return info;
                        }).catch(error => {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error);
                        });     
                GetUser_Info(result); // Main Promise Call Function Category Info --------------
            }
        });
     }
};

// ----------------------------------------------------------------------  Post Comment Update ----------------------------------------------------------
exports.Comment_Update = function(req, res) {

    if(!req.body.Comment_Id || req.body.Comment_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Comment Id can not be empty" });
    }else if(!req.body.Comment_Text || req.body.Comment_Text === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Comment can not be empty" });
    }else{
        PostModel.Post_Commentschema.findOne({'_id': req.body.Comment_Id, 'Active_Status': 'Active' }, function(comment_err, Comment_result) {
            if(comment_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', comment_err);
                res.status(500).send({Status:"False", Error:comment_err, Message: "Some error occurred while Cube Post Submit"});           
            } else {

                Comment_result.Comment_Text = req.body.Comment_Text;

                Comment_result.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
                    } else {
                        
                        UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                            if(err_user) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Cubes.controller.js - 12', err_user);
                                res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The  User Info."});
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

// ----------------------------------------------------------------------  Post Comment Delete ----------------------------------------------------------
exports.Comment_Delete = function(req, res) {

    if(!req.params.Comment_Id || req.params.Comment_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        PostModel.Post_Commentschema.findOne({'_id': req.params.Comment_Id }, function(comment_err, Comment_result) {
            if(comment_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', comment_err);
                res.status(500).send({Status:"False", Error:comment_err, Message: "Some error occurred while Cube Post Submit"});           
            } else {

                UserModel.Post_NotificationSchema.where({ Opinion_Id: req.params.Comment_Id}).updateMany({ $set: { Active_Status: 'Inactive' }}).exec();
                Comment_result.Active_Status = 'Inactive';

                Comment_result.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
                    } else {
                        res.status(200).send({ Status:"True", Output: "True", Response: result });
                    }
                });
            }
        });
     }
};

// ---------------------------------------------------------------------- Report Post Submit Check ----------------------------------------------------------
exports.Report_PostSubmit_Check = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Post_Id || req.body.Post_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{

        PostModel.Report_Postschema.findOne({'User_Id': req.body.User_Id, 'Post_Id': req.body.Post_Id }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
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

// ---------------------------------------------------------------------- Report Post Submit ----------------------------------------------------------
exports.Report_PostSubmit = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Post_Id || req.body.Post_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else if(!req.body.Report_Type || req.body.Report_Type === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Report Type can not be empty" });
    }else{

        var varReport_Postschema = new PostModel.Report_Postschema({
            User_Id: req.body.User_Id,
            Post_Id: req.body.Post_Id,
            Report_Type: req.body.Report_Type,
            Report_Text: req.body.Report_Text || '',
            Active_Status: 'Active'
        });
        varReport_Postschema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
            } else {
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
     }
};

// ---------------------------------------------------------------------- Report Comment Submit Check ----------------------------------------------------------
exports.Report_CommentSubmit_Check = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Comment_Id || req.body.Comment_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{

        PostModel.Report_Commentschema.findOne({'User_Id': req.body.User_Id, 'Comment_Id': req.body.Comment_Id }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
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

// ---------------------------------------------------------------------- Report Comment Submit ----------------------------------------------------------
exports.Report_CommentSubmit = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Comment_Id || req.body.Comment_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Comment Id can not be empty" });
    }else if(!req.body.Report_Type || req.body.Report_Type === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Report Type can not be empty" });
    }else{

        var varReport_Commentschema = new PostModel.Report_Commentschema({
            User_Id: req.body.User_Id,
            Comment_Id: req.body.Comment_Id,
            Report_Type: req.body.Report_Type,
            Report_Text: req.body.Report_Text,
            Active_Status: 'Active'
        });
        varReport_Commentschema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
            } else {
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
     }
};

// ---------------------------------------------------------------------- Report User Submit Check ----------------------------------------------------------
exports.Report_UserSubmit_Check = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.To_User_Id || req.body.To_User_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{

        PostModel.Report_Userschema.findOne({'User_Id': req.body.User_Id, 'To_User_Id': req.body.To_User_Id }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
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

// ---------------------------------------------------------------------- Report User Submit ----------------------------------------------------------
exports.Report_UserSubmit = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.To_User_Id || req.body.To_User_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Comment Id can not be empty" });
    }else if(!req.body.Report_Type || req.body.Report_Type === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Report Type can not be empty" });
    }else{

        var varReport_Commentschema = new PostModel.Report_Userschema({
            User_Id: req.body.User_Id,
            To_User_Id: req.body.To_User_Id,
            Report_Type: req.body.Report_Type,
            Report_Text: req.body.Report_Text || '',
            Active_Status: 'Active'
        });
        varReport_Commentschema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
            } else {
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
     }
};

// ----------------------------------------------------------------------  Cube Based Post List ----------------------------------------------------------
exports.Cube_Based_Post_List = function(req, res) {

    if(!req.params.Cube_Id || req.params.Cube_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else{
        PostModel.Cube_Postschema.find({ 'Cubes_Id': req.params.Cube_Id, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 } }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                result =  JSON.parse(JSON.stringify(result));
                
                const Get_Post_Info = (result) => Promise.all( // Second Level Main Promise For Category info Get --------------
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
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Post Submit Info Find Promise Error "});
                    });

                    const PostInfo = info_1 => // Second Level Sub Promise For Category info Find --------------
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            PostModel.Post_Emoteschema.find({ 'Post_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Post_User_Id }, { Inscube_Name: 1}).exec(),
                            ]).then( Data => {

                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Time_Ago = info_1.updatedAt;
                                info_1.Emotes = Data[1];
                                if(Data[2] !== null){ info_1.Post_Owner_Name = Data[2].Inscube_Name; }
                                info_1.Comments = [];
                                var cubeIds = info_1.Cubes_Id;

                                    const GetCategory_Info = (cubeIds) => Promise.all(  // Third Main Promise For Category info Get --------------
                                            cubeIds.map(info => Category_Info(info)) 
                                        ).then( result_3 => {
                                            info_1.Cubes_Info = result_3;
                                            return info_1;
                                        }).catch( err_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Post Submit Category Info Find Promise Error "});
                                        });
                        
                                        const Category_Info = info => // Third Sub Promise For Category info Find --------------
                                            Promise.all([
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error);
                                                });     
                                return GetCategory_Info(cubeIds); // Third Main Promise Call Function Category Info --------------

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error_1);
                            });     
                Get_Post_Info(result); // Second Level Main Promise Call Function Category Info -------------
                            
            }
        });
    }
};

// ----------------------------------------------------------------------  User Posts ----------------------------------------------------------
exports.User_Posts = function(req, res) {

    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else{
        PostModel.Cube_Postschema.find({ 'User_Id': req.params.User_Id, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 } }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                result =  JSON.parse(JSON.stringify(result));
                
                const Get_Post_Info = (result) => Promise.all( // Second Level Main Promise For Category info Get --------------
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
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Post Submit Info Find Promise Error "});
                    });

                    const PostInfo = info_1 => // Second Level Sub Promise For Category info Find --------------
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            PostModel.Post_Emoteschema.find({ 'Post_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Post_User_Id }, { Inscube_Name: 1}).exec(),
                            ]).then( Data => {

                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Time_Ago = info_1.updatedAt;
                                info_1.Emotes = Data[1];
                                if(Data[2] !== null){ info_1.Post_Owner_Name = Data[2].Inscube_Name; }
                                info_1.Comments = [];
                                var cubeIds = info_1.Cubes_Id;

                                    const GetCategory_Info = (cubeIds) => Promise.all(  // Third Main Promise For Category info Get --------------
                                            cubeIds.map(info => Category_Info(info)) 
                                        ).then( result_3 => {
                                            info_1.Cubes_Info = result_3;
                                            return info_1;
                                        }).catch( err_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Post Submit Category Info Find Promise Error "});
                                        });
                        
                                        const Category_Info = info => // Third Sub Promise For Category info Find --------------
                                            Promise.all([ 
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error);
                                                });     
                                return GetCategory_Info(cubeIds); // Third Main Promise Call Function Category Info --------------

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error_1);
                            });     
                Get_Post_Info(result); // Second Level Main Promise Call Function Category Info -------------
                            
            }
        });
    }
};

// ----------------------------------------------------------------------  User Notifications ----------------------------------------------------------
exports.Get_Notifications = function(req, res) {

    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else{
        UserModel.Post_NotificationSchema.find({ 'To_User_Id': req.params.User_Id, 'View_Status':  { $ne: 2 }, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 } }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                result =  JSON.parse(JSON.stringify(result));
                
                const Get_Post_Info = (result) => Promise.all( // Second Level Main Promise For Category info Get --------------
                    result.map(info_1 => PostInfo(info_1)) 
                    ).then( result_2 => {
                            res.status(200).send({ Status:"True", Output: "True", Response: result_2  });
                    }).catch( err_2 => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Post Submit Info Find Promise Error "});
                    });

                    const PostInfo = info_1 => // Second Level Sub Promise For Category info Find --------------
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            CubeModel.CubesSchema.findOne({ '_id': info_1.Cube_Id }, { Name: 1}).exec(),
                        ]).then( Data => {
                            
                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Cube_Name = Data[1].Name;
                                
                                if (info_1.Post_Type === 'News' || info_1.Post_Type === 'Idea' || info_1.Post_Type === 'Article/Blog') {
                                    info_1.TextAddon = 'an';
                                }else{
                                    info_1.TextAddon = 'a';
                                }
                                if (info_1.Notify_Type === 'New_Post' || info_1.Notify_Type === 'Shared_Post' && info_1.Post_Type === 'News') {
                                    info_1.Post_Type = 'Announcement';
                                }
                                if (info_1.Post_Type === 'Article/Blog') {
                                    info_1.Post_Type = 'Article';
                                }
                                if (info_1.Post_Type === 'Moments') {
                                    info_1.Post_Type = 'Moment';
                                }
                            return info_1;
                        }).catch(error_1 => { console.log(error_1); });
                Get_Post_Info(result); // Second Level Main Promise Call Function Category Info -------------
                            
            }
        });
    }
};

// ----------------------------------------------------------------------  User Notifications recived----------------------------------------------------------
exports.Notifications_recived = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    } else if(!req.body.Notify_Ids || req.body.Notify_Ids === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Notification Id can not be empty" });
    }else{

        const Ids_Array = JSON.parse(req.body.Notify_Ids);

        const Notify_Ids_List = (Ids_Array) => Promise.all(
            Ids_Array.map(info => Notify_Info(info)) 
        ).then( result_2 => {
                res.status(200).send({ Status:"True", Output: "True", Message: 'Success' });
        }).catch( err_2 => { 
            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_2);
            res.status(200).send({ Status:"True", Output: "True", Message: 'Success but post remove error' });
        });

        const Notify_Info = info =>
            Promise.all([
                UserModel.Post_NotificationSchema.where({ _id: info, To_User_Id: req.body.User_Id }).updateMany({ $set: { View_Status: 1 }}).exec(),
                ]).then( Data_new => {
                    return Data_new[0];
                }).catch(error_12 => {
                    console.log(error_12);
                });
        Notify_Ids_List(Ids_Array);
    }
};

// ----------------------------------------------------------------------  User Notifications Viewed----------------------------------------------------------
exports.Notifications_Viewed = function(req, res) {

    if(!req.params.Notify_Id || req.params.Notify_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Notify Id can not be empty" });
    }else{
        UserModel.Post_NotificationSchema.findOne({'_id': req.params.Notify_Id}, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
            } else {
                result.View_Status = 2;
                result.save(function(err_1, result_1) {
                    if(err_1) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err_1);
                        res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Cube Post Submit"});           
                    } else {
                        res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                    }
                });
            }
        });
    }
};

// ----------------------------------------------------------------------  Users Search----------------------------------------------------------
exports.Search_Users = function(req, res) {
    if(!req.params.Search_text || req.params.Search_text === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Search text can not be empty" });
    }else{
        UserModel.UserSchema.find({Inscube_Name: { $regex: new RegExp(req.params.Search_text, "i") }, Active_Status: 'Active' }, { Inscube_Name: 1, Image: 1, Hash_Tag_1: 1, Hash_Tag_2: 1, Hash_Tag_3: 1, createdAt: 1 }, {}, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
            } else {
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
    }
};

// ----------------------------------------------------------------------  Cubes Search----------------------------------------------------------
exports.Search_Cubes = function(req, res) {
    if(!req.params.Search_text || req.params.Search_text === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Search text can not be empty" });
    } else if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        CubeModel.CubesSchema.find({Name: { $regex: new RegExp(req.params.Search_text, "i") }, Active_Status: 'Active'}, {User_Id: 1, Category_Id: 1, Name: 1, Image:1, Security:1 }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                const GetCubeInfo = (result) => Promise.all(  // Main Promise For Cube List Get --------------
                        result.map(info => CubeFilter(info)) 
                    ).then( result_1 => {  
                        res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                    }).catch( err_1 => { 
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, ' User Followed Cubes List Find Main Promise Error', 'Cubes.controller.js - 226', err_1);
                        res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube List Promise Error "});
                    });

                const CubeFilter = info => // Sub Promise For Cube Related Info Find --------------
                    Promise.all([ 
                        CubeModel.Cube_CategorySchema.findOne({'_id': info.Category_Id}).exec(),
                        CubeModel.Cube_Followersschema.count({ 'Cube_Id': info._id,  'Active_Status': 'Active' }).exec(),
                        CubeModel.Cube_Followersschema.findOne({'Cube_Id': info._id, 'User_Id' : req.params.User_Id, 'Active_Status': 'Active' } ).exec(),
                        ]).then( Data => {
                            info = JSON.parse(JSON.stringify(info));
                            info.Category_Name = Data[0].Name;
                            info.Members_Count = Data[1];
                            if (Data[2] ===  null) {
                                info.Joined = false;
                            }else{
                                info.Joined = true;
                            }
                            return info;
                        }).catch(error => {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, ' User Followed Cubes List Find Cube Related Info Sub Promise Error', 'Cubes.controller.js - 237', error);
                        });

                GetCubeInfo(result); // Main Promise Call Function Cube --------------
            }
        });
    }
};

// ----------------------------------------------------------------------  Posts Search----------------------------------------------------------
exports.Search_Posts = function(req, res) {
    if(!req.params.Search_text || req.params.Search_text === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Search text can not be empty" });
    } else if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        CubeModel.Cube_Followersschema.find({'User_Id': req.params.User_Id, 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                var CubesArray = [];
                var Return_Json = result.map((Objects) => {
                    CubesArray.push(Objects.Cube_Id);
                });
                PostModel.Cube_Postschema.find({'Cubes_Id': { $in: CubesArray }, Post_Text: { $regex: new RegExp(req.params.Search_text, "i") }, 'Active_Status': 'Active' }, {Attachments: 0, Post_Link: 0}, {sort: { updatedAt: -1 } }, function(err_1, result_1) {
                    if(err_1) {
                        res.status(500).send({status:"False", Error:err_1});
                    } else {
                        result_1 = JSON.parse(JSON.stringify(result_1));
                        const Get_Post_Info = (result_1) => Promise.all(
                            result_1.map(info_1 => PostInfo(info_1)) 
                        ).then( result_2 => {
                                res.status(200).send({ Status:"True", Output: "True", Response: result_2  });
                        }).catch( err_2 => {
                            
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_2);
                            res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Post Submit Info Find Promise Error "});
                        });
                        const PostInfo = info_1 =>
                            Promise.all([
                                UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                                CubeModel.CubesSchema.findOne({ '_id': info_1.Cubes_Id[0] }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                ]).then( Data => {
                                    info_1.User_Name = Data[0].Inscube_Name;
                                    info_1.User_Image = Data[0].Image;
                                    info_1.Cube_Name = Data[1].Name;
                                    info_1.Cubes_Count = (info_1.Cubes_Id).length;
                                    if (info_1.Post_Category === 'Article/Blog') {
                                        info_1.Post_Category = 'Article';
                                    }
                                    if (info_1.Post_Category === 'Moments') {
                                        info_1.Post_Category = 'Moment';
                                    }
                                    if (info_1.Post_Category === 'News' || info_1.Post_Category === 'Idea') {
                                        info_1.TextAddon = 'an';
                                    }else{
                                        info_1.TextAddon = 'a';
                                    }
                                    info_1.Post_Category = info_1.Post_Category.toLowerCase();
                                    return info_1;
                                }).catch(error_1 => {
                                    console.log(error_1);
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error_1);
                                });     
                        Get_Post_Info(result_1);
                    }
                });
            }
        });
    }
};

// ----------------------------------------------------------------------  Cube Post Share ----------------------------------------------------------
exports.Cube_Post_Share = function(req, res) {
    
    var Cubes_List =JSON.parse(req.body.Cubes_List);

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Post_Id || req.body.Post_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else if(!Cubes_List || Cubes_List.length <= 0 ){
        res.status(200).send({Status:"True", Output:"False", Message: "Selected Cubes can not be empty" });
    }else{
        PostModel.Cube_Postschema.findOne({'_id': req.body.Post_Id }, function(post_err, Post_result) {
            if(post_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', post_err);
                res.status(500).send({status:"False", Error:post_err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {

                var varCube_Postschema = new PostModel.Cube_Postschema({
                    User_Id: req.body.User_Id,
                    Cubes_Id: Cubes_List,
                    Post_Category: Post_result.Post_Category,
                    Post_Text: Post_result.Post_Text || '',
                    Post_Link: Post_result.Post_Link,
                    Post_Link_Info: Post_result.LinkInfo,
                    Shared_Post: 'True',
                    Shared_Post_User_Id: Post_result.User_Id,
                    Shared_Post_Id: Post_result._id,
                    Attachments: Post_result.Attachments,
                    Active_Status: 'Active'
                });
                varCube_Postschema.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Post Submit"});           
                    } else {
                        result = JSON.parse(JSON.stringify(result));
                        UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                            if(err_user) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Cubes.controller.js - 12', err_user);
                                res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The  User Info."});
                            } else {
                                UserModel.UserSchema.findOne({'_id': result.Shared_Post_User_Id }, { Inscube_Name: 1}, function(err_share_user, Share_User_Info) {
                                    if(err_share_user) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Cubes.controller.js - 12', err_share_user);
                                        res.status(500).send({status:"False", Error:err_share_user, message: "Some error occurred while Find The  User Info."});
                                    } else {
                                        result.Time_Ago = moment(result.updatedAt).fromNow();
                                        result.User_Name = User_Info.Inscube_Name;
                                        result.Post_Owner_Name = Share_User_Info.Inscube_Name;
                                        result.User_Image = User_Info.Image;
                                        result.Emotes = [];
                                        result.Comments = [];
                                        
                                        var cubeIds = result.Cubes_Id;
        
                                        const GetCategory_Info = (cubeIds) => Promise.all(  // Main Promise For Category info Get --------------
                                            cubeIds.map(info => Category_Info(info)) 
                                        ).then( result_1 => {
                                            if (result.User_Id !== Post_result.User_Id) {
                                                var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                    User_Id: req.body.User_Id,
                                                    To_User_Id: Post_result.User_Id,
                                                    Notify_Type: 'Shared',
                                                    Post_Id: result._id,
                                                    Post_Type: result.Post_Category,
                                                    Cube_Id: cubeIds[0],
                                                    Emote_Id: '',
                                                    Opinion_Id: '',
                                                    Emote_Text: '',
                                                    View_Status: 0,
                                                    Active_Status: 'Active'
                                                });
                                                varPost_NotificationSchema.save();
                                            }

                                                result.Cubes_Info = result_1;
                                                res.status(200).send({ Status:"True", Output: "True", Response: result });
                                        }).catch( err_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Post Submit Category Info Find Promise Error "});
                                        });
                            
                                        const Category_Info = info => // Sub Promise For Category info Find --------------
                                            Promise.all([
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                CubeModel.Cube_Followersschema.find({'Cube_Id': info, 'Active_Status': 'Active' }).exec(),
                                                ]).then( Data => {
                                                    var Users_List = JSON.parse(JSON.stringify(Data[1]));
                                                    const Send_Notification = (Users_List) => Promise.all(
                                                            Users_List.map(_info => To_Notify(_info)) 
                                                        ).then( result_2 => { return Data[0];
                                                        }).catch( err_2 => { console.log( err_2 ); });
        
                                                        const To_Notify = _info => {
                                                            if (result.User_Id !== _info.User_Id) {
                                                                var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                                    User_Id: result.User_Id,
                                                                    To_User_Id: _info.User_Id,
                                                                    Notify_Type: 'Shared_Post',
                                                                    Post_Id: result._id,
                                                                    Post_Type: result.Post_Category,
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
        
                                                    // return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error);
                                                });     
                                        GetCategory_Info(cubeIds); // Main Promise Call Function Category Info --------------
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