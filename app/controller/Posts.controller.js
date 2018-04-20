var ErrorManagement = require('./../../app/config/ErrorHandling.js');
var CubeModel = require('../models/Cubes.model.js');
var PostModel = require('../models/Post.model.js');
var UserModel = require('../models/User.model.js');
var multer = require('multer');
var moment = require('moment');
var axios = require("axios");


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
        if(extension !== 'png' && extension !== 'jpg' && extension !== 'gif' && extension !== 'jpeg' && extension !== 'mp4' && extension !== 'mkv' && extension !== '3gp' && extension !== 'flv') {
            return callback("Only 'png, gif, jpg, jpeg,  mp4, mkv, flv and 3gp' images are allowed");
        }
        callback(null, true);
    }
}).array('attachments', 20);



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
            if ( req.files.length > 0) {
                var Json = JSON.parse(JSON.stringify(req.files));
                Return_Json = Json.map((Objects) => {
                    let extArray = Objects.filename.split(".");
                    let extension = (extArray[extArray.length - 1]).toLowerCase();
                    if (extension === 'png' || extension === 'jpg' || extension === 'gif' || extension === 'jpeg' ) {
                        return { File_Name: Objects.filename, File_Type: 'Image', Size: Objects.size};
                    }else {
                        return { File_Name: Objects.filename, File_Type: 'Video', Size: Objects.size};
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
                    Active_Status: 'Active'
                });
                varCube_Postschema.save(function(err, result) {
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
                                        res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The  User Info."});
                                    } else {
                                        result.User_Name = User_Info.Inscube_Name;
                                        result.User_Image = User_Info.Image;
                                        result.Emotes = [];
                                        result.Comments = [];
                                        res.status(200).send({ Status:"True", Output: "True", Response: result });
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
                const Get_CubePosts = (result) => Promise.all(  // Main Promise For Category info Get --------------
                        result.map(info => CubePosts(info)) 
                    ).then( result_1 => {
                        
                        const Arrays_Concat = [...new Set([].concat(...result_1))];
                        const Set_Result = new Set(Arrays_Concat.map(item => JSON.stringify(item)));
                        const Remove_Duplicate = [...Set_Result].map(item => JSON.parse(item));
                        const Remove_Null = Remove_Duplicate.filter(function(n){ return n != null; }); 

                            const Get_Post_Info = (Remove_Null) => Promise.all( // Second Level Main Promise For Category info Get --------------
                                    Remove_Null.map(info_1 => PostInfo(info_1)) 
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
                                        ]).then( Data => {
                                            info_1.User_Name = Data[0].Inscube_Name;
                                            info_1.User_Image = Data[0].Image;
                                            info_1.Time_Ago = info_1.updatedAt;
                                            info_1.Emotes = Data[1];
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
                            Get_Post_Info(Remove_Null); // Second Level Main Promise Call Function Category Info -------------
                            
                    }).catch( err_1 => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Main Promise Error', 'Posts.controller.js - 75', err_1);
                        res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Post Submit Category Info Find Promise Error "});
                    });

                    const CubePosts = info => // Sub Promise For Category info Find --------------
                        Promise.all([ 
                            PostModel.Cube_Postschema.find({ 'Cubes_Id': info.Cube_Id, 'Active_Status': 'Active' }).exec(),
                            ]).then( Data => {

                                return Data[0];
                            }).catch(error => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Category Info Find Sub Promise Error', 'Posts.controller.js - 85', error);
                            });     
                Get_CubePosts(result); // Main Promise Call Function Category Info --------------
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
                            ]).then( Data => {
                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Time_Ago = moment(info_1.updatedAt).fromNow();
                                info_1.Emotes = Data[1];
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
                    if ( req.files.length > 0) {
                        var Json = JSON.parse(JSON.stringify(req.files));
                        Return_Json = Json.map((Objects) => {
                            let extArray = Objects.filename.split(".");
                            let extension = (extArray[extArray.length - 1]).toLowerCase();
                            if (extension === 'png' || extension === 'jpg' || extension === 'gif' || extension === 'jpeg' ) {
                                return { File_Name: Objects.filename, File_Type: 'Image', Size: Objects.size};
                            }else {
                                return { File_Name: Objects.filename, File_Type: 'Video', Size: Objects.size};
                            }
                        });
                    }
                    var Old_Json = [];

                    if (req.body.Old_Attachments && req.body.Old_Attachments !== undefined ) {
                        Old_Json = JSON.parse(req.body.Old_Attachments);
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
                        Post_result.Cubes_Id = Cubes_List;
                        Post_result.Post_Category = req.body.Post_Category;
                        Post_result.Post_Text = req.body.Post_Text;
                        Post_result.Post_Link_Info = LinkInfo;
                        Post_result.Post_Link = req.body.Post_Link;
                        Post_result.Attachments = NewReturn_Json;

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
                                            res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
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
                                            res.status(200).send({ Status:"True", Output: "True", Response: result_3 });
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
                        result.save(function(err_1, result_1) {
                            if(err_1) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Post Submit Query Error', 'Posts.controller.js - 62', err_1);
                                res.status(500).send({Status:"False", Error: err_1, Message: "Some error occurred while Cube Post Submit"});           
                            } else {
                                res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
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
                            res.status(200).send({ Status:"True", Output: "True", Response: result });
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
                            ]).then( Data => {

                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Time_Ago = info_1.updatedAt;
                                info_1.Emotes = Data[1];
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
                            ]).then( Data => {

                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Time_Ago = info_1.updatedAt;
                                info_1.Emotes = Data[1];
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
