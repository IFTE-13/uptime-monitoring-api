const data = require('../../lib/data');
const { parseJSON, randString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environment');

const handler = {};

handler.checkHandler = (reqProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(reqProperties.method) > -1) {
        handler._check[reqProperties.method](reqProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (reqProperties, callback) => {
    const protocol = typeof reqProperties.body.protocol === 'string' && ['http', 'https'].indexOf(reqProperties.body.protocol) > -1
        ? reqProperties.body.protocol
        : false;

    const url =
        typeof reqProperties.body.url === 'string' && reqProperties.body.url.trim().length > 0
            ? reqProperties.body.url
            : false;

    const method = typeof reqProperties.body.method === 
    'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(reqProperties.body.method) > -1
        ? reqProperties.body.method
        : false;

    const successCode = typeof reqProperties.body.successCode === 'object' &&
    reqProperties.body.successCode instanceof Array ? reqProperties.body.successCode : false;

    const timeOut = typeof reqProperties.body.timeOut === 'number' &&
    reqProperties.body.timeOut % 1 === 0
    && reqProperties.body.timeOut >= 1
    && reqProperties.body.timeOut <= 5
        ? reqProperties.body.timeOut
        : false;

    if (protocol && url && method && successCode && timeOut) {
        const token = 
            typeof reqProperties.headersObject.token === 'string'
                ? reqProperties.headersObject.token
                : false;
        data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = parseJSON(tokenData).phone;
                data.read('users', userPhone, (error, userData) => {
                    if (!error && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = parseJSON(userData);
                                const userChecks = typeof userObject.checks === 'object' &&
                                userObject.checks instanceof Array 
                                && userObject.checks
                                    ? userObject.checks
                                    : [];

                                if (userChecks.length < maxChecks) {
                                    const checkId = randString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeOut,
                                    };
                                    data.create('checks', checkId, checkObject, (err1) => {
                                        if (!err1) {
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            data.update('users', userPhone, userObject, (err) => {
                                                if (!err) {
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'sever problem',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'sever problem',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'user has already maxed check limit',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication failed',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'user not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication problem',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._check.get = (reqProperties, callback) => {
    const id =
        typeof reqProperties.qureyStringObject.id === 'string'
        && reqProperties.qureyStringObject.id.trim().length === 20
            ? reqProperties.qureyStringObject.id
            : false;

    if(id){
        data.read('checks', id, (err, checkData) => {
            if(!err && checkData){
                const token = 
                typeof reqProperties.headersObject.token === 'string'
                ? reqProperties.headersObject.token
                : false;

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callback(200, parseJSON(checkData))
                    }else{
                        callback(403, {
                            error: 'authentication failur'
                        })
                    }
                });
            }else{
                callback(500, {
                    error: 'you have a request problem'
                })
            }
        })
    }else{
        callback(400, {
            error: 'you have a request problem'
        })
    }
};

handler._check.put = (reqProperties, callback) => {
    const id = typeof reqProperties.body.id === 'string' && reqProperties.body.id.trim().length === 20
        ? reqProperties.body.id
        : false;

        const protocol = typeof reqProperties.body.protocol === 'string' && ['http', 'https'].indexOf(reqProperties.body.protocol) > -1
        ? reqProperties.body.protocol
        : false;

    const url =
        typeof reqProperties.body.url === 'string' && reqProperties.body.url.trim().length > 0
            ? reqProperties.body.url
            : false;

    const method = typeof reqProperties.body.method === 
    'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(reqProperties.body.method) > -1
        ? reqProperties.body.method
        : false;

    const successCode = typeof reqProperties.body.successCode === 'object' &&
    reqProperties.body.successCode instanceof Array ? reqProperties.body.successCode : false;

    const timeOut = typeof reqProperties.body.timeOut === 'number' &&
    reqProperties.body.timeOut % 1 === 0
    && reqProperties.body.timeOut >= 1
    && reqProperties.body.timeOut <= 5
        ? reqProperties.body.timeOut
        : false;

    if(id){
        if(protocol || url || method || successCode || timeOut){
            data.read('checks', id, (err, checkData) => {
                if(!err && checkData){
                    let checkObject = parseJSON(checkData);
                    const token = 
                        typeof reqProperties.headersObject.token === 'string'
                        ? reqProperties.headersObject.token
                        : false;

                        tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                if(protocol){
                                    checkObject.protocol = protocol;
                                }
                                if(url){
                                    checkObject.url = url;
                                }
                                if(method){
                                    checkObject.method = method;
                                }
                                if(successCode){
                                    checkObject.successCode = successCode;
                                }
                                if(timeOut){
                                    checkObject.timeOut = timeOut;
                                }

                                data.update('checks', id, checkObject, (error) => {
                                    if(!error){
                                        callback(200);
                                    }else{
                                        callback(500, {
                                            error: 'there was a server error'
                                        })
                                    }
                                })
                            }else{
                                callback(403, {
                                    error: 'unauthorized'
                                })
                            }
                        })
                }else{
                    callback(500, {
                        error: 'server problem occured'
                    })
                }
            })
        }
        else{
            callback(400, {
                error: 'please provide atlest one field to update'
            })
        }
    }else{
        callback(400, {
            error: 'you have a request problem'
        })
    }
};

handler._check.delete = (reqProperties, callback) => {
    const id =
        typeof reqProperties.qureyStringObject.id === 'string'
        && reqProperties.qureyStringObject.id.trim().length === 20
            ? reqProperties.qureyStringObject.id
            : false;

    if(id){
        data.read('checks', id, (err, checkData) => {
            if(!err && checkData){
                const token = 
                typeof reqProperties.headersObject.token === 'string'
                ? reqProperties.headersObject.token
                : false;

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        data.delete('checks', id, (err) => {
                            if(!err){
                                data.read('users', parseJSON(checkData).userPhone, (error, userData)=> {
                                    let userObject = parseJSON(userData);
                                    if(!error && userData){
                                        let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                        let checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition, 1);
                                            userObject.checks = userChecks;
                                            data.update('users', userObject.phone, userObject, (err) => {
                                                if(!err){
                                                    callback(200);
                                                }else{
                                                    callback(500, {
                                                        error: 'server error'
                                                    })
                                                }
                                            })
                                        }else{
                                            callback(500, {
                                                error: 'The check id not found '
                                            })
                                        }
                                    }else{
                                        callback(500, {
                                            error: 'server error'
                                        })
                                    }
                                })
                            }else{
                                callback(500, {
                                    error: 'server error'
                                })
                            }
                        })
                    }else{
                        callback(403, {
                            error: 'authentication failur'
                        })
                    }
                });
            }else{
                callback(500, {
                    error: 'you have a request problem'
                })
            }
        })
    }else{
        callback(400, {
            error: 'you have a request problem'
        })
    }
};

module.exports = handler;
