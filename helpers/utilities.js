const crypto = require('crypto');
const environmentToExport = require('./environment');

const utilities = {};
// parse JSON string to Object
utilities.parseJSON = (jsonString) => {
    let outPut;

    try {
        outPut = JSON.parse(jsonString);
    } catch {
        outPut = {};
    }
    return outPut;
};

utilities.hash = (string) => {
    if (typeof string === 'string' && string.length > 0) {
        const hash = crypto
            .createHmac('sha256', environmentToExport.secretKey)
            .update(string)
            .digest('hex');
        return hash;
    }
    return false;
};

utilities.randString = (string) => {
    let length = string;
    length = typeof string === 'number' && string > 0 ? string : false;
    if (length) {
        const possibleChar = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for (let i = 1; i <= length; i += 1) {
            const random = possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
            output += random;
        }
        return output;
    }
    return false;
};
module.exports = utilities;
