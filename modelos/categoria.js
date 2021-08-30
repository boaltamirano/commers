const mongoose = require('mongoose');

const categoriaSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: {
        type: String,
    },
})

exports.Categoria = mongoose.model('Categoria', categoriaSchema);
