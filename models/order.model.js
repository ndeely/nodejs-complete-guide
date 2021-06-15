const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        email: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    products: [{
        productData: { type: Object, required: true },
        quantity: { type: Number, required: true }
    }]
});

module.exports = mongoose.model('Order', orderSchema);

// const Sequelize = require('sequelize');
//
// const sequelize = require('../util/db');
//
// const Order = sequelize.define('order', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: true,
//         primaryKey: true
//     }
// });
//
// module.exports = Order;