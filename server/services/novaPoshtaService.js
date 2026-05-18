const API_KEY = process.env.NOVA_POSHTA_API_KEY || 'dfb9ddbee363e69c904c58ded817495056d387a8';
const BASE_URL = 'https://api.novaposhta.ua/v2.0/json/';

/**
 * Універсальний метод для відправки POST-запитів до Нової Пошти
 */
async function sendRequest(modelName, calledMethod, methodProperties = {}) {
    const payload = {
        apiKey: API_KEY,
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
        } else {
            console.error(`Помилка API Нової Пошти (${calledMethod}):`, data.errors);
            throw new Error(data.errors.join(', '));
        }
    } catch (error) {
        console.error(`Помилка мережі при запиті до ${calledMethod}:`, error.message);
        throw error;
    }
}

/**
 * 1. Отримання міст (можна з фільтром по назві)
 * @param {string} findString - Назва міста або його частина для пошуку (наприклад, "Київ")
 */
async function getCities(findString = '') {
    const properties = findString ? { FindByString: findString } : {};
    return await sendRequest('Address', 'getCities', properties);
}

/**
 * 2. Отримання відділень для конкретного міста
 * @param {string} cityRef - Унікальний ідентифікатор міста (Ref), отриманий з методу getCities
 */
async function getWarehouses(cityRef) {
    if (!cityRef) throw new Error('Для отримання відділень необхідно вказати cityRef');
    return await sendRequest('Address', 'getWarehouses', { CityRef: cityRef });
}

module.exports = {
    getCities,
    getWarehouses
};
