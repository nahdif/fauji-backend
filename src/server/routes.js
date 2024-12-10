const { postPredictHandler } = require('./handler');

const routes = [
    {
        path: '/predict',
        method: 'POST',
        handler: postPredictHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000, // 1MB in decimal (1000000 bytes)
            },
        },
    },
];

module.exports = routes;
