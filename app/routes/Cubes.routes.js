module.exports = function(app) {

    var Controller = require('../controller/Cubes.controller.js');

        app.get('/API/Cubes/Category_List', Controller.CategoryList);

        app.get('/API/Cubes/Category_Info/:Category_Id', Controller.CategoryInfo);
        
        app.post('/API/Cubes/Cube_Creation', Controller.CreateCube);

        app.post('/API/Cubes/Update_Cube', Controller.Update_Cube);

        app.post('/API/Cubes/Delete_Cube', Controller.Delete_Cube);

        app.post('/API/Cubes/Add_Cube_Topic', Controller.AddCubeTopic);

        app.get('/API/Cubes/Cube_List/:Category_Id/:User_Id', Controller.CubesList);

        app.get('/API/Cubes/View_Cube/:Cube_Id/:User_Id', Controller.CubeView);

        app.post('/API/Cubes/Follow_Cube', Controller.Follow_Cube);

        app.post('/API/Cubes/UnFollow_Cube', Controller.UnFollow_Cube);

        app.get('/API/Cubes/User_Followed_Cubes/:User_Id', Controller.User_Followed_Cubes);

        app.get('/API/Cubes/User_Cubes/:User_Id', Controller.User_Created_Cubes);

        app.get('/API/Cubes/User_UnFollowed_Cubes/:User_Id', Controller.User_UnFollowed_Cubes);

        app.get('/API/Cubes/Cube_Members/:Cube_Id', Controller.Cube_Members);

        app.get('/API/Cubes/Check_Invite_CubeId/:Cube_Id', Controller.Check_Invite_CubeId);

        app.post('/API/Cubes/Email_Invite_Cube', Controller.Email_Invite_Cube);
};