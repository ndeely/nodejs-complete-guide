const db = require('../util/db');

module.exports = class Product {
    constructor(id, title, description, price, imageUrl) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    save() {
        if (this.id) {
            return db.execute(
                'UPDATE products SET title=?, price=?, description=?, imageUrl=? WHERE id=?',
                [this.title, this.price, this.description, this.imageUrl, this.id]
            );
        } else {
            return db.execute(
                'INSERT INTO products (id, title, price, description, imageUrl) VALUES (NULL, ?, ?, ?, ?)',
                [this.title, this.price, this.description, this.imageUrl]
            );
        }
    }

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE id=' + id);
    }

    static deleteById(id) {
        return db.execute('DELETE FROM products WHERE id=' + id);
    }
}