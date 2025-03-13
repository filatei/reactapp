import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'crypto', 'paypal', 'stripe'],
        required: true
    },
    serviceType: {
        type: String,
        required: true
    },
    description: String,
    transactionId: String,
    paymentDate: Date,
    dueDate: Date,
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema); 