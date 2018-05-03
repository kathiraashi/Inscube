module.exports = function(app) {

    var Controller = require('../controller/SignIn_SignUp.controller.js');

        app.get('/API/Signin_Signup/Inscube_Name_Validate/:Inscube_Name', Controller.InscubeNameValidate);
        app.get('/API/Signin_Signup/Email_Validate/:Email', Controller.UserEmailValidate);
        app.post('/API/Signin_Signup/Register', Controller.UserRegister);
        app.post('/API/Signin_Signup/Register_Completion', Controller.UserRegisterCompletion);
        app.post('/API/Signin_Signup/User_Validate', Controller.UserValidate);

        app.get('/API/Signin_Signup/User_Info/:User_Id', Controller.User_Info);
        app.post('/API/Signin_Signup/Privacy_Update', Controller.Privacy_Update);
        app.post('/API/Signin_Signup/Password_Change', Controller.Password_Change);

        app.get('/API/Signin_Signup/AndroidVersionSubmit/:Version', Controller.AndroidVersionSubmit);
        app.get('/API/Signin_Signup/AndroidVersionUpdate/:Version', Controller.AndroidVersionUpdate);
        app.get('/API/Signin_Signup/AndroidVersionGet/', Controller.AndroidVersionGet);

        app.get('/API/Signin_Signup/Send_Email_Password_Reset_Request/:Email', Controller.Send_Email_Password_Reset_Request);
        app.get('/API/Signin_Signup/password_reset_url_check/:User_Id/:Token', Controller.password_reset_url_check);
        app.get('/API/Signin_Signup/password_reset_submit/:New_Password/:User_Id', Controller.password_reset_submit);

        app.get('/API/Signin_Signup/Send_Email_Password_Reset_OTP/:Email', Controller.Send_Email_Password_Reset_OTP);
        app.get('/API/Signin_Signup/password_reset_OTP_check/:User_Id/:OTP', Controller.password_reset_OTP_check);

};