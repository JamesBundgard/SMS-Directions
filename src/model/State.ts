import { TravelMode } from '@googlemaps/google-maps-services-js';

export enum Status {
    GettingDestination,
    GettingLocation,
    GettingTravelMode,
}

export class UserState {
    constructor(
        public phoneNumber: string,
        public status: Status = Status.GettingDestination,
        public destination: string | null | undefined = undefined,
        public location: string | null | undefined = undefined,
        public travelMode: TravelMode | null | undefined = undefined,
        public directions: string[] = [],
    ) { }
}
