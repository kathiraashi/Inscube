module.exports = function(app) {

    var Controller = require('../controller/Cubes.controller.js');

        app.get('/API/Cubes/Category_List', Controller.CategoryList);
        
        app.post('/API/Cubes/Cube_Creation', Controller.CreateCube);

        app.post('/API/Cubes/Add_Cube_Topic', Controller.AddCubeTopic);

        app.get('/API/Cubes/Cube_List/:Category_Id', Controller.CubesList);

        app.get('/API/Cubes/View_Cube/:Cube_Id', Controller.CubeView);

        app.post('/API/Cubes/Follow_Cube', Controller.Follow_Cube);
};