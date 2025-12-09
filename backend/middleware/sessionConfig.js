const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = session({
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: false,
  rolling: false, // Không reset cookie khi request mới
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: false,
    secure: false,
    sameSite: 'lax', 
    path: '/'
  }
});

module.exports = sessionConfig;
