var ErrorManagement = require('./../../app/config/ErrorHandling.js');
var CubeModel = require('../models/Cubes.model.js');
var PostModel = require('../models/Post.model.js');
var TrendsModel = require('../models/Trends,model.js');
var UserModel = require('../models/User.model.js');
var LoginInfoModel = require('../models/Login_Info.model.js');
var moment = require('moment');

var admin = require('firebase-admin');

// -----------------------------------------------------------  Cube Trends Submit ------------------------------------------------
exports.CubeTrends_Submit = function(req, res) {

    var Cubes_List =JSON.parse(req.body.Cube_Ids);
    var Tags_List =JSON.parse(req.body.Tags);

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Trends_Text || req.body.Trends_Text === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Text can not be empty" });
    }else if( Tags_List.length <= 0 ){
        res.status(200).send({Status:"True", Output:"False", Message: "#Tags can not be empty" });
    }else if( Cubes_List.length <= 0 ){
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else{
   
        var varCube_TrendsSchema = new TrendsModel.Cube_TrendsSchema({
            User_Id: req.body.User_Id,
            Cube_Ids: Cubes_List,
            Trends_Tags: Tags_List,
            Trends_Text: req.body.Trends_Text,
            Shared_Trends: 'False',
            Active_Status: 'Active'
        });

        varCube_TrendsSchema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Submit Query Error', 'Trends.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Trends Submit"});           
            } else {
                result = JSON.parse(JSON.stringify(result));
                UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                    if(err_user) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Trends.controller.js', err_user);
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

                                var TrendsTags = result.Trends_Tags;

                                const UpdateTags_Info = (TrendsTags) => Promise.all( TrendsTags.map(Tag => Tags_Info(Tag)) 
                                    ).then( result_2 => {
                                            res.status(200).send({ Status:"True", Output: "True", Response: result });
                                    }).catch( err_2 => {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Submit Tags Info Find Main Promise Error', 'Trends.controller.js ', err_2);
                                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Trends Submit Tags Info Find Promise Error "});
                                    });

                                    const Tags_Info = Tag =>
                                        Promise.all([
                                            TrendsModel.Trends_TagsSchema.findOne({ 'Tag': Tag }).exec(),
                                            ]).then( Tag_Data => {
                                                if (Tag_Data[0] === null) {
                                                    var Array_TrendId = [];
                                                    Array_TrendId.push(result._id);
                                                    var varCube_TrendsSchema = new TrendsModel.Trends_TagsSchema({
                                                        User_Id: result.User_Id,
                                                        Tag: Tag,
                                                        Trends_Ids: Array_TrendId,
                                                        Active_Status: 'Active'
                                                    });
                                                    varCube_TrendsSchema.save();
                                                    return Tag_Data;
                                                } else {
                                                    Tag_Data[0].Trends_Ids.push(result._id);
                                                    Tag_Data[0].save();
                                                    return Tag_Data;
                                                }
                                        }).catch(error_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Submit Tag Info Find Sub Promise Error', 'Trends.controller.js', error_1);
                                        });

                                UpdateTags_Info(TrendsTags);

                        }).catch( err_1 => { 
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Submit Category Info Find Main Promise Error', 'Trends.controller.js ', err_1);
                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Trends Submit Category Info Find Promise Error "});
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
                                                        Notify_Type: 'New_Trends',
                                                        Trends_Id: result._id,
                                                        Trends_Tags: result.Trends_Tags,
                                                        Trends_Text: result.Trends_Text,
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
                                                            title: 'New # campaign shared',
                                                            body: User_Info.Inscube_Name + ' shared a new # campaign in ' + Data[0].Name,
                                                        },
                                                        data: {
                                                            type: 'Trend',
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
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Submit Category Info Find Sub Promise Error', 'Trends.controller.js', error);
                                });     
                        GetCategory_Info(CubeIds);
                    }
                });
            }
        });
    }
};

// -----------------------------------------------------------  Cube Trends List --------------------------------------------------
exports.CubeTrends_List = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        CubeModel.Cube_Followersschema.find({'User_Id': req.params.User_Id, 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Trends.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The User Followed Cube List."});
            } else {
                var CubesArray = [];
                var Return_Json = result.map((Objects) => { CubesArray.push(Objects.Cube_Id); });
                var Skip_Count = parseInt(req.params.Skip_Count);
                TrendsModel.Cube_TrendsSchema.find({'Cube_Ids': { $in: CubesArray }, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 }, skip: Skip_Count, limit: 15 }, function(err_1, result_1) {
                    if(err_1) {
                        res.status(500).send({status:"False", Error:err_1});
                    } else {
                        
                        result_1 = JSON.parse(JSON.stringify(result_1));
                        
                        const Get_Trends_Info = (result_1) => Promise.all(
                            result_1.map(info_1 => TrendsInfo(info_1)) 
                        ).then( result_2 => {
                                result_2 = result_2.map((Objects) => { Objects.Time_Ago = moment(Objects.Time_Ago).fromNow();  return Objects; });
                                res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                        }).catch( err_2 => {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends List Category Info Find Main Promise Error', 'Trends.controller.js', err_2);
                            res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Trends Info Find Promise Error "});
                        });
                        const TrendsInfo = info_1 =>
                            Promise.all([
                                UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                                TrendsModel.Trends_Emoteschema.find({ 'Trends_Id': info_1._id }).exec(),
                                UserModel.UserSchema.findOne({ '_id': info_1.Shared_Trends_User_Id }, { Inscube_Name: 1}).exec(),
                                ]).then( Data => {
                                    info_1.User_Name = Data[0].Inscube_Name;
                                    info_1.User_Image = Data[0].Image;
                                    info_1.Time_Ago = info_1.updatedAt;
                                    info_1.Emotes = Data[1];
                                    if(Data[2] !== null){ info_1.Trends_Owner_Name = Data[2].Inscube_Name; }
                                    info_1.Comments = [];
                                    var cubeIds = info_1.Cube_Ids;

                                        const GetCube_Info = (cubeIds) => Promise.all(
                                                cubeIds.map(info => Cube_Info(info)) 
                                            ).then( result_3 => {
                                                info_1.Cubes_Info = result_3;
                                                return info_1;
                                            }).catch( err_3 => {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Submit Cube Info Find Promise Error', 'Trends.controller.js', err_3);
                                                res.status(500).send({Status:"False", Error:err_3, Message: "Some error occurred while Find the Cube Trends list Cube Info Find Promise Error "});
                                            });
                            
                                            const Cube_Info = info =>
                                                Promise.all([ 
                                                    CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                    ]).then( Datas => {
                                                        return Datas[0];
                                                    }).catch(error => {
                                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends list Cube Info Find Promise Error', 'Trends.controller.js', error);
                                                    });     
                                    return GetCube_Info(cubeIds);

                                }).catch(error_1 => {
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends List Cube Info Find Promise Error', 'Trends.controller.js ', error_1);
                                });     
                        Get_Trends_Info(result_1);
                    }
                });
            }
        });
    }
};

// -----------------------------------------------------------  Cube Trends view ----------------------------------------------------
exports.CubeTrends_View = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.params.Trends_Id || req.params.Trends_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Id can not be empty" });
    }else{

        TrendsModel.Cube_TrendsSchema.find({'_id': req.params.Trends_Id }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                result = JSON.parse(JSON.stringify(result));
                
                const Get_Trends_Info = (result) => Promise.all(
                        result.map(info_1 => TrendsInfo(info_1)) 
                    ).then( result_2 => {
                            res.status(200).send({ Status:"True", Output: "True", Response: result_2  });
                    }).catch( err_2 => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends view Cube Info Find Main Promise Error', 'Posts.controller.js', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Trends View Cube Info Find Promise Error "});
                    });

                    const TrendsInfo = info_1 =>
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            TrendsModel.Trends_Emoteschema.find({ 'Trends_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Trends_User_Id }, { Inscube_Name: 1}).exec(),
                            ]).then( Data => {
                                info_1.User_Name = Data[0].Inscube_Name;
                                info_1.User_Image = Data[0].Image;
                                info_1.Time_Ago = moment(info_1.updatedAt).fromNow();
                                info_1.Emotes = Data[1];
                                if(Data[2] !== null){ info_1.Trends_Owner_Name = Data[2].Inscube_Name; }
                                info_1.Comments = [];
                                var cubeIds = info_1.Cube_Ids;

                                    const GetCube_Info = (cubeIds) => Promise.all(
                                            cubeIds.map(info => Cube_Info(info)) 
                                        ).then( result_3 => {
                                            info_1.Cubes_Info = result_3;
                                            return info_1;
                                        }).catch( err_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends View Cube Info Find Main Promise Error', 'Trends.controller.js - 7', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Trends View Cube Info Find Promise Error "});
                                        });
                        
                                        const Cube_Info = info =>
                                            Promise.all([ 
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends View Cube Info Find Main Promise Error', 'Trends.controller.js', error);
                                                });     
                                return GetCube_Info(cubeIds);

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends View Cube Info Find Main Promise Error', 'Trends.controller.js', error_1);
                            });     
                Get_Trends_Info(result);
                            
            }
        });
    }
};

// -----------------------------------------------------------  Cube Trends Update --------------------------------------------------
exports.CubeTrends_Update = function(req, res) {
    
        var Cubes_List =JSON.parse(req.body.Cube_Ids);
        var New_Tags_List =JSON.parse(req.body.New_Tags);
        var Old_Tags_List =JSON.parse(req.body.Old_Tags);

        if(!req.body.Trends_Id || req.body.Trends_Id === '') {
            res.status(200).send({Status:"True", Output:"False", Message: "Trends Id can not be empty" });
        }else if(!req.body.Trends_Text || req.body.Trends_Text === ''){
            res.status(200).send({Status:"True", Output:"False", Message: "Text can not be empty" });
        }else if( New_Tags_List.length <= 0 &&  Old_Tags_List.length <= 0){
            res.status(200).send({Status:"True", Output:"False", Message: "#Tags can not be empty" });
        }else if( Cubes_List.length <= 0 ){
            res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
        }else{

            TrendsModel.Cube_TrendsSchema.findOne({'_id': req.body.Trends_Id }, function(Trends_err, Trends_result) {
                if(Trends_err) {
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Trends Info Find Query Error', 'Trends.controller.js', Trends_err);
                    res.status(500).send({status:"False", Error:Trends_err, message: "Some error occurred while Find The Trends ."});
                } else {

                    const Tags_diff = Trends_result.Trends_Tags.filter(x => Old_Tags_List.indexOf(x) < 0 );
                    const Tag_diff_Obj = Tags_diff.map(tag => {
                        return {Tag_Name: tag, Tag_Type: 'Remove'};
                    });
                    const Tag_New_Obj = New_Tags_List.map(tag => {
                        return {Tag_Name: tag, Tag_Type: 'New'};
                    });
                    const Tag_Response =  Tag_diff_Obj.concat(Tag_New_Obj);

                    Trends_result.Cube_Ids = Cubes_List;
                    Trends_result.Trends_Text = req.body.Trends_Text;
                    Trends_result.Trends_Tags = Old_Tags_List.concat(New_Tags_List);

                    Trends_result.save(function(err, result) {
                        if(err) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Update Query Error', 'Trends.controller.js', err);
                            res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Trends Update"});           
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
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Trends.controller.js', err_user);
                                        res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The User Info."});
                                    } else {
                                        TrendsModel.Trends_Emoteschema.find({'Trends_Id': result._id }, function(err_emote, emote_Info) {
                                            if(err_emote) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Trends Emote Find Query Error', 'Trends.controller.js', err_emote);
                                                res.status(500).send({status:"False", Error:err_emote, message: "Some error occurred while Find The Trends Emote List."});
                                            } else {
                                                result.User_Name = User_Info.Inscube_Name;
                                                result.User_Image = User_Info.Image;
                                                result.Emotes = emote_Info;
                                                result.Comments = [];

                                                if (Tag_Response.length > 0) {
                                                    const UpdateTags_Info = (Tag_Response) => Promise.all( Tag_Response.map(Tag => Tags_Info(Tag)) 
                                                        ).then( result_2 => {
                                                                res.status(200).send({ Status:"True", Output: "True", Response: result });
                                                        }).catch( err_2 => {
                                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends update Tags Info Update Main Promise Error', 'Trends.controller.js ', err_2);
                                                            res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Trends Update Tags Info Update Promise Error "});
                                                        });
                    
                                                    const Tags_Info = Tag =>
                                                        Promise.all([
                                                            TrendsModel.Trends_TagsSchema.findOne({ 'Tag': Tag.Tag_Name }).exec(),
                                                            ]).then( Tag_Data => {
                                                                
                                                                if (Tag_Data[0] === null && Tag.Tag_Type === 'New') {
                                                                    var Array_TrendId = [];
                                                                    Array_TrendId.push(result._id);
                                                                    var varCube_TrendsSchema = new TrendsModel.Trends_TagsSchema({
                                                                        User_Id: result.User_Id,
                                                                        Tag: Tag.Tag_Name,
                                                                        Trends_Ids: Array_TrendId,
                                                                        Active_Status: 'Active'
                                                                    });
                                                                    varCube_TrendsSchema.save();
                                                                    return Tag_Data;
                                                                } else if(Tag_Data[0] !== null && Tag.Tag_Type === 'New') {
                                                                    Tag_Data[0].Trends_Ids.push(result._id);
                                                                    Tag_Data[0].save();
                                                                    return Tag_Data;
                                                                } else {
                                                                    if (Tag_Data[0].Trends_Ids.length > 1) {
                                                                        Tag_Data[0].Trends_Ids = Tag_Data[0].Trends_Ids.filter(Trend_Id => Trend_Id !== result._id);
                                                                        Tag_Data[0].save();
                                                                        return Tag_Data;
                                                                    }else {
                                                                        TrendsModel.Trends_TagsSchema.findByIdAndRemove(Tag_Data[0]._id, (err_4, todo) => {});
                                                                        return Tag_Data;
                                                                    }
                                                                }
                                                        }).catch(error_1 => {
                                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Update Tag Info Find Sub Promise Error', 'Trends.controller.js', error_1);
                                                        });

                                                    UpdateTags_Info(Tag_Response);
                                                }
                                            }
                                        });
                                    }
                                });
                            }).catch( err_1 => { 
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Update Cube Info Find Promise Error', 'Posts.controller.js ', err_1);
                                res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Trends Update Cube Info Find Promise Error "});
                            });
                
                            const Category_Info = info =>
                                Promise.all([ 
                                    CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                    ]).then( Data => {
                                        return Data[0];
                                    }).catch(error => {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Update Cube Info find Promise Error', 'Posts.controller.js', error);
                                    });     
                            GetCategory_Info(cubeIds);
                        }
                    });
                }
            });
        }
};

// -----------------------------------------------------------  Cube Trends Delete ----------------------------------------------------------
exports.CubeTrends_Delete = function(req, res) {
    if(!req.params.Trends_Id || req.params.Trends_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{

        TrendsModel.Cube_TrendsSchema.findOne({'_id': req.params.Trends_Id }, function(Trends_err, Trends_result) {
            if(Trends_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Find Query Error', 'Cubes.controller.js - 12', Trends_err);
                res.status(500).send({status:"False", Error:Trends_err, message: "Some error occurred while Find The  Cube Trends info."});
            } else {
                Json_Trends_result = JSON.parse(JSON.stringify(Trends_result));
                UserModel.Post_NotificationSchema.where({ Trends_Id: req.params.Trends_Id }).updateMany({ $set: { Active_Status: 'Inactive' }}).exec();

                var All_Tags = Trends_result.Trends_Tags;

                const UpdateTags_Info = (All_Tags) => Promise.all( All_Tags.map(Tag => Tags_Info(Tag)) 
                    ).then( result_2 => {

                        Trends_result.Active_Status = 'Inactive';

                        Trends_result.save(function(err, result) {
                            if(err) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Delete Query Error', 'Trends.controller.js', err);
                                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Trends Delete"});           
                            } else {
                                res.status(200).send({ Status:"True", Output: "True", Response: result });
                            }
                        });

                    }).catch( err_2 => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends update Tags Info Update Main Promise Error', 'Trends.controller.js ', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Trends Update Tags Info Update Promise Error "});
                    });

                const Tags_Info = Tag =>
                    Promise.all([
                        TrendsModel.Trends_TagsSchema.findOne({ 'Tag': Tag }).exec(),
                        ]).then( Tag_Data => {
                            if (Tag_Data[0].Trends_Ids.length > 1) {
                                Tag_Data[0].Trends_Ids = Tag_Data[0].Trends_Ids.filter(Trend_Id => Trend_Id !== Json_Trends_result._id);
                                Tag_Data[0].save();
                                return Tag_Data;
                            }else {
                                TrendsModel.Trends_TagsSchema.findByIdAndRemove(Tag_Data[0]._id, (err_4, todo) => {});
                                return Tag_Data;
                            }
                    }).catch(error_1 => {
                        console.log(error_1);
                        
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Update Tag Info Find Sub Promise Error', 'Trends.controller.js', error_1);
                    });

                UpdateTags_Info(All_Tags);

            }
        });
    }
};

// -----------------------------------------------------------  Cube Trends Filter List --------------------------------------------------
exports.CubeTrends_Filter = function(req, res) {
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Trends_Tag || req.body.Trends_Tag === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Tag can not be empty" });
    }else{
        CubeModel.Cube_Followersschema.find({'User_Id': req.body.User_Id, 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Trends.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The User Followed Cube List."});
            } else {
                var CubesArray = [];
                var Return_Json = result.map((Objects) => { CubesArray.push(Objects.Cube_Id); });
                var Skip_Count = parseInt(req.body.Skip_Count);
                TrendsModel.Cube_TrendsSchema.find({'Cube_Ids': { $in: CubesArray }, 'Trends_Tags': req.body.Trends_Tag, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 }, skip: Skip_Count, limit: 15 }, function(err_1, result_1) {
                    if(err_1) {
                        res.status(500).send({status:"False", Error:err_1});
                    } else {
                        
                        result_1 = JSON.parse(JSON.stringify(result_1));
                        
                        const Get_Trends_Info = (result_1) => Promise.all(
                            result_1.map(info_1 => TrendsInfo(info_1)) 
                        ).then( result_2 => {
                                result_2 = result_2.map((Objects) => { Objects.Time_Ago = moment(Objects.Time_Ago).fromNow();  return Objects; });
                                res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                        }).catch( err_2 => {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends List Category Info Find Main Promise Error', 'Trends.controller.js', err_2);
                            res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Trends Info Find Promise Error "});
                        });
                        const TrendsInfo = info_1 =>
                            Promise.all([
                                UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                                TrendsModel.Trends_Emoteschema.find({ 'Trends_Id': info_1._id }).exec(),
                                UserModel.UserSchema.findOne({ '_id': info_1.Shared_Trends_User_Id }, { Inscube_Name: 1}).exec(),
                                ]).then( Data => {
                                    info_1.User_Name = Data[0].Inscube_Name;
                                    info_1.User_Image = Data[0].Image;
                                    info_1.Time_Ago = info_1.updatedAt;
                                    info_1.Emotes = Data[1];
                                    if(Data[2] !== null){ info_1.Trends_Owner_Name = Data[2].Inscube_Name; }
                                    info_1.Comments = [];
                                    var cubeIds = info_1.Cube_Ids;

                                        const GetCube_Info = (cubeIds) => Promise.all(
                                                cubeIds.map(info => Cube_Info(info)) 
                                            ).then( result_3 => {
                                                info_1.Cubes_Info = result_3;
                                                return info_1;
                                            }).catch( err_3 => {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Submit Cube Info Find Promise Error', 'Trends.controller.js', err_3);
                                                res.status(500).send({Status:"False", Error:err_3, Message: "Some error occurred while Find the Cube Trends list Cube Info Find Promise Error "});
                                            });
                            
                                            const Cube_Info = info =>
                                                Promise.all([ 
                                                    CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                    ]).then( Datas => {
                                                        return Datas[0];
                                                    }).catch(error => {
                                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends list Cube Info Find Promise Error', 'Trends.controller.js', error);
                                                    });     
                                    return GetCube_Info(cubeIds);

                                }).catch(error_1 => {
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends List Cube Info Find Promise Error', 'Trends.controller.js ', error_1);
                                });     
                        Get_Trends_Info(result_1);
                    }
                });
            }
        });
    }
};




// -----------------------------------------------------------  Cube Trends Filter List --------------------------------------------------
exports.CubeTrends_TagId_Filter = function(req, res) {
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Tag_Id || req.body.Tag_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Tag Id can not be empty" });
    }else{
        CubeModel.Cube_Followersschema.find({'User_Id': req.body.User_Id, 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Trends.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The User Followed Cube List."});
            } else {
                var CubesArray = [];
                var Return_Json = result.map((Objects) => { CubesArray.push(Objects.Cube_Id); });
                var Skip_Count = parseInt(req.body.Skip_Count);
                TrendsModel.Trends_TagsSchema.findOne({ '_id': req.body.Tag_Id }, function(tag_err, tag_result) { 
                    if(tag_err) {
                    res.status(500).send({status:"False", Error:tag_err});
                   } else {
                        TrendsModel.Cube_TrendsSchema.find({'Cube_Ids': { $in: CubesArray }, 'Trends_Tags': tag_result.Tag, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 }, skip: Skip_Count, limit: 15 }, function(err_1, result_1) {
                            if(err_1) {
                                res.status(500).send({status:"False", Error:err_1});
                            } else {
                                
                                result_1 = JSON.parse(JSON.stringify(result_1));
                                
                                const Get_Trends_Info = (result_1) => Promise.all(
                                    result_1.map(info_1 => TrendsInfo(info_1)) 
                                ).then( result_2 => {
                                        result_2 = result_2.map((Objects) => { Objects.Time_Ago = moment(Objects.Time_Ago).fromNow();  return Objects; });
                                        res.status(200).send({ Status:"True", Output: "True", Response: result_2, Tag: tag_result.Tag });
                                }).catch( err_2 => {
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends List Category Info Find Main Promise Error', 'Trends.controller.js', err_2);
                                    res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Trends Info Find Promise Error "});
                                });
                                const TrendsInfo = info_1 =>
                                    Promise.all([
                                        UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                                        TrendsModel.Trends_Emoteschema.find({ 'Trends_Id': info_1._id }).exec(),
                                        UserModel.UserSchema.findOne({ '_id': info_1.Shared_Trends_User_Id }, { Inscube_Name: 1}).exec(),
                                        ]).then( Data => {
                                            info_1.User_Name = Data[0].Inscube_Name;
                                            info_1.User_Image = Data[0].Image;
                                            info_1.Time_Ago = info_1.updatedAt;
                                            info_1.Emotes = Data[1];
                                            if(Data[2] !== null){ info_1.Trends_Owner_Name = Data[2].Inscube_Name; }
                                            info_1.Comments = [];
                                            var cubeIds = info_1.Cube_Ids;

                                                const GetCube_Info = (cubeIds) => Promise.all(
                                                        cubeIds.map(info => Cube_Info(info)) 
                                                    ).then( result_3 => {
                                                        info_1.Cubes_Info = result_3;
                                                        return info_1;
                                                    }).catch( err_3 => {
                                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Submit Cube Info Find Promise Error', 'Trends.controller.js', err_3);
                                                        res.status(500).send({Status:"False", Error:err_3, Message: "Some error occurred while Find the Cube Trends list Cube Info Find Promise Error "});
                                                    });
                                    
                                                    const Cube_Info = info =>
                                                        Promise.all([ 
                                                            CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                            ]).then( Datas => {
                                                                return Datas[0];
                                                            }).catch(error => {
                                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends list Cube Info Find Promise Error', 'Trends.controller.js', error);
                                                            });     
                                            return GetCube_Info(cubeIds);

                                        }).catch(error_1 => {
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends List Cube Info Find Promise Error', 'Trends.controller.js ', error_1);
                                        });     
                                Get_Trends_Info(result_1);
                            }
                        });
                    }
                });
            }
        });
    }
};

// -----------------------------------------------------------  Report Trends Submit Check --------------------------------------------------
exports.Report_Trends_Check = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Trends_Id || req.body.Trends_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Id can not be empty" });
    }else{
        TrendsModel.Report_TrendsSchema.findOne({'User_Id': req.body.User_Id, 'Trends_Id': req.body.Trends_Id }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Report find Query Error', 'Posts.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Trends Find"});           
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
exports.Report_Trends_Submit = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Trends_Id || req.body.Trends_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Id can not be empty" });
    }else if(!req.body.Report_Type || req.body.Report_Type === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Report Type can not be empty" });
    }else{

        var varReport_TrendsSchema = new TrendsModel.Report_TrendsSchema({
            User_Id: req.body.User_Id,
            Trends_Id: req.body.Trends_Id,
            Report_Type: req.body.Report_Type,
            Report_Text: req.body.Report_Text || '',
            Active_Status: 'Active'
        });

        varReport_TrendsSchema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Report Submit Query Error', 'Posts.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Trends Report Submit"});           
            } else {
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
     }
};

// -----------------------------------------------------------  Cube Based Trends List ----------------------------------------------------------
exports.Cube_Based_Trends_List = function(req, res) {
    if(!req.params.Cube_Id || req.params.Cube_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else{
        TrendsModel.Cube_TrendsSchema.find({ 'Cube_Ids': req.params.Cube_Id, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 } }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Find Query Error', 'Trends.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The Cube Trends."});
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
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Trends Info Find Promise Error', 'Trends.controller.js', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Related Trends Info Promise Error"});
                    });

                    const PostInfo = info_1 =>
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            TrendsModel.Trends_Emoteschema.find({ 'Trends_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Trends_User_Id }, { Inscube_Name: 1}).exec(),
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
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Trends Cube Info Find Promise Error', 'Trends.controller.js', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Related Trends Cube Info Promise Error "});
                                        });
                        
                                        const Category_Info = info =>
                                            Promise.all([
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Trends Cube Info Find Promise Error', 'Trends.controller.js', error);
                                                });     
                                return GetCategory_Info(cubeIds);

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Trends Info Find Promise Error', 'Trends.controller.js', error_1);
                            });     
                Get_Post_Info(result);              
            }
        });
    }
};

// -----------------------------------------------------------  Cube Based Trends Filter List --------------------------------------------------
exports.CubeBased_Trends_Filter = function(req, res) {
    if(!req.body.Cube_Id || req.body.Cube_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else if(!req.body.Trends_Tag || req.body.Trends_Tag === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Tag can not be empty" });
    }else{
        TrendsModel.Cube_TrendsSchema.find({ 'Cube_Ids': req.body.Cube_Id, 'Trends_Tags': req.body.Trends_Tag, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 } }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Find Query Error', 'Trends.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The Cube Trends."});
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
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Trends Info Find Promise Error', 'Trends.controller.js', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the Cube Related Trends Info Promise Error"});
                    });

                    const PostInfo = info_1 =>
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            TrendsModel.Trends_Emoteschema.find({ 'Trends_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Trends_User_Id }, { Inscube_Name: 1}).exec(),
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
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Trends Cube Info Find Promise Error', 'Trends.controller.js', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Related Trends Cube Info Promise Error "});
                                        });
                        
                                        const Category_Info = info =>
                                            Promise.all([
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Trends Cube Info Find Promise Error', 'Trends.controller.js', error);
                                                });     
                                return GetCategory_Info(cubeIds);

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Related Trends Info Find Promise Error', 'Trends.controller.js', error_1);
                            });     
                Get_Post_Info(result);              
            }
        });
    }
};

// -----------------------------------------------------------   User Trends ----------------------------------------------------------
exports.User_Trends = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        TrendsModel.Cube_TrendsSchema.find({ 'User_Id': req.params.User_Id, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 } }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Trends List Find Query Error', 'Trends.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The User Based Cube Trends List."});
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
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Trends List Find Promise Error', 'Trends.controller.js', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the User Based Cube Trends List Promise Error "});
                    });

                    const PostInfo = info_1 =>
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            PostModel.Post_Emoteschema.find({ 'Trends_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Trends_User_Id }, { Inscube_Name: 1}).exec(),
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
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Trends List Cube Info Find Promise Error', 'Trends.controller.js', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the User Based Cube Trends List Cube Info Promise Error "});
                                        });
                        
                                        const Category_Info = info =>
                                            Promise.all([ 
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Trends List Cube Info Promise Error', 'Trends.controller.js', error);
                                                });     
                                return GetCategory_Info(cubeIds); 

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Trends List Promise Error', 'Trends.controller.js', error_1);
                            });     
                Get_Post_Info(result);
                            
            }
        });
    }
};

// -----------------------------------------------------------   User Based Trends Filter ----------------------------------------------------------
exports.UserBased_Trends_Filter = function(req, res) {
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Trends_Tag || req.body.Trends_Tag === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Tag can not be empty" });
    }else{
        TrendsModel.Cube_TrendsSchema.find({ 'User_Id': req.body.User_Id, 'Trends_Tags': req.body.Trends_Tag, 'Active_Status': 'Active' }, {}, {sort: { updatedAt: -1 } }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Trends List Find Query Error', 'Trends.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The User Based Cube Trends List."});
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
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Trends List Find Promise Error', 'Trends.controller.js', err_2);
                        res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Find the User Based Cube Trends List Promise Error "});
                    });

                    const PostInfo = info_1 =>
                        Promise.all([
                            UserModel.UserSchema.findOne({ '_id': info_1.User_Id }).exec(),
                            PostModel.Post_Emoteschema.find({ 'Trends_Id': info_1._id }).exec(),
                            UserModel.UserSchema.findOne({ '_id': info_1.Shared_Trends_User_Id }, { Inscube_Name: 1}).exec(),
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
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Trends List Cube Info Find Promise Error', 'Trends.controller.js', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the User Based Cube Trends List Cube Info Promise Error "});
                                        });
                        
                                        const Category_Info = info =>
                                            Promise.all([ 
                                                CubeModel.CubesSchema.findOne({ '_id': info }, {Category_Id: 1, Image: 1, Name: 1}).exec(),
                                                ]).then( Data => {
                                                    return Data[0];
                                                }).catch(error => {
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Trends List Cube Info Promise Error', 'Trends.controller.js', error);
                                                });     
                                return GetCategory_Info(cubeIds); 

                            }).catch(error_1 => {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Based Cube Trends List Promise Error', 'Trends.controller.js', error_1);
                            });     
                Get_Post_Info(result);
                            
            }
        });
    }
};

// -----------------------------------------------------------  Cube Trends Share ----------------------------------------------------------
exports.Cube_Trends_Share = function(req, res) {
    
    var Cubes_List =JSON.parse(req.body.Cube_Ids);

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Trends_Id || req.body.Trends_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Id can not be empty" });
    }else if(!Cubes_List || Cubes_List.length <= 0 ){
        res.status(200).send({Status:"True", Output:"False", Message: "Selected Cubes can not be empty" });
    }else{
        TrendsModel.Cube_TrendsSchema.findOne({'_id': req.body.Trends_Id }, function(post_err, Post_result) {
            if(post_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Find Query Error', 'Trends.controller.js', post_err);
                res.status(500).send({status:"False", Error:post_err, message: "Some error occurred while Find The Cube Trends."});
            } else {
                
                var varCube_TrendsSchema = new TrendsModel.Cube_TrendsSchema({
                    User_Id: req.body.User_Id,
                    Cube_Ids: Cubes_List,
                    Trends_Text: Post_result.Trends_Text,
                    Trends_Tags: Post_result.Trends_Tags,
                    Shared_Trends: 'True',
                    Shared_Trends_User_Id: Post_result.User_Id,
                    Shared_Trends_Id: Post_result._id,
                    Active_Status: 'Active'
                });
                varCube_TrendsSchema.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Share Submit Query Error', 'Trends.controller.js', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Trends Share Submit"});           
                    } else {
                        result = JSON.parse(JSON.stringify(result));
                        UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                            if(err_user) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Trends.controller.js', err_user);
                                res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The User Info."});
                            } else {
                                UserModel.UserSchema.findOne({'_id': result.Shared_Trends_User_Id }, { Inscube_Name: 1}, function(err_share_user, Share_User_Info) {
                                    if(err_share_user) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Info FindOne Query Error', 'Trends.controller.js', err_share_user);
                                        res.status(500).send({status:"False", Error:err_share_user, message: "Some error occurred while Find The User Info."});
                                    } else {
                                        result.Time_Ago = moment(result.updatedAt).fromNow();
                                        result.User_Name = User_Info.Inscube_Name;
                                        result.Trends_Owner_Name = Share_User_Info.Inscube_Name;
                                        result.User_Image = User_Info.Image;
                                        result.Emotes = [];
                                        result.Comments = [];
                                        
                                        var cubeIds = result.Cube_Ids;
        
                                        const GetCategory_Info = (cubeIds) => Promise.all(
                                            cubeIds.map(info => Category_Info(info)) 
                                        ).then( result_1 => {
                                                if (result.User_Id !== Post_result.User_Id) {
                                                    var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                        User_Id: req.body.User_Id,
                                                        To_User_Id: Post_result.User_Id,
                                                        Notify_Type: 'Trends_Shared',
                                                        Trends_Id: result._id,
                                                        Trends_Text: result.Trends_Text,
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
                                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Share Trends Info Promise Error', 'Trends.controller.js', err_1);
                                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube Trends Share Trends Info Promise "});
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
                                                                    Notify_Type: 'Shared_Trends',
                                                                    Trends_Id: result._id,
                                                                    Trends_Text: result.Trends_Text,
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
                                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Share Trends Info Find Promise Error', 'Trends.controller.js', error);
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









// ----------------------------------------------------------------------  Trends Emote Submit ----------------------------------------------------------
exports.Trends_Emote_Submit = function(req, res) {
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Trends_Id || req.body.Trends_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Id can not be empty" });
    }else if(!req.body.Emote_Text || req.body.Emote_Text === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Emote Text can not be empty" });
    }else{

        TrendsModel.Trends_Emoteschema.findOne({'Trends_Id': req.body.Trends_Id, 'User_Ids': req.body.User_Id, 'Emote_Text' : req.body.Emote_Text.toLowerCase(), 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Trends Emote FindOne Query ', 'Trends.controller.js', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The Trends Emote FindOne."});
            } else {
                if ( result === null) {
                    TrendsModel.Trends_Emoteschema.findOne({'Trends_Id': req.body.Trends_Id, 'Emote_Text' : req.body.Emote_Text.toLowerCase(), 'Active_Status': 'Active' }, function(err_1, result_1) {
                        if(err_1) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Trends Emote FindOne Query', 'Trends.controller.js', err_1);
                            res.status(500).send({status:"False", Error:err_1, message: "Some error occurred while Find The Trends Emote FindOne."});
                        } else {
                            if ( result_1 !== null) {
                                result_1.User_Ids.push(req.body.User_Id);
                                result_1.Count = result_1.Count + 1;
                                result_1.save(function(err_2, result_2) {
                                    if(err_2) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Trends Emote Update Query Error', 'Posts.controller.js', err_2);
                                        res.status(500).send({Status:"False", Error: err_2, Message: "Some error occurred while Update the Trends Emote "});           
                                    } else {
                                        TrendsModel.Cube_TrendsSchema.findOne({'_id': result_1.Trends_Id }, function(err_4, result_4) {
                                            if(err_4) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends FindOne Query Error', 'Posts.controller.js', err_2);
                                                res.status(200).send({ Status:"True", Output: "True", Response: result_2 });           
                                            } else {
                                                if (result_4.User_Id !== req.body.User_Id) {
                                                    LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                                    var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                        User_Id: req.body.User_Id,
                                                        To_User_Id: result_4.User_Id,
                                                        Notify_Type: 'Trends_Emote',
                                                        Trends_Id: req.body.Trends_Id,
                                                        Trends_Text: result_4.Trends_Text,
                                                        Cube_Id: result_4.Cube_Ids[0],
                                                        Cube_Ids: result_4.Cube_Ids,
                                                        Emote_Id: result_2._id,
                                                        Opinion_Id: '',
                                                        Emote_Text: result_1.Emote_Text,
                                                        View_Status: 0,
                                                        Active_Status: 'Active'
                                                    });
                                                    varPost_NotificationSchema.save();
                                                    if (App_Info !== null) {
                                                        UserModel.UserSchema.findOne({'_id': req.body.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                                                            CubeModel.CubesSchema.findOne({ '_id':  result_4.Cube_Ids[0] }, {Category_Id: 1, Image: 1, Name: 1}, function(err_cube, Cube_Info) {
                                                                var registrationToken = App_Info.Firebase_Token;
                                                                var payload = {
                                                                    notification: {
                                                                        title: 'New comment added your #campaign',
                                                                        body: User_Info.Inscube_Name + ' commented ' + result_1.Emote_Text + ' to your  #campaign in ' + Cube_Info.Name,
                                                                    },
                                                                    data: {
                                                                        type: 'Trends',
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
                                var varTrends_Emoteschema = new TrendsModel.Trends_Emoteschema({
                                    User_Ids: Ids,
                                    Trends_Id: req.body.Trends_Id,
                                    Emote_Text: req.body.Emote_Text.toLowerCase(),
                                    Count: 1,
                                    Active_Status: 'Active'
                                });
                                varTrends_Emoteschema.save(function(err_3, result_3) {
                                    if(err_3) {
                                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Emote Submit Query Error', 'Trends.controller.js', err_3);
                                        res.status(500).send({Status:"False", Error:err_3, Message: "Some error occurred while Submit the Trends Emote"});           
                                    } else {
                                        TrendsModel.Cube_TrendsSchema.findOne({'_id': req.body.Trends_Id }, function(err_4, result_4) {
                                            if(err_4) {
                                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends_Id FindOne Query Error', 'Trends.controller.js', err_2);
                                                res.status(200).send({ Status:"True", Output: "True", Response: result_3 });           
                                            } else {
                                                result_4 = JSON.parse(JSON.stringify(result_4));
                                                if (result_4.User_Id !== req.body.User_Id) {
                                                    LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                                        var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                                            User_Id: req.body.User_Id,
                                                            To_User_Id: result_4.User_Id,
                                                            Notify_Type: 'Trends_Emote',
                                                            Trends_Id: req.body.Trends_Id,
                                                            Trends_Text: result_4.Trends_Text,
                                                            Cube_Id: result_4.Cube_Ids[0],
                                                            Cube_Ids: result_4.Cube_Ids,
                                                            Emote_Id: result_3._id,
                                                            Opinion_Id: '',
                                                            Emote_Text: result_3.Emote_Text,
                                                            View_Status: 0,
                                                            Active_Status: 'Active'
                                                        });
                                                        varPost_NotificationSchema.save();
                                                        if (App_Info !== null) {
                                                            UserModel.UserSchema.findOne({'_id': req.body.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                                                                CubeModel.CubesSchema.findOne({ '_id':  result_4.Cube_Ids[0] }, {Category_Id: 1, Image: 1, Name: 1}, function(err_cube, Cube_Info) {
                                                                    var registrationToken = App_Info.Firebase_Token;
                                                                    var payload = {
                                                                        notification: {
                                                                            title: 'New comment added your #campaign',
                                                                            body: User_Info.Inscube_Name + ' commented ' + result_1.Emote_Text + ' to your #campaign in ' + Cube_Info.Name,
                                                                        },
                                                                        data: {
                                                                            type: 'Trends',
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

// ----------------------------------------------------------------------  Trends Emote Update ----------------------------------------------------------
exports.Trends_Emote_Update = function(req, res) {
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Trends_Id || req.body.Trends_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Id can not be empty" });
    }else if(!req.body.Emote_Id || req.body.Emote_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Emote Id can not be empty" });
    }else{

        TrendsModel.Trends_Emoteschema.findOne({'Trends_Id': req.body.Trends_Id, '_id': req.body.Emote_Id, 'Active_Status': 'Active' }, function(err, result) {
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
                            TrendsModel.Cube_TrendsSchema.findOne({'_id': req.body.Trends_Id }, function(err_4, result_4) {
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
                                                Notify_Type: 'Trends_Emote',
                                                Trends_Id: req.body.Trends_Id,
                                                Trends_Text: result_4.Trends_Text,
                                                Cube_Id: result_4.Cube_Ids[0],
                                                Cube_Ids: result_4.Cube_Ids,
                                                Emote_Id: result_1._id,
                                                Opinion_Id: '',
                                                Emote_Text: result_1.Emote_Text,
                                                View_Status: 0,
                                                Active_Status: 'Active'
                                            });
                                            varPost_NotificationSchema.save();
                                            if (App_Info !== null) {
                                                UserModel.UserSchema.findOne({'_id': req.body.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                                                    CubeModel.CubesSchema.findOne({ '_id':  result_4.Cube_Ids[0] }, {Category_Id: 1, Image: 1, Name: 1}, function(err_cube, Cube_Info) {
                                                        var registrationToken = App_Info.Firebase_Token;
                                                        var payload = {
                                                            notification: {
                                                                title: 'New comment added your #campaign',
                                                                body: User_Info.Inscube_Name + ' commented ' + result_1.Emote_Text + ' to your #campaign in ' + Cube_Info.Name,
                                                            },
                                                            data: {
                                                                type: 'Trends',
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


// ----------------------------------------------------------------------  Trends Comment Submit ----------------------------------------------------------
exports.Trends_Comment_Submit = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Trends_Id || req.body.Trends_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Id can not be empty" });
    }else if(!req.body.Comment_Text || req.body.Comment_Text === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Comment can not be empty" });
    }else{

        var varTrends_Commentschema = new TrendsModel.Trends_Commentschema({
            User_Id: req.body.User_Id,
            Trends_Id: req.body.Trends_Id,
            Comment_Text: req.body.Comment_Text,
            Active_Status: 'Active'
        });
        varTrends_Commentschema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment Submit Query Error', 'Trends.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Submit the Cube Trends Comment"});           
            } else {
                
                UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                    if(err_user) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'UserInfo FindOne Query Error', 'Trends.controller.js', err_user);
                        res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The User Info."});
                    } else {
                        result = JSON.parse(JSON.stringify(result));
                        result.User_Name = User_Info.Inscube_Name;
                        result.User_Image = User_Info.Image;
                        result.Time_Ago = moment(result.updatedAt).fromNow();
                        TrendsModel.Cube_TrendsSchema.findOne({'_id': req.body.Trends_Id }, function(err_4, result_4) {
                            if(err_4) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends FindOne Query Error', 'Trends.controller.js', err_2);
                                res.status(200).send({ Status:"True", Output: "True", Response: result });           
                            } else {
                                result_4 = JSON.parse(JSON.stringify(result_4));
                                if (result_4.User_Id !== req.body.User_Id) {
                                    LoginInfoModel.AndroidAppInfoSchema.findOne({'User_Id': result_4.User_Id, 'Active_Status': 'Active'}, function(App_err, App_Info) {
                                        var varPost_NotificationSchema = new UserModel.Post_NotificationSchema({
                                            User_Id: req.body.User_Id,
                                            To_User_Id: result_4.User_Id,
                                            Notify_Type: 'Trends_Opinion',
                                            Trends_Id: req.body.Trends_Id,
                                            Trends_Text: result_4.Trends_Text,
                                            Cube_Id: result_4.Cube_Ids[0],
                                            Cube_Ids: result_4.Cube_Ids,
                                            Emote_Id: '',
                                            Opinion_Id: result._id,
                                            Emote_Text: '',
                                            View_Status: 0,
                                            Active_Status: 'Active'
                                        });
                                        varPost_NotificationSchema.save();
                                        if (App_Info !== null) {
                                            CubeModel.CubesSchema.findOne({ '_id':  result_4.Cube_Ids[0] }, {Category_Id: 1, Image: 1, Name: 1}, function(err_cube, Cube_Info) {
                                                var registrationToken = App_Info.Firebase_Token;
                                                var payload = {
                                                    notification: {
                                                        title: 'New opinion on your #campaign',
                                                        body: User_Info.Inscube_Name + ' shared an opinion on your #campaign in ' + Cube_Info.Name,
                                                    },
                                                    data: {
                                                        type: 'Trends',
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
                                        } else {
                                            res.status(200).send({ Status:"True", Output: "True", Response: result });
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

// ----------------------------------------------------------------------  Trends Comment List ----------------------------------------------------------
exports.Trends_Comment_List = function(req, res) {

    if(!req.params.Trends_Id || req.params.Trends_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Id can not be empty" });
    }else{
        TrendsModel.Trends_Commentschema.find({'Trends_Id': req.params.Trends_Id, 'Active_Status': 'Active' }, {__v: 0}, {sort: { updatedAt: -1 }}, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment Find Query Error', 'Trends.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Find Cube Trends Comment "});          
            } else {
                result = JSON.parse(JSON.stringify(result));
                
                const GetUser_Info = (result) => Promise.all(
                    result.map(info => User_Info(info))
                ).then( result_1 => { 
                            res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                }).catch( err_1 => { 
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment Find Promise Error', 'Trends.controller.js', err_1);
                    res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find Cube Trends Comment  "});
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
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment User Info Find Promise Error', 'Trends.controller.js', error);
                        });     
                GetUser_Info(result);
            }
        });
    }
};

// ----------------------------------------------------------------------  Trends Comment Update ----------------------------------------------------------
exports.Trends_Comment_Update = function(req, res) {

    if(!req.body.Comment_Id || req.body.Comment_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Comment Id can not be empty" });
    }else if(!req.body.Comment_Text || req.body.Comment_Text === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Comment can not be empty" });
    }else{
        TrendsModel.Trends_Commentschema.findOne({'_id': req.body.Comment_Id, 'Active_Status': 'Active' }, function(comment_err, Comment_result) {
            if(comment_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment Find Query Error', 'Trends.controller.js', comment_err);
                res.status(500).send({Status:"False", Error:comment_err, Message: "Some error occurred while Find Cube Trends Find"});           
            } else {
                Comment_result.Comment_Text = req.body.Comment_Text;
                Comment_result.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment Update Query Error', 'Trends.controller.js ', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while  Update Cube Trends Comment"});           
                    } else {
                        UserModel.UserSchema.findOne({'_id': result.User_Id }, { Image: 1, Inscube_Name: 1}, function(err_user, User_Info) {
                            if(err_user) {
                                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment UserInfo FindOne Query Error', 'Trends.controller.js', err_user);
                                res.status(500).send({status:"False", Error:err_user, message: "Some error occurred while Find The Cube Trends Comment  User Info."});
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

// ----------------------------------------------------------------------  Trends Comment Delete ----------------------------------------------------------
exports.Trends_Comment_Delete = function(req, res) {

    if(!req.params.Trends_Comment_Id || req.params.Trends_Comment_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Trends Comment Id can not be empty" });
    }else{
        TrendsModel.Trends_Commentschema.findOne({'_id': req.params.Trends_Comment_Id }, function(comment_err, Comment_result) {
            if(comment_err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment Info FindOne Query Error', 'Posts.controller.js', comment_err);
                res.status(500).send({Status:"False", Error:comment_err, Message: "Some error occurred while Find The Cube Trends Comment Info"});           
            } else {

                UserModel.Post_NotificationSchema.where({ Opinion_Id: req.params.Trends_Comment_Id}).updateMany({ $set: { Active_Status: 'Inactive' }}).exec();
                Comment_result.Active_Status = 'Inactive';

                Comment_result.save(function(err, result) {
                    if(err) {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment Update Query Error', 'Posts.controller.js', err);
                        res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Update The Cube Trends Comment"});           
                    } else {
                        res.status(200).send({ Status:"True", Output: "True", Response: result });
                    }
                });
            }
        });
     }
};

// ---------------------------------------------------------------------- Report Trends Comment Submit Check ----------------------------------------------------------
exports.Report_TrendsComment_Check = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Comment_Id || req.body.Comment_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Post Id can not be empty" });
    }else{
        TrendsModel.Report_Trends_Commentschema.findOne({'User_Id': req.body.User_Id, 'Comment_Id': req.body.Comment_Id }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment Report Info FindOne  Query Error', 'Trends.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Find the Cube Trends Comment Report"});           
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

// ---------------------------------------------------------------------- Report Trends Comment Submit ----------------------------------------------------------
exports.Report_TrendsComment_Submit = function(req, res) {

    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Comment_Id || req.body.Comment_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Comment Id can not be empty" });
    }else if(!req.body.Report_Type || req.body.Report_Type === '' ){
        res.status(200).send({Status:"True", Output:"False", Message: "Report Type can not be empty" });
    }else{
        var varReport_Trends_Commentschema = new TrendsModel.Report_Trends_Commentschema({
            User_Id: req.body.User_Id,
            Comment_Id: req.body.Comment_Id,
            Report_Type: req.body.Report_Type,
            Report_Text: req.body.Report_Text,
            Active_Status: 'Active'
        });
        varReport_Trends_Commentschema.save(function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Trends Comment Report Submit Query Error', 'Trends.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Submit the Cube Trends Comment Report"});           
            } else {
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
     }
};


// ----------------------------------------------------------------------  Search Trends Tags----------------------------------------------------------
exports.Search_Trends_Tags = function(req, res) {
    if(!req.params.Search_text || req.params.Search_text === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Search text can not be empty" });
    }else{
        TrendsModel.Trends_TagsSchema.find({Tag: { $regex: new RegExp(req.params.Search_text, "i") }, Active_Status: 'Active' }, { Tag: 1}, {}, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Trends Tag Find Query Error', 'Trends.controller.js', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Find the Trends Tag Search"});           
            } else {
                result =JSON.parse(JSON.stringify(result));
                result = result.map( Objects => {
                    var Tag = Objects.Tag;
                    Objects.Tag = Tag.replace(/#/gi, "");
                    return Objects;
                });
                res.status(200).send({ Status:"True", Output: "True", Response: result });
            }
        });
    }
};