module.exports = function(app) {

    var Controller = require('../controller/Posts.controller.js');

        app.post('/API/Posts/Test_Push', Controller.Test_Push);

        app.post('/API/Posts/Cube_Post_Submit', Controller.CubePost_Submit);

        app.get('/API/Posts/Cube_Post_List/:User_Id/:Skip_Count', Controller.CubePost_List);

        app.get('/API/Posts/Cube_Post_AllList/:User_Id', Controller.CubePost_All_List);

        app.get('/API/Posts/Cube_Post_View/:User_Id/:Post_Id', Controller.CubePost_View);

        app.post('/API/Posts/Cube_Post_Update', Controller.CubePost_Update);

        app.get('/API/Posts/Cube_Post_Delete/:Post_Id', Controller.CubePost_Delete);

        app.post('/API/Posts/Report_Post_Check', Controller.Report_PostSubmit_Check);

        app.post('/API/Posts/Report_Post', Controller.Report_PostSubmit);

        app.post('/API/Posts/Emote_Submit', Controller.Emote_Submit);

        app.post('/API/Posts/Emote_Update', Controller.Emote_Update);

        app.post('/API/Posts/Comment_Submit', Controller.Comment_Submit);

        app.get('/API/Posts/Comment_List/:Post_Id', Controller.Comment_List);

        app.post('/API/Posts/Comment_Update', Controller.Comment_Update);

        app.get('/API/Posts/Comment_Delete/:Comment_Id', Controller.Comment_Delete);

        app.post('/API/Posts/Report_Comment_Check', Controller.Report_CommentSubmit_Check);

        app.post('/API/Posts/Report_Comment', Controller.Report_CommentSubmit);

        app.post('/API/Posts/Report_User_Check', Controller.Report_UserSubmit_Check);

        app.post('/API/Posts/Report_User', Controller.Report_UserSubmit);

        app.get('/API/Posts/Cube_Based_Post_List/:Cube_Id/:User_Id', Controller.Cube_Based_Post_List);

        app.get('/API/Posts/User_Posts/:User_Id', Controller.User_Posts);

        app.get('/API/Posts/Get_Notifications/:User_Id', Controller.Get_Notifications);

        app.post('/API/Posts/Notifications_recived', Controller.Notifications_recived);

        app.get('/API/Posts/Notifications_Viewed/:Notify_Id', Controller.Notifications_Viewed);

        app.get('/API/Posts/Search_Users/:Search_text', Controller.Search_Users);

        app.get('/API/Posts/Search_Cubes/:User_Id/:Search_text', Controller.Search_Cubes);

        app.get('/API/Posts/Search_Posts/:User_Id/:Search_text', Controller.Search_Posts);

        app.post('/API/Posts/Cube_Post_Share', Controller.Cube_Post_Share);
        
};