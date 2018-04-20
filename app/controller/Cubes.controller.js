var ErrorManagement = require('./../../app/config/ErrorHandling.js');
var CubeModel = require('../models/Cubes.model.js');
var UserModel = require('../models/User.model.js');
var multer = require('multer');




// Cube Image Upload Disk Storage and Validate Functions ----------------------------------------------------------------------------------------
var Cube_Image_Storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, './Uploads/Cubes'); },
    filename: (req, file, cb) => { cb(null, 'Cube_' + Date.now() + '.png'); }
});
var Cube_Image_Upload = multer({
    storage: Cube_Image_Storage,
    fileFilter: function (req, file, callback) {
        let extArray = file.originalname.split(".");
        let extension = (extArray[extArray.length - 1]).toLowerCase();
        if(extension !== 'png' && extension !== 'jpg' && extension !== 'gif' && extension !== 'jpeg') {
            return callback("Only 'png, gif, jpg and jpeg' images are allowed");
        }
        callback(null, true);
    }
}).single('image');


// Cube Topic File Upload Disk Storage and Validate Functions ----------------------------------------------------------------------------------------
var Cube_Topic_File_Storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, './Uploads/Topic_Attachments'); },
    filename: (req, file, cb) => {
        let extArray = file.originalname.split(".");
        let extension = (extArray[extArray.length - 1]).toLowerCase();
     cb(null, 'Topic_' + Date.now() + '.' + extension); }
});
var Cube_Topic_File_Upload = multer({
    storage: Cube_Topic_File_Storage,
    fileFilter: function (req, file, callback) {
        let extArray = file.originalname.split(".");
        let extension = (extArray[extArray.length - 1]).toLowerCase();
        if(extension !== 'png' && extension !== 'jpg' && extension !== 'gif' && extension !== 'jpeg' && extension !== 'mp4' && extension !== 'mkv' && extension !== '3gp' && extension !== 'flv') {
            return callback("Only 'png, gif, jpg, jpeg,  mp4, mkv, flv and 3gp' images are allowed");
        }
        callback(null, true);
    }
}).any('attachments', 20);



// ---------------------------------------------------------------------- Category List ----------------------------------------------------------
exports.CategoryList = function(req, res) {
    CubeModel.Cube_CategorySchema.find({}, {__v: 0}, function(err, data) {
        if(err) {
            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Category List Find Query Error', 'Cubes.controller.js - 12', err);
            res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The Category List."});
        } else {

            const GetCubeCount = (result) => Promise.all(  // Main Promise For Cube List Get --------------
                result.map(info => getCubeInfo(info)) 
            ).then( result_1 => {  
                res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
            }).catch( err_1 => { 
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Category List Cube Count Find Main Promise Error', 'Cubes.controller.js - 226', err_1);
                res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Category List Cube Count Find Promise Error "});
            });

            const getCubeInfo = info => // Sub Promise For Cube Count Find --------------
                Promise.all([ 
                    CubeModel.CubesSchema.count({ 'Category_Id': info._id }).exec(),
                    ]).then( Data => {
                        var result = JSON.parse(JSON.stringify(info)); 
                        result.Cubes_Count = Data[0];
                        return result;
                    }).catch(error => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Category List Cube Count Find Sub Promise Error', 'Cubes.controller.js - 67', error);
                    });     
            GetCubeCount(data); // Main Promise Call Function Cube --------------
        }
    });
};


// ---------------------------------------------------------------------- Category Info ----------------------------------------------------------
exports.CategoryInfo = function(req, res) {
    CubeModel.Cube_CategorySchema.findOne({'_id': req.params.Category_Id}, function(err, result) {
        if(err) {
            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Category Info Find Query Error', 'Cubes.controller.js - 87', err);
            res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The Category Info."});
        } else { 
            res.status(200).send({ Status:"True", Output: "True", Response: result });
        }
    });
};


// ---------------------------------------------------------------------- Cube Creation ----------------------------------------------------------
exports.CreateCube = function(req, res) {
    Cube_Image_Upload(req, res, function(upload_err) {

        if(!req.body.User_Id || req.body.User_Id === '') {
            res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
        }else if(!req.body.Category_Id && req.body.Category_Id === ''){
            res.status(200).send({Status:"True", Output:"False", Message: "Category Id can not be empty" });
        }else if(!req.body.Name || req.body.Name === '' ){
            res.status(200).send({Status:"True", Output:"False", Message: "Name can not be empty" });
        }else if(!req.body.Security || req.body.Security === '' ){
            res.status(200).send({Status:"True", Output:"False", Message: "Security Status can not be empty" });
        }else{

            CubeModel.Cube_CategorySchema.findOne({'_id': req.body.Category_Id }, function(err, data) {
                if(err){
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Creation Category Info Find Query Error', 'Cubes.controller.js - 35', err);
                    res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Cube Creation"});
                }else {
                    var Cube_Image = '';
                        if (req.file !== undefined ) {  Cube_Image = req.file.filename;
                        } else { Cube_Image = data.Image; }

                    var varCubesSchema = new CubeModel.CubesSchema({
                        User_Id: req.body.User_Id,
                        Category_Id: req.body.Category_Id,
                        Name: req.body.Name,
                        Image: Cube_Image,
                        Security: req.body.Security || '',
                        Security_Code: req.body.Security_Code || '',
                        Description: req.body.Description || '',
                        Location: req.body.Location || '',
                        Web: req.body.Web || '',
                        Mail: req.body.Mail || '',
                        Contact: req.body.Contact || '',
                        Active_Status: 'Active'
                    });
                    varCubesSchema.save(function(Submit_err, result) { // Cube Creation -----------------------------
                        if(Submit_err) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Creation Query Error', 'Cubes.controller.js - 81', Submit_err);
                            res.status(500).send({Status:"False", Error:Submit_err, Message: "Some error occurred while Cube Creation"});           
                        } else {
                            result = JSON.parse(JSON.stringify(result));
                            delete result.Security_Code;
                            delete result.__v;
                            var varCube_Followersschema = new CubeModel.Cube_Followersschema({
                                User_Id: req.body.User_Id,
                                Cube_Id: result._id,
                                Active_Status: 'Active'
                            });
                            varCube_Followersschema.save(function(err_1, result_1) {
                                if (err_1) {
                                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Create Cube Follow Query Error', 'Cubes.controller.js - 227', err_1);
                                    res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Follow The Cube!"});           
                                } else { 
                                    res.status(200).send({ Status:"True", Output: "True", Response: result });
                                }
                            });
                        }
                    });
                }
            });
         }
    });
};


// ---------------------------------------------------------------------- Add Cube Topic ----------------------------------------------------------
exports.AddCubeTopic = function(req, res) {
    Cube_Topic_File_Upload(req, res, function(upload_err) {

        if(!req.body.User_Id || req.body.User_Id === '') {
            res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
        }else if(!req.body.Cube_Id || req.body.Cube_Id === ''){
            res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
        }else if(!req.body.Name || req.body.Name === '' ){
            res.status(200).send({Status:"True", Output:"False", Message: "Name can not be empty" });
        }else{

            var Json = JSON.parse(JSON.stringify(req.files));
            var Return_Json = Json.map((Objects) => {
                let extArray = Objects.filename.split(".");
                let extension = (extArray[extArray.length - 1]).toLowerCase();
                if (extension === 'png' || extension === 'jpg' || extension === 'gif' || extension === 'jpeg' ) {
                    return { File_Name: Objects.filename, File_Type: 'Image', Size: Objects.size};
                }else {
                    return { File_Name: Objects.filename, File_Type: 'Video', Size: Objects.size};
                }
            });

            var varCube_Topicschema = new CubeModel.Cube_Topicschema({
                User_Id: req.body.User_Id,
                Cube_Id: req.body.Cube_Id,
                Name: req.body.Name,
                Description: req.body.Description || '',
                Attachments: Return_Json,
                Active_Status: 'Active'
            });
            varCube_Topicschema.save(function(err, result) {
                if(err) {
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Topic Add Query Error', 'Cubes.controller.js - 152', err);
                    res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Add Cube Topic"});           
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    delete result.__v;
                    res.status(200).send({ Status:"True", Output: "True", Response: result });
                }
            });
         }
    });
};


// ---------------------------------------------------------------------- Cube View ----------------------------------------------------------
exports.CubeView = function(req, res) {
    CubeModel.CubesSchema.findOne({'_id': req.params.Cube_Id, 'Active_Status': 'Active'}, { __v:0}, function(err, result) {
        if(err) {
            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube View Find Query Error', 'Cubes.controller.js - 101', err);
            res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The Cube Info."});
        } else {
            const getCubeRelatedInfo = info => // Main Promise For Cube Related Info Find --------------
                Promise.all([ 
                    CubeModel.Cube_Followersschema.count({ 'Cube_Id': info._id }).exec(),
                    CubeModel.Cube_Topicschema.find({'Cube_Id': info._id, 'Active_Status': 'Active'}, {__v: 0}, {sort: { updatedAt: -1 }} ).exec(),
                    CubeModel.Cube_CategorySchema.findOne({'_id': info.Category_Id }).exec(),
                    CubeModel.Cube_Followersschema.findOne({ 'Cube_Id': info._id, 'User_Id': req.params.User_Id }).exec(),
                    ]).then( Data => {
                        info = JSON.parse(JSON.stringify(info)); 
                        info.Members = Data[0];
                        info.Topics =  Data[1];
                        info.Category_Name =  Data[2].Name;
                        if (Data[3] === null) {
                            info.User_Follow = false;
                        } else {
                            info.User_Follow = true;
                        }
                        res.status(200).send({ Status:"True", Output: "True", Response: info });
                    }).catch(error => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cubes View Find Main Promise Error', 'Cubes.controller.js - 226', error);
                        res.status(500).send({Status:"False", Error:error, Message: "Some error occurred while Find the Cube View Promise Error "});
                    });

            getCubeRelatedInfo(result); // Main Promise Call Function Cube --------------
        }
    });
};


// ---------------------------------------------------------------------- Cubes List ----------------------------------------------------------
exports.CubesList = function(req, res) {
    CubeModel.CubesSchema.find({ 'User_Id': { $ne: req.params.User_Id }, 'Category_Id': req.params.Category_Id, 'Active_Status': 'Active'}, {__v: 0}, function(err, result) {
        if(err) {
            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cubes List Find Query Error', 'Cubes.controller.js - 12', err);
            res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The Cubes List."});
        } else {
            
            var Return_Cube_List = [];
            const GetCubeList = (result) => Promise.all(  // Main Promise For Cube List Get --------------
                    result.map(info => getCubeRelatedInfo(info)) 
                ).then( result_1 => {  
                    res.status(200).send({ Status:"True", Output: "True", Response: Return_Cube_List });
                }).catch( err_1 => { 
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cubes List Find Main Promise Error', 'Cubes.controller.js - 226', err_1);
                    res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube List Promise Error "});
                });

            const getCubeRelatedInfo = info => // Sub Promise For Cube Related Info Find --------------
                Promise.all([ 
                    CubeModel.Cube_Followersschema.count({ 'Cube_Id': info._id,  'Active_Status': 'Active' }).exec(),
                    CubeModel.Cube_Followersschema.findOne({'User_Id': req.params.User_Id, 'Cube_Id': info._id, 'Active_Status': 'Active' }).exec(),
                    ]).then( Data => {

                        if ( Data[1] === null ) {
                            info = JSON.parse(JSON.stringify(info)); 
                            info.Members = Data[0];
                            Return_Cube_List.push(info);
                        }
                        
                        return info;
                    }).catch(error => { 
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cubes List Find Cube Related Info Sub Promise Error', 'Cubes.controller.js - 237', error);
                    });

            GetCubeList(result); // Main Promise Call Function Cube --------------
        }
    });
};


// ---------------------------------------------------------------------- User Followed Cubes List ----------------------------------------------------------
exports.User_Followed_Cubes = function(req, res) {
    CubeModel.Cube_Followersschema.find({'User_Id': req.params.User_Id, 'Active_Status': 'Active' }, function(err, result) {
        if(err) {
            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
            res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
        } else {
            const GetCubeInfo = (result) => Promise.all(  // Main Promise For Cube List Get --------------
                    result.map(info => CubeInfo(info)) 
                ).then( result_1 => {  
                    res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                }).catch( err_1 => { 
                    ErrorManagement.ErrorHandling.ErrorLogCreation(req, ' User Followed Cubes List Find Main Promise Error', 'Cubes.controller.js - 226', err_1);
                    res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube List Promise Error "});
                });

            const CubeInfo = info => // Sub Promise For Cube Related Info Find --------------
                Promise.all([ 
                    CubeModel.CubesSchema.findOne({'_id': info.Cube_Id, 'Active_Status': 'Active' }, { Category_Id: 1, Name: 1, Image: 1  } ).exec(),
                    ]).then( Data => {
                        return Data[0];
                    }).catch(error => { 
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, ' User Followed Cubes List Find Cube Related Info Sub Promise Error', 'Cubes.controller.js - 237', error);
                    });

            GetCubeInfo(result); // Main Promise Call Function Cube --------------
        }
    });
};


// ---------------------------------------------------------------------- Follow Cube Creation ----------------------------------------------------------
exports.Follow_Cube = function(req, res) {
    
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Cube_Id || req.body.Cube_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else{
        CubeModel.Cube_Followersschema.findOne({'User_Id': req.body.User_Id, 'Cube_Id': req.body.Cube_Id }, function(err, result) {
            if (err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Follow Info Find Query Error', 'Cubes.controller.js - 216', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Find the Cube Follow Info"});
            }else {
                if (result === null) { // Cube Follow New Creation -----------------------------
                    var varCube_Followersschema = new CubeModel.Cube_Followersschema({
                        User_Id: req.body.User_Id,
                        Cube_Id: req.body.Cube_Id,
                        Active_Status: 'Active'
                    });
                    varCube_Followersschema.save(function(err_1, result_1) {
                        if (err_1) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Follow Creation Query Error', 'Cubes.controller.js - 227', err_1);
                            res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Follow The Cube!"});           
                        } else {
                            result_1 = JSON.parse(JSON.stringify(result_1));
                            delete result_1.__v;
                            res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                        }
                    });
                } else if ( result.Active_Status === 'Active' ) {  // Cube Already Follow  -----------------------------
                    res.status(200).send({ Status:"True", Output: "False", Message: " User Already Follow The Cube!" });
                } else if ( result.Active_Status === 'Inactive') { // Cube Already Follow But Inactive  -----------------------------
                    result.Active_Status = 'Active';
                    result.save(function(err_2, result_2) {
                        if (err_2) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Follow Update Query Error', 'Cubes.controller.js - 240', err_2);
                            res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Follow Cube Update Error!"});           
                        } else {
                            result_2 = JSON.parse(JSON.stringify(result_2));
                            delete result_2.__v;
                            res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                        }
                    });
                } else { // Cube Follow Not Match any Conditions  -----------------------------
                    res.status(500).send({Status:"False", Error:'Not Identify', Message: "Some error occurred while Follow The Cube!"}); 
                }
            }
        });
    }
};


// ---------------------------------------------------------------------- UnFollow Cube ----------------------------------------------------------
exports.UnFollow_Cube = function(req, res) {
    
    if(!req.body.User_Id || req.body.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else if(!req.body.Cube_Id || req.body.Cube_Id === ''){
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else{
        CubeModel.Cube_Followersschema.findOne({'User_Id': req.body.User_Id, 'Cube_Id': req.body.Cube_Id, 'Active_Status': 'Active' }, function(err, result) {
            if (err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Follow Info Find Query Error', 'Cubes.controller.js - 216', err);
                res.status(500).send({Status:"False", Error:err, Message: "Some error occurred while Find the Cube Follow Info"});
            }else {
                if (result !== null) { // Cube Follow New Creation -----------------------------
                    result.Active_Status = 'Inactive';
                    result.save(function(err_2, result_2) {
                        if (err_2) {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Cube Follow Update Query Error', 'Cubes.controller.js - 240', err_2);
                            res.status(500).send({Status:"False", Error:err_2, Message: "Some error occurred while Follow Cube Update Error!"});           
                        } else {
                            result_2 = JSON.parse(JSON.stringify(result_2));
                            delete result_2.__v;
                            res.status(200).send({ Status:"True", Output: "True", Response: result_2 });
                        }
                    });
                } else if ( result.Active_Status === 'Inactive' ) {  // Cube Already UnFollow  -----------------------------
                    res.status(200).send({ Status:"True", Output: "False", Message: " User Already UnFollow The Cube!" });
                } else { // Cube Follow Not Match any Conditions  -----------------------------
                    res.status(500).send({Status:"False", Error:'Not Identify', Message: "Some error occurred while Follow The Cube!"}); 
                }
            }
        });
    }
};



// ---------------------------------------------------------------------- User Created Cubes List ----------------------------------------------------------
exports.User_Created_Cubes = function(req, res) {
    CubeModel.CubesSchema.find({'User_Id': req.params.User_Id, 'Active_Status': 'Active' }, function(err, result) {
        if(err) {
            ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
            res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
        } else {
            var Return_Cubes = [];
            const GetCubeInfo = (result) => Promise.all(  // Main Promise For Cube List Get --------------
                    result.map(info => CubeFilter(info)) 
                ).then( result_1 => {  
                    res.status(200).send({ Status:"True", Output: "True", Response: Return_Cubes });
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
                        if (Data[2] === null) {
                            info.Category_Name = Data[0].Name;
                            info.Members_Count = Data[1];
                            Return_Cubes.push(info);
                        }
                        return Data[2];
                    }).catch(error => {
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, ' User Followed Cubes List Find Cube Related Info Sub Promise Error', 'Cubes.controller.js - 237', error);
                    });

            GetCubeInfo(result); // Main Promise Call Function Cube --------------
        }
    });
};



// ---------------------------------------------------------------------- User Un Followed Cubes List ----------------------------------------------------------
exports.User_UnFollowed_Cubes = function(req, res) {
    if(!req.params.User_Id || req.params.User_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "User Id can not be empty" });
    }else{
        CubeModel.CubesSchema.find({'Active_Status':'Active'}, {User_Id: 1, Category_Id: 1, Name: 1, Image:1, Security:1, Security_Code: 1 },  {sort: { updatedAt: -1 }}, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {
                var Return_Cubes = [];
                const GetCubeInfo = (result) => Promise.all(  // Main Promise For Cube List Get --------------
                        result.map(info => CubeFilter(info)) 
                    ).then( result_1 => {  
                        res.status(200).send({ Status:"True", Output: "True", Response: Return_Cubes });
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
                            if (Data[2] === null) {
                                info.Category_Name = Data[0].Name;
                                info.Members_Count = Data[1];
                                Return_Cubes.push(info);
                            }
                            return Data[2];
                        }).catch(error => {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, ' User Followed Cubes List Find Cube Related Info Sub Promise Error', 'Cubes.controller.js - 237', error);
                        });

                GetCubeInfo(result); // Main Promise Call Function Cube --------------
            }
        });
    }
};


// ---------------------------------------------------------------------- User Un Followed Cubes List ----------------------------------------------------------
exports.Cube_Members = function(req, res) {
    if(!req.params.Cube_Id || req.params.Cube_Id === '') {
        res.status(200).send({Status:"True", Output:"False", Message: "Cube Id can not be empty" });
    }else{
        CubeModel.Cube_Followersschema.find({'Cube_Id': req.params.Cube_Id, 'Active_Status': 'Active' }, function(err, result) {
            if(err) {
                ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'User Followed Cube List Find Query Error', 'Cubes.controller.js - 12', err);
                res.status(500).send({status:"False", Error:err, message: "Some error occurred while Find The  User Followed Cube List."});
            } else {

                const GetUserInfo = (result) => Promise.all(  // Main Promise For Cube List Get --------------
                        result.map(info => userInfo(info)) 
                    ).then( result_1 => {  
                        res.status(200).send({ Status:"True", Output: "True", Response: result_1 });
                    }).catch( err_1 => { 
                        ErrorManagement.ErrorHandling.ErrorLogCreation(req, ' User Followed Cubes List Find Main Promise Error', 'Cubes.controller.js - 226', err_1);
                        res.status(500).send({Status:"False", Error:err_1, Message: "Some error occurred while Find the Cube List Promise Error "});
                    });

                const userInfo = info => // Sub Promise For Cube Related Info Find --------------
                    Promise.all([ 
                        UserModel.UserSchema.findOne({'_id' : info.User_Id }, {Inscube_Name: 1, Image: 1 } ).exec(),
                        ]).then( Data => {
                            return Data[0];
                        }).catch(error => {
                            ErrorManagement.ErrorHandling.ErrorLogCreation(req, ' User Followed Cubes List Find Cube Related Info Sub Promise Error', 'Cubes.controller.js - 237', error);
                        });

                GetUserInfo(result); // Main Promise Call Function Cube --------------
            }
        });
    }
};