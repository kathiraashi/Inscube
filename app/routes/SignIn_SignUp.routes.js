module.exports = function(app) {

    var Controller = require('../controller/SignIn_SignUp.controller.js');

        app.get('/API/Signin_Signup/Inscube_Name_Validate/:Inscube_Name', Controller.InscubeNameValidate);
        app.get('/API/Signin_Signup/Email_Validate/:Email', Controller.UserEmailValidate);
        app.post('/API/Signin_Signup/Register', Controller.UserRegister);
        app.post('/API/Signin_Signup/Register_Completion', Controller.UserRegisterCompletion);
        app.post('/API/Signin_Signup/User_Validate', Controller.UserValidate);

};