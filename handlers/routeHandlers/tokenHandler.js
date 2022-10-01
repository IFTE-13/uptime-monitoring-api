const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { randString } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');

const handler = {};

handler.tokenHandler = (reqProperties, callback) => {
    const accepetedMethods = ['get', 'post', 'put', 'delete'];
    if (accepetedMethods.indexOf(reqProperties.method) > -1) {
        handler._token[reqProperties.method](reqProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (reqProperties, callback) => {
    // create token
    const phone =
        typeof reqProperties.body.phone === 'string'
        && reqProperties.body.phone.trim().length === 11
            ? reqProperties.body.phone
            : false;

    const password =
        typeof reqProperties.body.password === 'string'
        && reqProperties.body.password.trim().length > 0
            ? reqProperties.body.password
            : false;

    if (phone && password) {
        data.read('users', phone, (err, userData) => {
            const hashedPassword = hash(password);
            if (hashedPassword === parseJSON(userData).password) {
                const tokenId = randString(20);
                const expires = Date.now() + 60 * 60 * 1000;
                const tokenObject = {
                    phone,
                    id: tokenId,
                    expires,
                };

                // store the token
                data.create('tokens', tokenId, tokenObject, (error) => {
                    if (!error) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: 'You have a problem in server',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'pasword is not valid',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._token.get = (reqProperties, callback) => {
    const id =
        typeof reqProperties.qureyStringObject.id === 'string'
        && reqProperties.qureyStringObject.id.trim().length === 20
            ? reqProperties.qureyStringObject.id
            : false;

    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Token not found',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested token not found',
        });
    }
};

handler._token.put = (reqProperties, callback) => {
    const id =
        typeof reqProperties.body.id === 'string' && reqProperties.body.id.trim().length === 20
            ? reqProperties.body.id
            : false;

    const extend = !!(
        typeof reqProperties.body.extend === 'boolean' && reqProperties.body.extend === true
    );

    if (id && extend) {
        data.read('tokens', id, (err, tokenData) => {
            const tokenObject = parseJSON(tokenData);
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;
                data.update('tokens', id, tokenObject, (error) => {
                    if (!error) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: 'Server side error occoured',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Token expired',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in the request',
        });
    }
};

handler._token.delete = (reqProperties, callback) => {
    const id =
        typeof reqProperties.qureyStringObject.id === 'string'
        && reqProperties.qureyStringObject.id.trim().length === 20
            ? reqProperties.qureyStringObject.id
            : false;

    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                data.delete('tokens', id, (error) => {
                    if (!error) {
                        callback(200, {
                            message: 'token deleted',
                        });
                    } else {
                        callback(500, {
                            error: 'There is a problem from server end',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There is a problem from server end',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There is a problem with your request',
        });
    }
};

handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;
