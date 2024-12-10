require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('./routes');
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

    try {
        const model = await loadModel();
        server.app.model = model;

        server.route(routes);

        server.ext('onPreResponse', (request, h) => {
            const response = request.response;
        
            if (response.isBoom) {
                const { output } = response;
        
                // Periksa jika error adalah "Payload Too Large" (413)
                if (output.statusCode === 413) {
                    return h.response({
                        status: 'fail',
                        message: 'Payload content length greater than maximum allowed: 1000000',
                    }).code(413);
                }
        
                // Respon default untuk error lainnya
                return h.response({
                    status: 'fail',
                    message: response.message,
                }).code(output.statusCode);
            }
        
            return h.continue;
        });
        

        await server.start();
        console.log(`Server running on ${server.info.uri}`);
    } catch (error) {
        console.error('Error starting server:', error);
    }
})();
