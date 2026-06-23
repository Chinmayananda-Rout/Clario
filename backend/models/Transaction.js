const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount']
    },
    type: {
        type: String,
        enum: ['income' , 'expense'],
        required: true
    },
    category: {
        type: String,
        required: [true, 'Please categorize this transaction']
    },
    status: {
        type:  String,
        enum: ['cleared', 'pending'],
        default: 'cleared'
    },
    date: {
        type: Date,
        default: Date.now``
    }
}, {timestamps: true} );

module.exports = mongoose.model('Transaction', transactionSchema);