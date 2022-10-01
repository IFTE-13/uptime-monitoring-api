const handler = {};

handler.samplHandlers = (reqProperties, callback) => {
    callback(200, {
        massage: 'This is s sample url',
    });
};

module.exports = handler;
