const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const errorController = require('./controllers/error.controller');
const mongoConnect = require('./util/db').mongoConnect;
const User = require('./models/user.model');

const app = express();

app.set('view engine', ejs.name);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('60b6588029fb11f22962f4df')
        .then(user => {
            req.user = new User(user.name, user.email, user.password, user.cart, user._id);
            next();
        })
        .catch(err => { if (err) console.log(err) } );
});

app.use('/admin', adminRoutes);
 app.use(shopRoutes);

app.use(errorController.error404);

mongoConnect(() => {
    app.listen(4200);
});