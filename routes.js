const { samplHandlers } = require('./handlers/routeHandlers/sapmleHandlers');
const { userHandler } = require('./handlers/routeHandlers/userHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');
const { checkHandler } = require('./handlers/routeHandlers/checkHandler');

const routes = {
    sample: samplHandlers,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

module.exports = routes;
