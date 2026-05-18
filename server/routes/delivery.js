const express = require('express');
const router = express.Router();
const { getCities, getWarehouses } = require('../services/novaPoshtaService');

// @route   GET /api/delivery/cities
// @desc    Get cities by name (search query)
// @access  Public
router.get('/cities', async (req, res) => {
    try {
        const { search } = req.query;
        const cities = await getCities(search || '');
        res.json({ success: true, data: cities });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// @route   GET /api/delivery/warehouses
// @desc    Get warehouses by cityRef
// @access  Public
router.get('/warehouses', async (req, res) => {
    try {
        const { cityRef } = req.query;
        if (!cityRef) {
            return res.status(400).json({ success: false, error: 'cityRef parameter is required' });
        }
        const warehouses = await getWarehouses(cityRef);
        res.json({ success: true, data: warehouses });
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
