const mongoose = require('mongoose');

const pedidoSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required:true
    }],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

pedidoSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

pedidoSchema.set('toJSON', {
    virtuals: true,
});

exports.Pedido = mongoose.model('Pedido', pedidoSchema);
