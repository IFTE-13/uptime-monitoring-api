const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandlers } = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('./utilities');

const handler = {};

handler.handleReqRes = (req, res) => {
    const parse = url.parse(req.url, true);
    const path = parse.pathname;
    const trimPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const qureyStringObject = parse.query;
    const headersObject = req.headers;

    const reqProperties = {
        parse,
        path,
        trimPath,
        method,
        qureyStringObject,
        headersObject,
    };

    const decoder = new StringDecoder('utf-8');
    let data = '';

    const chooseHandler = routes[trimPath] ? routes[trimPath] : notFoundHandlers;

    req.on('data', (buffer) => {
        data += decoder.write(buffer);
    });
    req.on('end', () => {
        data += decoder.end();

        reqProperties.body = parseJSON(data);

        chooseHandler(reqProperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
};

module.exports = handler;
