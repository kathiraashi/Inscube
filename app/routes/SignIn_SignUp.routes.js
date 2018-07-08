module.exports = function(app) {

    var Controller = require('../controller/SignIn_SignUp.controller.js');

        app.get('/API/Signin_Signup/Inscube_Name_Validate/:Inscube_Name', Controller.InscubeNameValidate);
        app.get('/API/Signin_Signup/Email_Validate/:Email', Controller.UserEmailValidate);
        app.post('/API/Signin_Signup/Register', Controller.UserRegister);
        app.post('/API/Signin_Signup/Register_Completion', Controller.UserRegisterCompletion);
        app.post('/API/Signin_Signup/User_Validate', Controller.UserValidate);
        app.post('/API/Signin_Signup/User_Delete', Controller.User_Delete);

        app.get('/API/Signin_Signup/Country_List', Controller.Country_List);
        app.get('/API/Signin_Signup/State_List/:Country_Id', Controller.State_List);
        app.get('/API/Signin_Signup/City_List/:State_Id', Controller.City_List);

        app.post('/API/Signin_Signup/User_App_Entry', Controller.User_App_Entry);

        app.get('/API/Signin_Signup/Privacy_Update_Check/:User_Id', Controller.Privacy_Update_Check);
        app.get('/API/Signin_Signup/Privacy_Update_Agree/:User_Id', Controller.Privacy_Update_Agree);

        app.get('/API/Signin_Signup/User_Info/:User_Id', Controller.User_Info);
        app.post('/API/Signin_Signup/Privacy_Update', Controller.Privacy_Update);
        app.post('/API/Signin_Signup/Password_Change', Controller.Password_Change);

        app.get('/API/Signin_Signup/AndroidVersionSubmit/:Version', Controller.AndroidVersionSubmit);
        app.get('/API/Signin_Signup/AndroidVersionUpdate/:Version', Controller.AndroidVersionUpdate);
        app.get('/API/Signin_Signup/AndroidVersionGet/', Controller.AndroidVersionGet);

        app.get('/API/Signin_Signup/Send_Email_Password_Reset_Request/:Email', Controller.Send_Email_Password_Reset_Request);
        app.get('/API/Signin_Signup/password_reset_url_check/:User_Id/:Token', Controller.password_reset_url_check);
        app.get('/API/Signin_Signup/password_reset_submit/:New_Password/:User_Id', Controller.password_reset_submit);

        
        app.get('/API/Signin_Signup/Password_reset_Email_Validate/:Email', Controller.Password_reset_Email_Validate);
        app.get('/API/Signin_Signup/Send_Email_Password_Reset_OTP/:Email', Controller.Send_Email_Password_Reset_OTP);
        app.get('/API/Signin_Signup/password_reset_OTP_check/:User_Id/:OTP', Controller.password_reset_OTP_check);

};