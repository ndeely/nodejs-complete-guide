const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
    // find index of product in cart
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) { // this item is in the cart
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push(
            { productId: product._id, quantity: newQuantity }
        );
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    this.save();
};

userSchema.methods.deleteFromCart = function(prodId) {
    const updatedCartItems = this.cart.items.filter(i => {
        return i._id.toString() !== prodId.toString();
    });
    this.cart.items = updatedCartItems;
    this.save();
};

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    this.save();
};

module.exports = mongoose.model('User', userSchema);


// const mongodb = require('mongodb');
// const getDb = require('../util/db').getDb;
//
// class User {
//     constructor(username, email, password, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.password = password;
//         this.cart = cart; // {items: []}
//         this.id = id ? mongodb.ObjectId(id) : null;
//         this.orders = [];
//     }
//
//     save() {
//         const db = getDb();
//         let dbOperation;
//         if (this.id) {
//             dbOperation = db.collection('users')
//                 .updateOne(
//                     { _id: this.id },
//                     { $set: this }
//                     );
//         } else {
//             dbOperation = db.collection('users')
//                 .insertOne(this);
//         }
//         return dbOperation
//             .then(result => {
//                 console.log('User ' + this.id ? 'updated' : 'added');
//             })
//             .catch(err => { if (err) console.log(err) });
//     }
//
//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users')
//             .findOne({ _id: new mongodb.ObjectId(userId) });
//     }
//
//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//                    return cp.productId.toString() === product._id.toString();
//                 });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];
//         if (cartProductIndex >= 0) { // this item is in the cart
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({ productId: new mongodb.ObjectId(product._id), quantity: newQuantity });
//         }
//         const updatedCart = {
//             items: updatedCartItems
//         };
//         const db = getDb();
//         db.collection('users')
//             .updateOne(
//                 { _id: new mongodb.ObjectId(this.id) },
//                 { $set: { cart: updatedCart } }
//                 );
//     }
//
//     deleteFromCart(prodId) {
//         const updatedCartItems = this.cart.items.filter(i => {
//             return i.productId.toString() !== prodId.toString();
//         });
//         const db = getDb();
//         return db
//             .collection('users')
//             .updateOne(
//                 { _id: new mongodb.ObjectId( this.id ) },
//                 { $set: { cart: { items: updatedCartItems } } }
//             );
//     }
//
//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(
//           i => {
//               return i.productId;
//           }
//         );
//         return db
//             .collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(products => {
//                 return products
//                     .map(p => {
//                         return {
//                             ...p,
//                             quantity: this.cart.items.find(i => {
//                             return i.productId.toString() === p._id.toString();
//                             }).quantity
//                         };
//                     });
//             });
//     }
//
//     addOrder() {
//         const db = getDb();
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new mongodb.ObjectId(this.id)
//                     }
//                 };
//                 return db
//                     .collection('orders')
//                     .insertOne(order);
//             })
//             .then(() => {
//                 this.cart = {items: []};
//                 return db
//                     .collection('users')
//                     .updateOne(
//                         { _id: new mongodb.ObjectId(this.id) },
//                         { $set: { cart: { items: [] } } }
//                         );
//             });
//     }
//
//     getOrders() {
//         const db = getDb();
//         return db
//             .collection('orders')
//             .find( { 'user._id': new mongodb.ObjectId(this.id) } )
//             .toArray();
//     }
// }
//
//
//
//
// module.exports = User;