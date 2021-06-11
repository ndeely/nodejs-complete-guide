const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const errorController = require('./controllers/error.controller');
// const mongoConnect = require('./util/db').mongoConnect;
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
            req.user = user;
            next();
        })
        .catch(err => { if (err) console.log(err) } );
});

app.use('/admin', adminRoutes);
 app.use(shopRoutes);

app.use(errorController.error404);

mongoose
    .connect(
        'mongodb+srv://niall:NHO4Ziki87@cluster1.eivhf.mongodb.net/node?retryWrites=true&w=majority',
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Niall',
                    email: 'nialldeely@gmail.com',
                    cart: []
                });
            }
        });
        app.listen(4200);
    })
    .catch(err => { if (err) console.log(err) });