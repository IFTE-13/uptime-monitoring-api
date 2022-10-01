const handler = {};

handler.notFoundHandlers = (reqProperties, callback) => {
    callback(404, {
        massage: 'URL not found',
    });
};

module.exports = handler;
