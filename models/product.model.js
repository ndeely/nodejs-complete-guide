const mongodb = require('mongodb');
const getDb = require('../util/db').getDb;

class Product {
    constructor(title, price, description, imageUrl, id) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectId(id) : null;
    }

    save() {
        const db = getDb();
        let dbOperation;
        if (this._id) {
            //update the product
            dbOperation = db.collection('products')
                .updateOne(
                    { _id: this._id },
                    { $set: this }
                    );
        } else {
            dbOperation = db.collection('products')
                .insertOne(this);
        }
        return dbOperation
            .then(result => {
                console.log(result);
            })
            .catch(err => { if (err) console.log(err) });
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products').find().toArray()
            .then(products => {
                return products;
            })
            .catch(err => { if (err) console.log(err) });
    }

    static findById(prodId) {
        const db = getDb();
        return db.collection('products')
            .find({ _id: mongodb.ObjectID(prodId) })
            .next()
            .then(product => {
                return product;
            })
            .catch(err => { if (err) console.log(err) });
    }

    static deleteById(prodId) {
        const db = getDb();
        db.collections('products')
            .deleteOne({ _id: new mongodb.ObjectId(prodId) })
            .then()
            .catch(err => { if (err) console.log(err) });
    }
}

module.exports = Product;