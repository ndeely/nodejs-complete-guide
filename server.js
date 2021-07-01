const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

// mongodb and session modules
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash'); // for error/info messages to user
require('dotenv').config();
const multer = require('multer'); // for multipart form data (text and files)

const errorController = require('./controllers/error.controller');
const User = require('./models/user.model');

const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf({});

// for multer options
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now());
    }
});
const imageFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
};

app.set('view engine', ejs.name);

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');
const authRoutes = require('./routes/auth.routes');
const paymentRoutes = require('./routes/payment.routes');

app.use(bodyParser.urlencoded({extended: false}));

// initialise multer with options
app.use(multer({
    storage: fileStorage,
    fileFilter: imageFilter
}).single('image'));

//statically served folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(csrfProtection);
app.use(flash()); // must be initialised after session creation

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (user) { req.user = user; }
            next();
        })
        .catch(err => {
            throw new Error(err);
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(paymentRoutes);
app.get('/500', errorController.error500);

app.use(errorController.error404); // catch remaining routes

// catch all errors thrown
app.use((error, req, res, next) => {
    // console.log(error);
    res.status(500).render(
        '500',
        {
            pageTitle: '500 - Error',
            path: '/500',
            isAuthenticated: req.session.isLoggedIn
        }
    );
});

mongoose
    .connect(
        process.env.MONGODB_URI,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
        app.listen(4200);
    })
    .catch(err => { if (err) console.log(err) });