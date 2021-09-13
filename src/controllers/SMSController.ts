import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { Request, Response } from 'express';
import JokesService from '../jokes/JokesService';
import DirectionsService from '../model/DirectionsService';

type TwilioBody = {
    MessageSid: string;
    SmsSid: string;
    AccountSid: string;
    MessagingServiceSid: string;
    From: string;
    To: string;
    Body: string;
    NumMedia: string;
};

const helpString = `
Welcome to my texting bot!


Text "joke" to get a random joke.

Text "helpme" or "hello" to bring up this help menu.

Text your destination address, then follow the prompts to get directions.
(Pro shortcut: [travel mode] to [destination] from [current location])

Text "reset" to stop getting directions.

Warning: please follow the EXACT formats above :) - but don't worry about upper/lower case
`;

export default class SMSController {
    constructor(
        private directionService = new DirectionsService(),
    ) { }

    public async handleSMS(req: Request, res: Response): Promise<void> {
        const twiml = new MessagingResponse();

        const body = req.body as TwilioBody;
        const data = body.Body.trim();

        if (data.toLowerCase() === 'hello' || data.toLowerCase() === 'helpme') {
            twiml.message(helpString);
        } else if (data.toLowerCase() === 'joke') {
            twiml.message(JokesService.getJoke());
        } else if (data.toLowerCase() === 'next') {
            twiml.message(this.directionService.getNextDirections(body.From));
        } else if (data.toLowerCase() === 'reset') {
            twiml.message(this.directionService.resetState(body.From));
        } else {
            const directions = await this.directionService.handleUserMsg(body.From, data);
            twiml.message(directions);
        }

        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
    }
}

/*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = new Twilio(accountSid, authToken);
*/
