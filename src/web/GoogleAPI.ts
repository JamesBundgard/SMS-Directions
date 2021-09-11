import {
    Client,
    TravelMode,
    Language,
    UnitSystem,
} from '@googlemaps/google-maps-services-js';
import sanitizeHtml from 'sanitize-html';

export default class GoogleAPI {
    public static async getDirections(
        origin: string,
        destination: string,
        mode: TravelMode,
    ): Promise<string[]> {
        try {
            const mapsClient = new Client({});
            const directions = await mapsClient.directions({
                params: {
                    origin,
                    destination,
                    mode,
                    language: Language.en,
                    units: UnitSystem.metric,
                    departure_time: 'now',
                    key: process.env.GOOGLE_API_KEY,
                },
            });

            if (!directions.data.routes[0]) return ['No route found.'];

            const formatted = directions.data.routes[0].legs.map((leg) => {
                const steps = leg.steps.map((step) => `${sanitizeHtml(step.html_instructions, { allowedTags: [] })} (${step.distance.text})`);
                return steps;
            }).flat();

            return formatted;
        } catch (e) {
            return [`Error getting directions: ${JSON.stringify(e)}`];
        }
    }
}
