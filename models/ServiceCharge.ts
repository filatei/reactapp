import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - reference
 *         - provider
 *         - status
 *         - amount
 *         - paidBy
 *       properties:
 *         reference:
 *           type: string
 *           description: Unique payment reference
 *           example: "FLW-MOCK-12345678"
 *         provider:
 *           type: string
 *           enum: [flutterwave, monnify]
 *           description: Payment provider used
 *           example: "flutterwave"
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           description: Current payment status
 *           example: "completed"
 *         amount:
 *           type: number
 *           description: Payment amount
 *           example: 50000
 *         paidBy:
 *           type: string
 *           description: ID of user who made the payment
 *           example: "507f1f77bcf86cd799439011"
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: When the payment was made
 *         metadata:
 *           type: object
 *           properties:
 *             paymentMethod:
 *               type: string
 *               example: "card"
 *             description:
 *               type: string
 *               example: "Monthly maintenance fee"
 */
interface IPayment {
    reference: string;
    provider: 'flutterwave' | 'monnify';
    status: 'pending' | 'completed' | 'failed';
    amount: number;
    paidBy: Types.ObjectId;
    paidAt?: Date;
    metadata?: {
        paymentMethod: string;
        description?: string;
        [key: string]: unknown;
    };
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceCharge:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - amount
 *         - category
 *         - status
 *         - createdBy
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the service charge
 *           example: "Monthly Maintenance Fee"
 *         description:
 *           type: string
 *           description: Detailed description of the service charge
 *           example: "Monthly maintenance fee for January 2024"
 *         amount:
 *           type: number
 *           description: The amount to be paid in the smallest currency unit (kobo)
 *           example: 5000000
 *         category:
 *           type: string
 *           enum: [maintenance, repairs, utilities, security]
 *           description: Category of the service charge
 *           example: "maintenance"
 *         status:
 *           type: string
 *           enum: [active, paid, cancelled, unpaid]
 *           description: Current status of the service charge
 *           example: "active"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Optional due date for the payment
 *           example: "2024-02-01T00:00:00.000Z"
 *         createdBy:
 *           type: string
 *           description: ID of the admin who created the charge
 *           example: "507f1f77bcf86cd799439011"
 *         affectedUsers:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs affected by this charge
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *         paidBy:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs who have paid
 *           example: ["507f1f77bcf86cd799439011"]
 *         payments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Payment'
 *           description: List of payment transactions
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
export interface IServiceCharge extends Document {
    title: string;
    description: string;
    amount: number;
    category: 'maintenance' | 'repairs' | 'utilities' | 'security';
    status: 'active' | 'paid' | 'cancelled' | 'unpaid';
    dueDate?: Date;
    estate: Types.ObjectId;
    createdBy: Types.ObjectId;
    affectedUsers: Types.ObjectId[];
    paidBy: Types.ObjectId[];
    payments: IPayment[];
    createdAt: Date;
    updatedAt: Date;

    /**
     * @swagger
     * /api/service-charges/{id}/mark-paid:
     *   put:
     *     summary: Mark a service charge as paid
     *     description: Allows an admin to mark a service charge as paid
     *     security:
     *       - bearerAuth: []
     *     tags:
     *       - Service Charges
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         example: "507f1f77bcf86cd799439011"
     *     responses:
     *       200:
     *         description: Service charge marked as paid successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: "success"
     *       401:
     *         description: Not authenticated or not an admin
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Not authenticated"
     *       403:
     *         description: User is not an admin
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Only admins can mark service charges as paid"
     *       404:
     *         description: Service charge not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Service charge not found"
     */
    markAsPaid(adminId: Types.ObjectId): Promise<void>;

    /**
     * @swagger
     * /api/service-charges/{id}/mark-unpaid:
     *   put:
     *     summary: Mark a service charge as unpaid
     *     description: Allows an admin to mark a service charge as unpaid
     *     security:
     *       - bearerAuth: []
     *     tags:
     *       - Service Charges
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         example: "507f1f77bcf86cd799439011"
     *     responses:
     *       200:
     *         description: Service charge marked as unpaid successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: "success"
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       403:
     *         $ref: '#/components/responses/ForbiddenError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    markAsUnpaid(adminId: Types.ObjectId): Promise<void>;

    /**
     * @swagger
     * /api/service-charges/{id}/payments:
     *   post:
     *     summary: Add a new payment to a service charge
     *     description: Records a new payment transaction for the service charge
     *     security:
     *       - bearerAuth: []
     *     tags:
     *       - Payments
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         example: "507f1f77bcf86cd799439011"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - reference
     *               - provider
     *               - amount
     *               - paidBy
     *             properties:
     *               reference:
     *                 type: string
     *                 example: "FLW-MOCK-12345678"
     *               provider:
     *                 type: string
     *                 enum: [flutterwave, monnify]
     *                 example: "flutterwave"
     *               amount:
     *                 type: number
     *                 example: 50000
     *               paidBy:
     *                 type: string
     *                 example: "507f1f77bcf86cd799439011"
     *               metadata:
     *                 type: object
     *                 properties:
     *                   paymentMethod:
     *                     type: string
     *                     example: "card"
     *     responses:
     *       200:
     *         description: Payment added successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Payment'
     *       400:
     *         description: Invalid payment data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Invalid payment data"
     */
    addPayment(payment: Omit<IPayment, 'status' | 'paidAt'>): Promise<void>;

    /**
     * @swagger
     * /api/service-charges/{id}/payments/{reference}:
     *   put:
     *     summary: Update payment status
     *     description: Updates the status of a payment transaction
     *     security:
     *       - bearerAuth: []
     *     tags:
     *       - Payments
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         example: "507f1f77bcf86cd799439011"
     *       - name: reference
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         example: "FLW-MOCK-12345678"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - status
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [pending, completed, failed]
     *                 example: "completed"
     *     responses:
     *       200:
     *         description: Payment status updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Payment'
     *       404:
     *         description: Payment not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Payment not found"
     */
    updatePaymentStatus(reference: string, status: IPayment['status']): Promise<void>;

    /**
     * @internal
     * Checks if the service charge has been fully paid by comparing total paid amount with charge amount
     * @returns {boolean} True if the total paid amount equals or exceeds the charge amount
     * @example
     * ```typescript
     * const serviceCharge = await ServiceCharge.findById(id);
     * if (serviceCharge.isFullyPaid()) {
     *   // Handle fully paid status
     * }
     * ```
     */
    isFullyPaid(): boolean;

    /**
     * @internal
     * Calculates the total amount paid for this service charge by summing all completed payments
     * @returns {number} The sum of all completed payments in the smallest currency unit
     * @example
     * ```typescript
     * const serviceCharge = await ServiceCharge.findById(id);
     * const totalPaid = serviceCharge.getTotalPaidAmount();
     * console.log(`Total paid: ${totalPaid / 100} NGN`);
     * ```
     */
    getTotalPaidAmount(): number;

    /**
     * @internal
     * Calculates the remaining amount to be paid by subtracting total paid from charge amount
     * @returns {number} The difference between the total charge amount and paid amount
     * @example
     * ```typescript
     * const serviceCharge = await ServiceCharge.findById(id);
     * const remaining = serviceCharge.getRemainingAmount();
     * if (remaining > 0) {
     *   console.log(`Remaining to pay: ${remaining / 100} NGN`);
     * }
     * ```
     */
    getRemainingAmount(): number;

    /**
     * @internal
     * Checks if a user has permission to modify this service charge
     * @param {Types.ObjectId} userId - The ID of the user to check
     * @returns {Promise<boolean>} True if the user is an admin or the creator
     * @throws {Error} If the user is not found
     * @example
     * ```typescript
     * const serviceCharge = await ServiceCharge.findById(id);
     * if (await serviceCharge.canBeModifiedByUser(userId)) {
     *   // Allow modification
     * } else {
     *   throw new Error('Unauthorized');
     * }
     * ```
     */
    canBeModifiedByUser(userId: Types.ObjectId): Promise<boolean>;
}

const PaymentSchema = new Schema<IPayment>({
    reference: { type: String, required: true },
    provider: { type: String, required: true, enum: ['flutterwave', 'monnify'] },
    status: { type: String, required: true, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    amount: { type: Number, required: true },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paidAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

const ServiceChargeSchema = new Schema<IServiceCharge>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['maintenance', 'repairs', 'utilities', 'security'],
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'paid', 'cancelled', 'unpaid'],
        default: 'active',
    },
    dueDate: { type: Date },
    estate: { type: Schema.Types.ObjectId, ref: 'Estate', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    affectedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    paidBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    payments: [PaymentSchema],
}, {
    timestamps: true,
});

// Add indexes
ServiceChargeSchema.index({ 'payments.reference': 1 }, { unique: true, sparse: true });
ServiceChargeSchema.index({ estate: 1, status: 1 });
ServiceChargeSchema.index({ estate: 1, dueDate: 1 });

// Add methods
ServiceChargeSchema.methods.markAsPaid = async function (adminId: Types.ObjectId): Promise<void> {
    const User = mongoose.model('User');
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
        throw new Error('Only admins can mark service charges as paid');
    }
    this.status = 'paid';
    await this.save();
};

ServiceChargeSchema.methods.markAsUnpaid = async function (adminId: Types.ObjectId): Promise<void> {
    const User = mongoose.model('User');
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
        throw new Error('Only admins can mark service charges as unpaid');
    }
    this.status = 'unpaid';
    await this.save();
};

ServiceChargeSchema.methods.addPayment = async function (payment: Omit<IPayment, 'status' | 'paidAt'>): Promise<void> {
    this.payments.push({
        ...payment,
        status: 'pending',
        paidAt: new Date()
    });
    await this.save();
};

ServiceChargeSchema.methods.updatePaymentStatus = async function (reference: string, status: IPayment['status']): Promise<void> {
    const payment = this.payments.find((p: IPayment) => p.reference === reference);
    if (!payment) {
        throw new Error('Payment not found');
    }
    payment.status = status;
    if (status === 'completed') {
        payment.paidAt = new Date();
        if (!this.paidBy.includes(payment.paidBy)) {
            this.paidBy.push(payment.paidBy);
        }
        if (this.isFullyPaid()) {
            this.status = 'paid';
        }
    }
    await this.save();
};

ServiceChargeSchema.methods.isFullyPaid = function (): boolean {
    return this.getTotalPaidAmount() >= this.amount;
};

ServiceChargeSchema.methods.getTotalPaidAmount = function (): number {
    return this.payments
        .filter((p: IPayment) => p.status === 'completed')
        .reduce((total: number, p: IPayment) => total + p.amount, 0);
};

ServiceChargeSchema.methods.getRemainingAmount = function (): number {
    return Math.max(0, this.amount - this.getTotalPaidAmount());
};

ServiceChargeSchema.methods.canBeModifiedByUser = async function (userId: Types.ObjectId): Promise<boolean> {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    return user?.role === 'admin' || this.createdBy.toString() === userId.toString();
};

export const ServiceCharge = mongoose.models.ServiceCharge || mongoose.model<IServiceCharge>('ServiceCharge', ServiceChargeSchema); 