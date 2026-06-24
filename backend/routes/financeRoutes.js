const express = require('express');
const router = express.Router();
const{
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
    getFinanceSummary
} = require('../controllers/financeController');

const { protect } = require("../middleware/authMiddleware");

router.get('/summary', protect, getFinanceSummary);
router.get('/', protect, getTransactions);

router.route('/').post(protect, createTransaction);
router.route('/:id').put(protect, updateTransaction).delete(protect, deleteTransaction);

module.exports = router;