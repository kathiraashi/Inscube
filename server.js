var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var ErrorManagement = require('./app/config/ErrorHandling.js');
var parser = require('ua-parser-js');

// const fs = require('fs');
// const http = require('http');
// const https = require('https');

var admin = require('firebase-admin');
var serviceAccount = require('./inscube_firebase_admin.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

var port = process.env.PORT || 4000;
var app = express();

// const privateKey = fs.readFileSync('/etc/letsencrypt/live/inscube.com/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/inscube.com/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/inscube.com/chain.pem', 'utf8');

// const credentials = {
// 	key: privateKey,
// 	cert: certificate,
// 	ca: ca
// };



// Process On Every Error
    process.on('unhandledRejection', (reason, promise) => {
        ErrorManagement.ErrorHandling.ErrorLogCreation('', '', '', reason);
        console.log(reason);
      console.error("'Un Handled Rejection' Error Log File - " + new Date().toLocaleDateString());
    });
    process.on('uncaughtException', function (err) {
        console.log(err);
        ErrorManagement.ErrorHandling.ErrorLogCreation('', '', '', err.toString());
        console.error(" 'Un Caught Exception' Error Log File - " + new Date().toLocaleDateString());
    });


// DB Connection
    mongoose.connect('mongodb://kathiravan:kathir143@ds241699.mlab.com:41699/inscube');
    //mongoose.connect('mongodb://kathiravan:kathir143@localhost/Inscube');
    mongoose.connection.on('error', function(err) {
        ErrorManagement.ErrorHandling.ErrorLogCreation('', 'Mongodb Connection Error', 'Server.js - 31', err);
    });
    mongoose.connection.once('open', function() {
        console.log('Inscube Database Successfully Connected');
    });


app.use(cors());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use('/API/Uploads', express.static('Uploads'));


// Require routes
    require('./app/routes/SignIn_SignUp.routes.js')(app);

    require('./app/routes/Cubes.routes.js')(app);

    require('./app/routes/Posts.routes.js')(app);

    require('./app/routes/Capture.routes.js')(app);

    require('./app/routes/Trends.routes.js')(app);

//     app.get('*', function(req, res, next){
//       var DeviceInfo = parser(req.headers['user-agent']);
//       if(DeviceInfo.os.name === 'Android') {
//           res.redirect(301, 'https://play.google.com/store/apps/details?id=com.test.aashi.inscubenewbuild' );
//       } else {
//           next();
//       }
//   });


// app.use(express.static(__dirname + '/view/dist/'));

// app.use(function(req, res) {
//      res.sendFile(path.join(__dirname, '/view/dist', 'index.html'));
// });

// http.createServer(function (req, res) {
//    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//    res.end();
// }).listen(80);

// const httpsServer = https.createServer(credentials, app);

// httpsServer.listen(443, () => {
// 	console.log('HTTPS Server running on port 443');
// });


app.use('*', function(req, res, next){
   res.send('This is Server Side Page');
});


var server = app.listen(port, function(){
  console.log('Listening on port ' + port);
});