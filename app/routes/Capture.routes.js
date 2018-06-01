module.exports = function(app) {

    var Controller = require('../controller/Capture.controller.js');

        app.post('/API/Capture/Cube_Capture_Submit', Controller.CubeCapture_Submit);

        app.get('/API/Capture/Cube_Capture_List/:User_Id/:Skip_Count', Controller.CubeCapture_List);

        app.get('/API/Capture/Cube_Capture_View/:User_Id/:Capture_Id', Controller.CubeCapture_View);

        app.post('/API/Capture/Cube_Capture_Update', Controller.CubeCapture_Update);

        app.get('/API/Capture/Cube_Capture_Delete/:Capture_Id', Controller.CubeCapture_Delete);

        app.post('/API/Capture/Report_Capture_Check', Controller.Report_Capture_Check);

        app.post('/API/Capture/Report_Capture', Controller.Report_Capture_Submit);

        // app.post('/API/Capture/Capture_Emote_Submit', Controller.Capture_Emote_Submit);

        // app.post('/API/Capture/Capture_Emote_Update', Controller.Capture_Emote_Update);

        // app.post('/API/Capture/Capture_Comment_Submit', Controller.Capture_Comment_Submit);

        // app.get('/API/Capture/Capture_Comment_List/:Capture_Id', Controller.Capture_Comment_List);

        // app.post('/API/Capture/Capture_Comment_Update', Controller.Capture_Comment_Update);

        // app.get('/API/Capture/Capture_Comment_Delete/:Capture_Comment_Id', Controller.Capture_Comment_Delete);

        // app.post('/API/Capture/Report_CaptureComment_Check', Controller.Report_CaptureComment_Check);

        // app.post('/API/Capture/Report_CaptureComment', Controller.Report_CaptureComment_Submit);

        // app.get('/API/Capture/Cube_Based_Capture_List/:Cube_Id/:User_Id', Controller.Cube_Based_Capture_List);

        // app.get('/API/Capture/User_Captures/:User_Id', Controller.User_Captures);

        // app.get('/API/Capture/Search_Captures/:User_Id/:Search_text', Controller.Search_Captures);

        // app.post('/API/Capture/Cube_Capture_Share', Controller.Cube_Capture_Share);
        

};