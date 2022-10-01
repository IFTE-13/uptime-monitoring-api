// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environmet = require('../helpers/environment');

// app obj - module scaffolding
const server = {};


// create server
server.createServer = () => {
    const createServerVar = http.createServer(server.handleReqRes);
    createServerVar.listen(environmet.port, () => {
        console.log(`Listing to port ${environmet.port}`);
    });
};

// handle request response
server.handleReqRes = handleReqRes;

// start server
server.init = () => {
    server.createServer();
};

module.exports = server;
