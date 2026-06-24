const mongoose = require('mongoose');
const Transaction = require('../models/Transaction')

const createTransaction = async (req, res) => {
    try{
        const{ title, amount, type, category, status, date } = req.body;
        const currentUserId = req.user._id || req.user.userId;

        if(!title || !amount || !type || !category) {
            res.status(400).json({ message: 'Please provide title, amount, type and category' });
        }

        const transaction = await Transaction.create({
            title,
            amount,
            type,
            category,
            status,
            date,
            user: currentUserId
        });

        res.status(200).json(transaction);
    }
    catch (error) {
        res.status(500).json({message: 'Server error while creating transaction'});
    }
};

const getTransactions = async (req, res) => {
    try {
        const currentUserId = req.user._id || req.user.userId;

        const transactions = await Transaction.find({ user: currentUserId }).sort({ date: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        console.error("Fetch Transactions Error:", error.message);
        res.status(500).json({ message: 'Server error fetching transactions' });
    }
};

const updateTransaction = async (req, res) => {
    try{
        const currentUserId  = req.user._id || req.user.userId;
        let transaction = await Transaction.findbyId(req.params.id);

        if(!transaction){
            return res.status(404).json({message: 'Transaction not found'});
        }

        if(transaction.user.toString() !== currentUserId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedTransaction = await Transaction.findbyIdandUpdate(req.params.id, req.body, { new: true});
        res.status(200).json(updatedTransaction);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error while updating transaction' });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const currentUserId = req.user._id || req.user.userId;
        const transactionId = req.params.id;

        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.user.toString() !== currentUserId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Transaction.findByIdAndDelete(transactionId);
        
        res.status(200).json({ id: transactionId, message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error("Deletion Error:", error.message); 
        res.status(500).json({ message: 'Server error while deleting transaction' });
    }
};

const getFinanceSummary = async (req, res) => {
    try {
        const userIdString = req.user._id || req.user.userId;
        const currentUserId = new mongoose.Types.ObjectId(userIdString);

        const summary = await Transaction.aggregate([
            { $match: { user: currentUserId } },
            {
                $group: {
                    _id: null,
                    totalClearedIncome: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$type", "income"] }, { $eq: ["$status", "cleared"] }] }, "$amount", 0] }
                    },
                    totalClearedExpense: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$type", "expense"] }, { $eq: ["$status", "cleared"] }] }, "$amount", 0] }
                    },
                    pendingPayables: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$type", "expense"] }, { $eq: ["$status", "pending"] }] }, "$amount", 0] }
                    },
                    pendingReceivables: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$type", "income"] }, { $eq: ["$status", "pending"] }] }, "$amount", 0] }
                    }
                }
            }
        ]);

        const expensesByCategory = await Transaction.aggregate([
            { $match: { user: currentUserId, type: 'expense', status: 'cleared' } },
            {
                $group: {
                    _id: "$category", 
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { total: -1 } } 
        ]);

        const reminders = await Transaction.find({ 
            user: currentUserId, 
            status: 'pending' 
        }).sort({ date: 1 });

        const uniqueCategories = await Transaction.distinct('category', { user: currentUserId });

        const stats = summary[0] || {
            totalClearedIncome: 0,
            totalClearedExpense: 0,
            pendingPayables: 0,
            pendingReceivables: 0
        };

        res.status(200).json({
            currentBalance: stats.totalClearedIncome - stats.totalClearedExpense,
            stats,
            expensesByCategory, 
            reminders,          
            availableFilters: uniqueCategories 
        });

    } catch (error) {
        console.error("Finance Aggregation Error:", error);
        res.status(500).json({ message: 'Server error computing finance summary' });
    }
};

module.exports = {
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
    getFinanceSummary
};