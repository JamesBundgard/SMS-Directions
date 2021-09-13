import DirectionsService from "../../src/model/DirectionsService";
import UserStore from "../../src/model/UserStore";
import GoogleAPI from "../../src/web/GoogleAPI";
import { UserState, Status } from "../../src/model/State";
import { TravelMode } from "@googlemaps/google-maps-services-js";

const store = {
    getUserState: jest.fn(),
    setUserState: jest.fn()
};

const api = {
    getDirections: jest.fn()
};

const service = new DirectionsService(store, api as any);
const phoneNumber = "testuser";

describe("DirectionsService", () => {
    beforeEach(() => {
        store.getUserState.mockClear();
        store.setUserState.mockClear();
        api.getDirections.mockClear();
    });

    test("reset", () => {
        store.setUserState.mockImplementationOnce(state => {});
        const res = service.resetState(phoneNumber);

        expect(res).toBe("Your record has been cleared, you're good to go!");
        expect(store.setUserState).toBeCalledWith(new UserState(phoneNumber));
    });

    test("next directions -- some still left", () => {
        const directions = Array.from(Array(20).keys()).map(x => `${x}`);
        store.getUserState.mockReturnValueOnce({ directions });

        const res = service.getNextDirections(phoneNumber);
        expect(res).toBe(Array.from(Array(10).keys()).map(x => `${x}`)
            .join("\n") + '\n\n...send "next" for more directions');

        expect(store.setUserState).toBeCalledWith({
            directions: Array.from(Array(10).keys()).map(x => `${x + 10}`)
        });
    });

    test("next directions -- empty", () => {
        const directions: string[] = [];
        store.getUserState.mockReturnValueOnce({ directions });

        const res = service.getNextDirections(phoneNumber);
        expect(res).toBe('No directions left!');

        expect(store.setUserState).not.toBeCalled();
    });

    test("next directions -- last few", () => {
        const directions = Array.from(Array(5).keys()).map(x => `${x}`);
        store.getUserState.mockReturnValueOnce({ directions });

        const res = service.getNextDirections(phoneNumber);
        expect(res).toBe(Array.from(Array(5).keys()).map(x => `${x}`)
            .join("\n") + '\n\n...send "next" for more directions');

        expect(store.setUserState).toBeCalledWith({
            directions: []
        });
    });

    test("next directions -- state not found", () => {
        store.getUserState.mockReturnValueOnce(undefined);

        const res = service.getNextDirections(phoneNumber);
        expect(res).toBe('No directions left!');

        expect(store.setUserState).not.toBeCalled();
    });

    test("directions -- invalid status", async () => {
        store.getUserState.mockReturnValueOnce({ status: undefined });
        const res = await service.handleUserMsg(phoneNumber, "test");
        expect(res).toBe('Invalid status: undefined');
    });

    test("directions -- advanced", async () => {
        store.getUserState.mockReturnValueOnce({
            phoneNumber,
            status: Status.GettingLocation
        });
        api.getDirections.mockResolvedValueOnce(["a", "b", "c"]);
        const res = await service.handleUserMsg(phoneNumber, "walk from a to b");

        expect(api.getDirections).toBeCalledWith("a", "b", TravelMode.walking);
        expect(store.setUserState).toBeCalledWith({
            status: Status.GettingDestination,
            directions: [],
            phoneNumber
        });
        expect(res).toBe('a\nb\nc\n\n...send "next" for more directions');
    });

    test("directions -- getting destination", async () => {
        store.getUserState.mockReturnValueOnce({
            phoneNumber,
            status: Status.GettingDestination
        });

        const res = await service.handleUserMsg(phoneNumber, "dest");

        expect(api.getDirections).not.toBeCalled();
        expect(store.setUserState).toBeCalledWith({
            status: Status.GettingLocation,
            destination: "dest",
            phoneNumber
        });
        expect(res).toBe('Getting directions to dest. Where are you now?');
    });

    test("directions -- getting location", async () => {
        store.getUserState.mockReturnValueOnce({
            phoneNumber,
            destination: "dest",
            status: Status.GettingLocation
        });

        const res = await service.handleUserMsg(phoneNumber, "here");

        expect(api.getDirections).not.toBeCalled();
        expect(store.setUserState).toBeCalledWith({
            status: Status.GettingTravelMode,
            destination: "dest",
            location: "here",
            phoneNumber
        });
        expect(res).toBe('How are you travelling? Bicycling/Driving/Transit/Walking');
    });

    test("directions -- geeting travel mode", async () => {
        store.getUserState.mockReturnValueOnce({
            status: Status.GettingTravelMode,
            destination: "dest",
            location: "here",
            phoneNumber
        });
        api.getDirections.mockResolvedValueOnce(["a", "b", "c"]);
        const res = await service.handleUserMsg(phoneNumber, "walk");

        expect(api.getDirections).toBeCalledWith("here", "dest", TravelMode.walking);
        expect(store.setUserState).toBeCalledWith({
            status: Status.GettingDestination,
            directions: [],
            phoneNumber
        });
        expect(res).toBe('a\nb\nc\n\n...send "next" for more directions');
    });

    test("directions -- empty message", async () => {
        store.getUserState.mockReturnValueOnce({});
        const res = await service.handleUserMsg(phoneNumber, "");
        expect(res).toBe("Invalid message: ");
        expect(store.setUserState).not.toBeCalled();
        expect(api.getDirections).not.toBeCalled();
    });

    test("directions -- whitespace message", async () => {
        store.getUserState.mockReturnValueOnce({});
        const res = await service.handleUserMsg(phoneNumber, " \t  \n");
        expect(res).toBe("Invalid message:  \t  \n");
        expect(store.setUserState).not.toBeCalled();
        expect(api.getDirections).not.toBeCalled();
    });

    test('create without mocks', () => {
        const service = new DirectionsService();
        expect(service).not.toBeUndefined();
    });

    test.each([
        ['bicycling', TravelMode.bicycling],
        ['bike', TravelMode.bicycling],
        ['biking', TravelMode.bicycling],
        ['cycle', TravelMode.bicycling],
        ['cycling', TravelMode.bicycling],
        ['driving', TravelMode.driving],
        ['drive', TravelMode.driving],
        ['car', TravelMode.driving],
        ['transit', TravelMode.transit],
        ['subway', TravelMode.transit],
        ['bus', TravelMode.transit],
        ['public transit', TravelMode.transit],
        ['walk', TravelMode.walking],
        ['walking', TravelMode.walking],
        ['run', TravelMode.walking],
        ['running', TravelMode.walking],
    ])(
        '%s should become %s',
        (msg, expected) => {
            expect(service.stringToTravelMode(msg)).toBe(expected);
        },
    );

    test.each([
        ['bicycling  ', TravelMode.bicycling],
        ['\nbike', TravelMode.bicycling],
        ['  biking', TravelMode.bicycling],
        ['  cycle  ', TravelMode.bicycling],
        ['cycling\n', TravelMode.bicycling],
        ['DriviNg', TravelMode.driving],
        ['DRIVE   ', TravelMode.driving],
        ['CAR', TravelMode.driving],
        ['Transit\n', TravelMode.transit],
        ['\nsubwaY', TravelMode.transit],
        [' BUS ', TravelMode.transit],
        ['            Public Transit', TravelMode.transit],
        ['\twAlK\n\n\t\t', TravelMode.walking],
        ['\nwalkING      ', TravelMode.walking],
        ['rUn\n  \n', TravelMode.walking],
        ['\t\t\t\t\n\truNNinG ', TravelMode.walking],
    ])(
        '%s should become %s',
        (msg, expected) => {
            expect(service.stringToTravelMode(msg)).toBe(expected);
        },
    );
});
