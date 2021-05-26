const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const errorController = require('./controllers/error.controller');
const sequelize = require('./util/db');
const Product = require('./models/product.model');
const User = require('./models/user.model');
const Cart = require('./models/cart.model');
const CartItem = require('./models/cartitem.model');

const app = express();

app.set('view engine', ejs.name);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => { if (err) console.log(err) } );
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.error404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

sequelize
    //.sync({force: true})
    .sync()
    .then(() => {
        User.findByPk(1)
            .then(user => {
                if (!user) {
                    return User.create({ name: 'Niall', email: 'test@test.com'});
                }
                return Promise.resolve(user);
            })
            .then(user => {
                return user.createCart();
            })
            .then(cart => {
                app.listen(4200);
            })
            .catch();
    })
    .catch(err => {
        if (err) console.log(err);
    });