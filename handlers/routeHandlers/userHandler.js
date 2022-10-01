const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

const handler = {};

handler.userHandler = (reqProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(reqProperties.method) > -1) {
        handler._user[reqProperties.method](reqProperties, callback);
    } else {
        callback(405);
    }
};

handler._user = {};

handler._user.post = (reqProperties, callback) => {
    // post => for uplodaing
    const firstName =        typeof reqProperties.body.firstName === 'string' &&
        reqProperties.body.firstName.trim().length > 0
            ? reqProperties.body.firstName
            : false;

    const lastName =        typeof reqProperties.body.lastName === 'string' &&
        reqProperties.body.lastName.trim().length > 0
            ? reqProperties.body.lastName
            : false;

    const phone =        typeof reqProperties.body.phone === 'string' &&
        reqProperties.body.phone.trim().length === 11
            ? reqProperties.body.phone
            : false;

    const password =        typeof reqProperties.body.password === 'string' &&
        reqProperties.body.password.trim().length > 0
            ? reqProperties.body.password
            : false;

    const tosArg =        typeof reqProperties.body.tosArg === 'boolean' && reqProperties.body.tosArg
            ? reqProperties.body.tosArg
            : false;

    if (firstName && lastName && phone && password && tosArg) {
        // first check user exist or not
        data.read('users', phone, (error) => {
            if (error) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosArg,
                };
                // store the user into database
                data.create('users', phone, userObject, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'user created successfully',
                        });
                    } else {
                        callback(500, {
                            error: 'Could not able to create user',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'User already exist',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._user.get = (reqProperties, callback) => {
    // check the phone no valid or not
    const phone =        typeof reqProperties.qureyStringObject.phone === 'string' &&
        reqProperties.qureyStringObject.phone.trim().length === 11
            ? reqProperties.qureyStringObject.phone
            : false;

    if (phone) {
        const token =
            typeof reqProperties.headersObject.token === 'string'
                ? reqProperties.headersObject.token
                : false;
        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                data.read('users', phone, (err, user) => {
                    const u = { ...parseJSON(user) };
                    if (!err && u) {
                        delete u.password;
                        callback(200, u);
                    } else {
                        callback(404, {
                            error: 'User not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failed',
                });
            }
        });
    } else {
        callback(404, {
            error: 'User not found',
        });
    }
};

handler._user.put = (reqProperties, callback) => {
    const firstName = typeof reqProperties.body.firstName === 'string';
    reqProperties.body.firstName.trim().length > 0 ? reqProperties.body.firstName : false;

    const lastName = typeof reqProperties.body.lastName === 'string';
    reqProperties.body.lastName.trim().length > 0 ? reqProperties.body.lastName : false;

    const phone = typeof reqProperties.body.phone === 'string';
    reqProperties.body.phone.trim().length === 11 ? reqProperties.body.phone : false;

    const password = typeof reqProperties.body.password === 'string';
    reqProperties.body.password.trim().length > 0 ? reqProperties.body.password : false;

    if (phone) {
        if (firstName || lastName || password) {
            const token =
                typeof requestProperties.headersObject.token === 'string'
                    ? requestProperties.headersObject.token
                    : false;
            tokenHandler._token.verify(token, phone, (tokenId) => {
                if (tokenId) {
                    data.read('users', phone, (error, uData) => {
                        const userData = { ...parseJSON(uData) };
                        if (!error && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }
                            // update database
                            data.update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200, {
                                        message: 'user updated successfully',
                                    });
                                } else {
                                    callback(500, {
                                        error: 'request not completed',
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'invalid phone no',
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: 'Authentication failure!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'invalid requrest',
            });
        }
    } else {
        callback(400, {
            error: 'invalid phone no',
        });
    }
};

handler._user.delete = (reqProperties, callback) => {
    const phone = typeof reqProperties.qureyStringObject.phone === 'string';
    reqProperties.qureyStringObject.phone.trim().length === 11
        ? reqProperties.qureyStringObject.phone
        : false;

    if (phone) {
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;
        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                data.read('users', phone, (err, udata) => {
                    if (!err && udata) {
                        data.delete('users', phone, (error) => {
                            if (!error) {
                                callback(200, {
                                    message: 'user deleted',
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
                callback(403, {
                    error: 'Authentication failure!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There is a problem with your request',
        });
    }
};

module.exports = handler;
