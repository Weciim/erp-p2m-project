const express = require('express');

const cors = require('cors');
const compression = require('compression');

const cookieParser = require('cookie-parser');

const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const appRouter = require('./routes/appRoutes/appApi');
const coreApiRouter = require('./routes/coreRoutes/coreApi');
const coreDownloadRouter = require('./routes/coreRoutes/coreDownloadRouter');
const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const adminAuth = require('./controllers/coreControllers/adminAuth');

// const errorHandlers = require('./handlers/errorHandlers');
// const erpApiRouter = require('./routes/appRoutes/appApi');

// const fileUpload = require('express-fileupload');
//  Express app
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

// app.use(fileUpload());

// API Routes
app.use('/api', coreAuthRouter);
app.use('/api',adminAuth.isValidAuthToken, appRouter);
app.use('/api', adminAuth.isValidAuthToken, coreApiRouter);
// app.use('/api', adminAuth.isValidAuthToken, erpApiRouter);
app.use('/download', coreDownloadRouter);
app.use('/public', corePublicRouter);

// app.use(errorHandlers.notFound);

// app.use(errorHandlers.productionErrors);

module.exports = app;
