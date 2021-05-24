const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(require.main.filename),
    'data',
    'products.json'
);

const getProductsFromFile = (cb) => {
    const products = [];
    fs.readFile(p, (err, fileContent) => {
        if (!err && JSON.parse(fileContent).length > 0) {
            JSON.parse(fileContent).forEach(product => { products.push(product)} );
        }
        return cb(products);
    });
};

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        fs.readFile(p, (err, fileContent) => {
            getProductsFromFile(products => {
                if (this.id) {
                    //update product
                    const existingProductIndex = products.findIndex(product => this.id === product.id);
                    const updatedProducts = [...products];
                    updatedProducts[existingProductIndex] = this;
                    fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                        console.log(err);
                    });
                } else {
                    //new product
                    this.id = Math.random().toString();
                    products.push(this);
                    fs.writeFile(p, JSON.stringify(products), (err) => {
                        console.log(err);
                    });
                }
            });
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    static findById(id, cb) {
        getProductsFromFile(products => {
           const product = products.find(p => { return p.id === id } );
           cb(product);
        });
    }
}