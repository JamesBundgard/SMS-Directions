import GoogleAPI from '../../src/web/GoogleAPI';
import { Client, DirectionsResponse, DirectionsRequest, TravelMode, Language, UnitSystem } from '@googlemaps/google-maps-services-js';
import response from './DirectionsApiResponse';

const directionsRequest = jest.fn((req: DirectionsRequest) => {
    return Promise.resolve({} as DirectionsResponse);
});

const client = {
    directions: directionsRequest as any,
} as Client;

const api = new GoogleAPI(client);


describe('GET directions', () => {
    test('walk from a to b', async () => {
        directionsRequest.mockResolvedValueOnce(response);
        const directions = await api.getDirections('a', 'b', TravelMode.walking);

        expect(directionsRequest).toBeCalledWith({
            params: {
                origin: 'a',
                destination: 'b',
                mode: TravelMode.walking,
                language: Language.en,
                units: UnitSystem.metric,
                departure_time: 'now',
                key: process.env.GOOGLE_API_KEY,
            }
        });

        expect(directions).toMatchObject([
            "Head north on S Morgan St toward W Cermak Rd (0.1 mi)",
            "Head north on S Morgan St toward W Cermak Rd (0.1 mi)",
            "Head north on S Morgan St toward W Cermak Rd (0.1 mi)",
            "Head north on S Morgan St toward W Cermak Rd (0.1 mi)"
        ]);
    });

    test('no routes found', async () => {
        directionsRequest.mockResolvedValueOnce({ data: { routes: [] }} as any);
        const directions = await api.getDirections('a', 'b', TravelMode.walking);

        expect(directionsRequest).toBeCalledWith({
            params: {
                origin: 'a',
                destination: 'b',
                mode: TravelMode.walking,
                language: Language.en,
                units: UnitSystem.metric,
                departure_time: 'now',
                key: process.env.GOOGLE_API_KEY,
            }
        });

        expect(directions).toMatchObject(['No route found.']);
    });

    test('throws error', async () => {
        directionsRequest.mockImplementationOnce((req) => {
            throw new Error('test error');
        });
        const directions = await api.getDirections('a', 'b', TravelMode.walking);

        expect(directionsRequest).toBeCalledWith({
            params: {
                origin: 'a',
                destination: 'b',
                mode: TravelMode.walking,
                language: Language.en,
                units: UnitSystem.metric,
                departure_time: 'now',
                key: process.env.GOOGLE_API_KEY,
            }
        });

        expect(directions).toMatchObject([`Error getting directions: {\"stack\":\"Error: test error\\n    at Object.<anonymous> (C:\\\\Code\\\\SMS-Directions\\\\test\\\\web\\\\GoogleAPI.test.ts:62:19)\\n    at C:\\\\Code\\\\SMS-Directions\\\\node_modules\\\\jest-mock\\\\build\\\\index.js:445:39\\n    at Object.<anonymous> (C:\\\\Code\\\\SMS-Directions\\\\node_modules\\\\jest-mock\\\\build\\\\index.js:453:13)\\n    at Object.mockConstructor [as directions] (C:\\\\Code\\\\SMS-Directions\\\\node_modules\\\\jest-mock\\\\build\\\\index.js:107:19)\\n    at GoogleAPI.<anonymous> (C:\\\\Code\\\\SMS-Directions\\\\src\\\\web\\\\GoogleAPI.ts:20:50)\\n    at Generator.next (<anonymous>)\\n    at C:\\\\Code\\\\SMS-Directions\\\\src\\\\web\\\\GoogleAPI.ts:1143:40\\n    at new Promise (<anonymous>)\\n    at Object.<anonymous>.__awaiter (C:\\\\Code\\\\SMS-Directions\\\\src\\\\web\\\\GoogleAPI.ts:1086:10)\\n    at GoogleAPI.getDirections (C:\\\\Code\\\\SMS-Directions\\\\src\\\\web\\\\GoogleAPI.ts:1199:12)\",\"message\":\"test error\"}`]);
    });

    test('create without mocked api', () => {
        const api = new GoogleAPI();
        expect(api).not.toBeUndefined(); 
    });
});
