const environment = {};
// configuration
environment.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'helloThere',
    maxChecks: 5,
    twilio: {
        fromPhone: '+14155552345',
        accountSid: 'ACB32d411ad7fe886aac54c665d25e5c5d',
        authToken: ' 9455e33eb3109edc12e3d8c92768f7a67'
    }
};

environment.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'helloThereBunny',
    maxChecks: 5,
    twilio: {
        fromPhone: '+14155552345',
        accountSid: 'ACB32d411ad7fe886aac54c665d25e5c5d',
        authToken: ' 9455e33eb3109edc12e3d8c92768f7a67'
    }
};

const currentEnvironment =    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

const environmentToExport =    typeof environment[currentEnvironment] === 'object'
        ? environment[currentEnvironment]
        : environment.staging;

module.exports = environmentToExport;
