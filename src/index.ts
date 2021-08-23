import express from "express";
import { Twilio } from 'twilio';
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";
import bodyParser from "body-parser";

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
    client.messages
    .create({
        body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
        from: process.env.TWILIO_PHONE_NUMBER,
        to: '+15199334268'
    })
    .then(message => console.log(message.sid));
    res.send("Hello world!");
});

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();

    if (req.body.Body == 'hello') {
        twiml.message('Hi!');
    } else if (req.body.Body == 'bye') {
        twiml.message('Goodbye');
    } else {
        twiml.message(
            'No Body param match, Twilio sends this in the request to your server.'
        );
    }
  
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  });

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

// twilio phone-numbers:update <twilio phone number> --sms-url="http://localhost:8080/sms"
