const mongodb = require('mongodb');
const getDb = require('../util/db').getDb;

class User {
    constructor(username, email, password, cart, id) {
        this.name = username;
        this.email = email;
        this.password = password;
        this.cart = cart; // {items: []}
        this.id = id ? mongodb.ObjectId(id) : null;
    }

    save() {
        const db = getDb();
        let dbOperation;
        if (this.id) {
            dbOperation = db.collection('users')
                .updateOne(
                    { _id: this.id },
                    { $set: this }
                    );
        } else {
            dbOperation = db.collection('users')
                .insertOne(this);
        }
        return dbOperation
            .then(result => {
                console.log('User ' + this.id ? 'updated' : 'added');
            })
            .catch(err => { if (err) console.log(err) });
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users')
            .findOne({ _id: new mongodb.ObjectId(userId) });
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
                   return cp.productId.toString() === product._id.toString();
                });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];
        if (cartProductIndex >= 0) { // this item is in the cart
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({ productId: new mongodb.ObjectId(product._id), quantity: newQuantity });
        }
        const updatedCart = {
            items: updatedCartItems
        };
        const db = getDb();
        db.collection('users')
            .updateOne(
                { _id: new mongodb.ObjectId(this.id) },
                { $set: { cart: updatedCart } }
                );
    }

}


module.exports = User;