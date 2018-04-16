module.exports = function(app) {

    var Controller = require('../controller/Cubes.controller.js');

        app.get('/API/Cubes/Category_List', Controller.CategoryList);

        app.get('/API/Cubes/Category_Info/:Category_Id', Controller.CategoryInfo);
        
        app.post('/API/Cubes/Cube_Creation', Controller.CreateCube);

        app.post('/API/Cubes/Add_Cube_Topic', Controller.AddCubeTopic);

        app.get('/API/Cubes/Cube_List/:Category_Id/:User_Id', Controller.CubesList);

        app.get('/API/Cubes/View_Cube/:Cube_Id/:User_Id', Controller.CubeView);

        app.post('/API/Cubes/Follow_Cube', Controller.Follow_Cube);

        app.get('/API/Cubes/User_Followed_Cubes/:User_Id', Controller.User_Followed_Cubes);

        app.get('/API/Cubes/User_Cubes/:User_Id', Controller.User_Created_Cubes);

        app.get('/API/Cubes/User_UnFollowed_Cubes/:User_Id', Controller.User_UnFollowed_Cubes);
};