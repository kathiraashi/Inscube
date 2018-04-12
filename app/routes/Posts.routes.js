module.exports = function(app) {

    var Controller = require('../controller/Posts.controller.js');

        app.post('/API/Posts/Cube_Post_Submit', Controller.CubePost_Submit);

        app.get('/API/Posts/Cube_Post_List/:User_Id', Controller.CubePost_List);

        app.get('/API/Posts/Cube_Post_View/:User_Id/:Post_Id', Controller.CubePost_View);

        app.post('/API/Posts/Cube_Post_Update', Controller.CubePost_Update);

        app.get('/API/Posts/Cube_Post_Delete/:Post_Id', Controller.CubePost_Delete);

        app.post('/API/Posts/Report_Post_Check', Controller.Report_PostSubmit_Check);

        app.post('/API/Posts/Report_Post', Controller.Report_PostSubmit);

        app.post('/API/Posts/Emote_Submit', Controller.Emote_Submit);

        app.post('/API/Posts/Comment_Submit', Controller.Comment_Submit);

        app.get('/API/Posts/Comment_List/:Post_Id', Controller.Comment_List);

        app.post('/API/Posts/Comment_Update', Controller.Comment_Update);

        app.get('/API/Posts/Comment_Delete/:Comment_Id', Controller.Comment_Delete);

        app.post('/API/Posts/Report_Comment_Check', Controller.Report_CommentSubmit_Check);

        app.post('/API/Posts/Report_Comment', Controller.Report_CommentSubmit);

        app.post('/API/Posts/Report_User_Check', Controller.Report_UserSubmit_Check);

        app.post('/API/Posts/Report_User', Controller.Report_UserSubmit);


};