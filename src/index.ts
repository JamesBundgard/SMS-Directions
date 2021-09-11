/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

import express from 'express';
import bodyParser from 'body-parser';
import SMSController from './controllers/SMSController';

require('dotenv').config();
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 8080;

const controller = new SMSController();

app.get('/', async (req, res) => { res.send('Server is live.'); });

app.post('/sms', controller.handleSMS.bind(controller));

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

// To receive SMS locally (run in separate shell):
// twilio phone-numbers:update <twilio phone number> --sms-url="http://localhost:8080/sms"
