const https = require('https');
const {twilio} = require('./environment');
const querystring = require('querystring');

const notifications = {};

notifications.sendTwilioSms = (phone, msg, callback) => {
    const userPhone = typeof(phone) === 'string' && phone.trim().length > 11 ? phone.trim() : false;
    const message = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if(userPhone && msg){
        const payload = {
            From: twilio.fromPhone,
            TO: `+88${userPhone}`,
            Body: message,
        };

        const stringyfy = querystring.stringify(payload);
        const details = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }

        const req = https.request(details, (res) => {
            const status = res.statusCode;

            if (status === 200 || status === 201){
                callback(false);
            }else{
                callback(`status ${status}`);
            }
        });

        req.on('error', (e) => {
            callback(e);
        })

        req.write(stringyfy);
        req.end();
    }else{
        callback('Given parameters were invalid');
    }
}

module.exports = notifications;