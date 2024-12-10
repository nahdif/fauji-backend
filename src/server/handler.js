const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');


async function postPredictHandler(request, h) {
    const { image } = request.payload;
    const { model } = request.server.app;

    try {
        const { confidenceScore, label, suggestion } = await predictClassification(model, image);
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            id,
            result: label,
            suggestion,
            createdAt,
        };

        const response = h.response({
            status: 'success',
            message: confidenceScore > 99
                ? 'Model is predicted successfully.'
                : 'Model is predicted successfully with lower confidence.',
            data,
        });

        await storeData(id, data);


        response.code(201);
        return response;
    } catch (error) {
        console.error('Error in postPredictHandler:', error);
        return h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam memproses gambar.',
        }).code(500);
    }
}

module.exports = { postPredictHandler };
