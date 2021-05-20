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
        if (!err) {
            JSON.parse(fileContent).forEach(product => { products.push(product)} );
        }
        return cb(products);
    });
};

module.exports = class Product {

    constructor(title) {
        this.title = title;
    }

    save() {
        fs.readFile(p, (err, fileContent) => {
            getProductsFromFile(products => {
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    console.log(err);
                });
            });
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
}