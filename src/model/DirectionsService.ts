import { TravelMode } from '@googlemaps/google-maps-services-js';
import { UserState, Status } from './State';
import UserStore from './UserStore';
import GoogleAPI from '../web/GoogleAPI';

// flow: Destination => Location => Travel Mode

export default class DirectionsService {
    constructor(
        private store = new UserStore(),
        private googleApi = new GoogleAPI(),
    ) {}

    public stringToTravelMode(msg: string): TravelMode {
        const message = msg.trim().toLowerCase();

        if (['bicycling', 'bike', 'cycle', 'cycling', 'biking'].includes(message)) return TravelMode.bicycling;
        if (['driving', 'drive', 'car'].includes(message)) return TravelMode.driving;
        if (['transit', 'subway', 'bus', 'public transit'].includes(message)) return TravelMode.transit;
        return TravelMode.walking;
    }

    private getState(phoneNumber: string): UserState {
        return this.store.getUserState(phoneNumber) ?? new UserState(phoneNumber);
    }

    private async getDirections(state: UserState): Promise<string> {
        const directions = await this.googleApi.getDirections(
            state.location,
            state.destination,
            state.travelMode,
        );
        const response = directions.splice(0, 10);
        state.directions = directions;

        state.destination = undefined;
        state.location = undefined;
        state.travelMode = undefined;
        state.status = Status.GettingDestination;

        this.store.setUserState(state);
        response.push('\n...send "next" for more directions');
        return response.join('\n');
    }

    private providedDestination(state: UserState, msg: string): string {
        state.destination = msg;
        state.status = Status.GettingLocation;
        this.store.setUserState(state);

        return `Getting directions to ${msg}. Where are you now?`;
    }

    private providedLocation(state: UserState, msg: string): string {
        state.location = msg;
        state.status = Status.GettingTravelMode;
        this.store.setUserState(state);

        return 'How are you travelling? Bicycling/Driving/Transit/Walking';
    }

    private async providedTravelMode(state: UserState, msg: string): Promise<string> {
        state.travelMode = this.stringToTravelMode(msg);
        state.status = Status.GettingDestination;

        return this.getDirections(state);
    }

    private async handleAdvancedCase(state: UserState, msg: string) {
        const firstSplit = msg.split(' from ').map((str) => str.trim());
        const secondSplit = firstSplit[1].split(' to ').map((str) => str.trim());

        state.travelMode = this.stringToTravelMode(firstSplit[0]);
        [state.location, state.destination] = secondSplit;
        state.status = Status.GettingDestination;

        return this.getDirections(state);
    }

    public async handleUserMsg(phoneNumber: string, msg: string): Promise<string> {
        const state: UserState = this.getState(phoneNumber);

        const advancedRegex = new RegExp(/^.+ from .+ to .+$/i);
        if (advancedRegex.test(msg)) {
            return this.handleAdvancedCase(state, msg);
        }

        if (msg.trim().length === 0) return `Invalid message: ${msg}`;

        switch (state.status) {
            case Status.GettingDestination:
                return this.providedDestination(state, msg);
            case Status.GettingLocation:
                return this.providedLocation(state, msg);
            case Status.GettingTravelMode:
                return this.providedTravelMode(state, msg);
            default:
                return `Invalid status: ${state.status}`;
        }
    }

    public getNextDirections(phoneNumber: string): string {
        const state: UserState = this.getState(phoneNumber);

        if (state.directions.length === 0) return 'No directions left!';

        const response = state.directions.splice(0, 10);
        this.store.setUserState(state);

        response.push('\n...send "next" for more directions');
        return response.join('\n');
    }

    public resetState(phoneNumber: string): string {
        const state = new UserState(phoneNumber);
        this.store.setUserState(state);
        return "Your record has been cleared, you're good to go!";
    }
}
