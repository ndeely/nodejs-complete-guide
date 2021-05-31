const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const errorController = require('./controllers/error.controller');
// const User = require('./models/user.model');
const mongoConnect = require('./util/db').mongoConnect;

const app = express();

app.set('view engine', ejs.name);

const adminRoutes = require('./routes/admin');
// const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res, next) => {
//     User.findByPk(1)
//         .then(user => {
//             req.user = user;
//             next();
//         })
//         .catch(err => { if (err) console.log(err) } );
// });

app.use('/admin', adminRoutes);
// app.use(shopRoutes);

app.use(errorController.error404);

mongoConnect(() => {
    app.listen(4200);
});