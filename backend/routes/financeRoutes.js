const express = require('express');
const router = express.Router();
const{
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getFinanceSummary
} = require('../controllers/financeController');

const { protect } = require("../middleware/authMiddleware");

router.get('/summary', protect, getFinanceSummary);

router.route('/').post(protect, createTransaction);
router.route('/:id').put(protect, updateTransaction).delete(protect, deleteTransaction);

module.exports = router;