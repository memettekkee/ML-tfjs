const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const { Firestore } = require('@google-cloud/firestore');

async function postPredictHandler(request, h) {
    const { image } = request.payload;
    const { model } = request.server.app;

    if (image && image._data && image._data.length > 1000000) { 
        const response = h.response({
            status: 'fail',
            message: 'Payload content length greater than maximum allowed: 1000000'
        });
        response.code(413);
        return response;
    }

    try {
        const { confidenceScore, result, suggestion } = await predictClassification(model, image);

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            id: id,
            result: result,
            suggestion: suggestion,
            confidenceScore: confidenceScore,
            createdAt: createdAt
        };

        await storeData(id, data);

        const response = h.response({
            status: 'success',
            message: 'Model is predicted successfully.',
            data
        });
        response.code(201);
        return response;

    } catch (error) {
        const response = h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi'
        });
        response.code(400);
        return response;
    }
}

async function getPredictionHistories(request, h) {
  const db = new Firestore();
  const predictCollection = db.collection('prediction');

  try {
      const snapshot = await predictCollection.get();
      const histories = snapshot.docs.map(doc => ({
          id: doc.id,
          history: doc.data()
      }));

      return h.response({
          status: 'success',
          data: histories
      }).code(200);

  } catch (error) {
      console.error('Error fetching prediction histories:', error);
      return h.response({
          status: 'fail',
          message: 'Unable to retrieve prediction histories'
      }).code(500);
  }
}

module.exports = { postPredictHandler, getPredictionHistories };
