import UserStore from '../../src/model/UserStore';
import { UserState } from '../../src/model/State';

const store = new UserStore();

describe('UserStore', () => {
    test('Can get and set data', () => {
        const phoneNumber = 'testuser';
        const state = new UserState(phoneNumber);
        store.setUserState(state);
        expect(store.getUserState(phoneNumber)).toMatchObject(state);
    });
});
