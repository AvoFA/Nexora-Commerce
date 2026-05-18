const API_KEY = process.env.NOVA_POSHTA_API_KEY || '';
const BASE_URL = 'https://api.novaposhta.ua/v2.0/json/';

async function sendRequest(modelName, calledMethod, methodProperties = {}, apiKey = API_KEY) {
    const payload = {
        apiKey,
        modelName,
        calledMethod,
        methodProperties
    };

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            return data.data;
        }

        const errors = data.errors || [];
        const isInvalidApiKey = errors.some((message) =>
            String(message).toLowerCase().includes('api key incorrect')
        );

        if (apiKey && isInvalidApiKey) {
            console.warn(`Nova Poshta API key rejected for ${calledMethod}. Retrying without apiKey.`);
            return sendRequest(modelName, calledMethod, methodProperties, '');
        }

        console.error(`Nova Poshta API error (${calledMethod}):`, errors);
        throw new Error(errors.join(', ') || 'Nova Poshta API request failed');
    } catch (error) {
        console.error(`Nova Poshta network error (${calledMethod}):`, error.message);
        throw error;
    }
}

async function getCities(findString = '') {
    const properties = findString ? { FindByString: findString } : {};
    return await sendRequest('Address', 'getCities', properties);
}

async function getWarehouses(cityRef) {
    if (!cityRef) throw new Error('cityRef is required to load Nova Poshta warehouses');
    return await sendRequest('Address', 'getWarehouses', { CityRef: cityRef });
}

module.exports = {
    getCities,
    getWarehouses
};
