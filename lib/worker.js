// dependencies
const { parseJSON } = require('../helpers/utilities');
const data = require('./data');
const url = require('url');
const http = require('http');
const https = require('https');
const { sendTwilioSms } = require('../helpers/notification');

// app obj - module scaffolding
const worker = {};

worker.gatherAllChecks = () => {
    data.list('checks', (err, checks) => {
        if(!err && checks && checks.length > 0){
            checks.forEach(check => {
                data.read('checks', check, (err, mainData) => {
                    if(!err && mainData){
                        worker.validateCheckData(parseJSON(mainData));
                    }else{
                        console.log('Error: during reading check data');
                    }
                });
            });
        }else{
            console.log('Error: Could not find any checks to process');
        }
    });
};

worker.validateCheckData = (mainData) => {
    let mainDatas = mainData;
    if(mainData && mainData.id){
        mainData.state = typeof(mainData.state) === 'string' && ['up', 'down'].indexOf(mainData.state) > -1 ? mainData.stae : 'down';

        mainData.lastChecked = typeof(mainData.lastChecked) === 'number' && mainData.lastChecked > 0 ? mainData.lastChecked : false;

        worker.performCheck(mainDatas);
    }else{
        console.log('Error: Check was not properly formated')
    }
}

worker.performCheck = (mainData) => {
    let checkOutCome = {
        'error': false,
        'responseCode': false,
    };
    let outComeSent = false;
    let parsedUrl = url.parse(mainData.protocol + '://' + mainData.url, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;


    //construct request

    const requestDetails = {
        'protocol': mainData.protocol + ':',
        'hostName': hostName,
        'method': mainData.method.toUpperCase(),
        'path': path,
        'timeOut': mainData.timeOut * 1000,
    };

    const protocolToUse = mainData.protocol === 'http' ? http : https;

    let req = protocolToUse.request(requestDetails, (res) => {
        const status = res.statusCode;
        checkOutCome.responseCode = status;
        if(!outComeSent){
            worker.processCheckOutCome(mainData, checkOutCome);
            outComeSent = true;
        }
    });

    req.on('error', (e) => {
        let checkOutCome = {
            'error': true,
            'value': e,
        };
        if(!outComeSent){
            worker.processCheckOutCome(mainData, checkOutCome);
            outComeSent = true;
        }
    })

    req.on('timeOut', () => {
        let checkOutCome = {
            'error': true,
            'value': 'timeOut',
        };
        if(!outComeSent){
            worker.processCheckOutCome(mainData, checkOutCome);
            outComeSent = true;
        }
    })

    req.end();
};

worker.processCheckOutCome = (mainData, checkOutCome) => {
    let state = !checkOutCome.error && checkOutCome.responseCode && mainData.successCode.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';
 
    let alertWanted = mainData.lastChecked && mainData.state !== state ? true : false;

    let newCheckData = mainData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if(!err){
            if(alertWanted){

                worker.alertUserToStatusChange(newCheckData);
            }
            else{
                console.log('No state changed');
            }
        }else{
            console.log('Error while saving the check');
        }
    })
};

worker.alertUserToStatusChange = (newCheckData) => {
    let msg = `Alert: your check for ${newCheckData.method.toUpperCase()}${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if(!err){
            console.log('User alert');
        }else{
            console.log('Problem occured');
        }
    })

}

worker.loop = () =>{
    setInterval(() => {
        worker.gatherAllChecks();
    }, 8000)
}

// start worker
worker.init = () => {
    worker.gatherAllChecks();

    worker.loop();
};

module.exports = worker;
