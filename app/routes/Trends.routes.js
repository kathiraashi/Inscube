module.exports = function(app) {

    var Controller = require('../controller/Trends.controller.js');

        app.post('/API/Trends/Cube_Trends_Submit', Controller.CubeTrends_Submit);

        app.get('/API/Trends/Cube_Trends_List/:User_Id/:Skip_Count', Controller.CubeTrends_List);

        app.get('/API/Trends/Cube_Trends_View/:User_Id/:Trends_Id', Controller.CubeTrends_View);

        app.post('/API/Trends/Cube_Trends_Update', Controller.CubeTrends_Update);

        app.get('/API/Trends/Cube_Trends_Delete/:Trends_Id', Controller.CubeTrends_Delete);

        app.post('/API/Trends/Cube_Trends_Filter', Controller.CubeTrends_Filter);

        app.post('/API/Trends/Report_Trends_Check', Controller.Report_Trends_Check);

        app.post('/API/Trends/Report_Trends', Controller.Report_Trends_Submit);

        app.get('/API/Trends/Cube_Based_Trends_List/:Cube_Id/:User_Id', Controller.Cube_Based_Trends_List);

        app.post('/API/Trends/Trends_Emote_Submit', Controller.Trends_Emote_Submit);

        app.post('/API/Trends/Trends_Comment_Submit', Controller.Trends_Comment_Submit);

        app.get('/API/Trends/Trends_Comment_List/:Trends_Id', Controller.Trends_Comment_List);

        app.post('/API/Trends/Trends_Comment_Update', Controller.Trends_Comment_Update);

        app.get('/API/Trends/Trends_Comment_Delete/:Trends_Comment_Id', Controller.Trends_Comment_Delete);

        app.post('/API/Trends/Report_TrendsComment_Check', Controller.Report_TrendsComment_Check);

        app.post('/API/Trends/Report_TrendsComment', Controller.Report_TrendsComment_Submit);

        app.get('/API/Trends/User_Trends/:User_Id', Controller.User_Trends);

        app.post('/API/Trends/Cube_Trends_Share', Controller.Cube_Trends_Share);
        

};