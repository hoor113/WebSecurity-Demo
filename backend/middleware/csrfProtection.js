const csrf = require('csurf');

const csrfProtection = csrf({  // Xác thực CSRF Token
  cookie: false, // Không tạo cookie _csrf
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'], // Bỏ qua các method không cần CSRF
  value: (req) =>
    req.body?.csrfToken ||
    req.headers['x-csrf-token'] ||
    req.headers['csrf-token'] ||
    req.query?._csrf
});

module.exports = csrfProtection;
