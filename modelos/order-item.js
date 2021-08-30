const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number, 
        required: true
    },
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto'
    }
}) 

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);