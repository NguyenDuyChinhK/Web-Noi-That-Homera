const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelProduct = new Schema(
    {
        name: { type: String, require: true },
        price: { type: Number, require: true },
        discount: { type: Number, require: true },
        description: { type: String, require: true },
        images: { type: String, require: true },
        category: { type: String, require: true },
        size: { type: Array, require: true },
        stock: { type: Number, require: true },
        soldCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('products', modelProduct);
