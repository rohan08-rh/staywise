const ENV=process.env.NODE_ENV|| 'devlopment'
require('dotenv').config({
    path:`.env.${ENV}`
});

const helmet=require('helmet');

const fs = require('fs');

const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const multer = require('multer');
const compression=require('compression');
const morgan=require('morgan');
const path = require('path');
const loggingPath=path.join(__dirname,'access.log');
const loggingStream=fs.createWriteStream(loggingPath,{flags:'a'});
const app = express();
app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream:loggingStream}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'images')));

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const MONGO_DB_URL=
process.env.MONGO_URI;



const sessionStore = new MongoDBStore({
    uri: MONGO_DB_URL,
    collection: 'sessions'
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '-');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const fileFilter = (req, file, cb) => {
    const isValidFile = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype);
    if (isValidFile) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG, and PNG files are allowed.'), false);
    }
};

const upload = multer({ storage, fileFilter });





// import local module
const hostRouter = require('./Routers/Routes/host');
const pageNotFound = require('./Routers/Routes/404');
const storeRouter = require('./Routers/Routes/storeHomes');
const BodyParser = require('body-parser');
const { authRouter } = require('./Routers/Routes/authrouter');

app.use(BodyParser.urlencoded({ extended: true }));
app.use(upload.single('photo'));

app.use(session({
    secret: 'MERN LIVE BATCH',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

app.use(storeRouter);
app.use('/host', (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
});

app.use(hostRouter);
app.use(authRouter);
app.use(pageNotFound);


const PORT=process.env.PORT || 8082;

mongoose.connect(MONGO_DB_URL, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`server running at http://localhost:${PORT}/`);
        });
    })
    .catch((err) => {
        console.log('error while connecting', err.message);
    });

