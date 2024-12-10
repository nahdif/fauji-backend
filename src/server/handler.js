const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
    const { image } = request.payload;
    const { model } = request.server.app;
    const MAX_FILE_SIZE = 1000000; // 1MB

    // Validasi ukuran file
    if (image.bytes > MAX_FILE_SIZE) {
        return h.response({
            status: 'fail',
            message: `Payload content length greater than maximum allowed: ${MAX_FILE_SIZE}`,
        }).code(413); // Status code 413 (Payload Too Large)
    }

    try {
        // Proses prediksi
        const { confidenceScore, label, suggestion } = await predictClassification(model, image);
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            id,
            result: label,
            suggestion,
            createdAt,
        };

        // Simpan data ke Firestore
        try {
            await storeData(id, data);
        } catch (storeError) {
            console.error('Failed to store predictions data:', storeError);
        }

        await storeData(id, data);


        // Respon sukses
        return h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data,
        }).code(201); // Status code 201 (Created)
    } catch (error) {
        console.error('Error in postPredictHandler:', error);
        return h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi',
        }).code(400); // Status code 400 (Bad Request)
    }
}

module.exports = { postPredictHandler };
