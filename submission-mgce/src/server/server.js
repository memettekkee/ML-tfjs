const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
require('dotenv').config();
const loadModel = require('../services/loadModel');

(async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    const model = await loadModel();
    server.app.model = model;

    server.route(routes);  
    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();