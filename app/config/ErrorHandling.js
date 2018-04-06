var log4js = require('log4js');
var get_ip = require('ipware')().get_ip;
var parser = require('ua-parser-js');

var ErrorHandling = {
	ErrorLogCreation: function(req, Name, Address, ErrorMessage) {
            var fileName = new Date().toLocaleDateString();
            log4js.configure({  appenders: { Error: { type: 'file', filename: 'Logs/' + fileName + '.log'  } },
                                categories: { default: { appenders: ['Error'], level: 'error' } } });
            var logger = log4js.getLogger('Error');
            if(req !== ''){
                var getIp = get_ip(req);
                    getIp = getIp.clientIp;
                    getIp = getIp.split(':');
                var Ip = getIp[getIp.length - 1];
                var DeviceInfo = parser(req.headers['user-agent']);
                    logger.error(JSON.stringify({
                        Error_Name : Name,
                        Error_Address: Address,
                        Ip: Ip,
                        Device_Info: DeviceInfo,
                        Request_Body: req.body,
                    }));
            }else{
                logger.error(JSON.stringify({
                    Error_Name : Name,
                    Error_Address: Address,
                    Error_Message : ErrorMessage,
                }));
            }
	}
};
exports.ErrorHandling = ErrorHandling;