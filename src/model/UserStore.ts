import NodeCache from 'node-cache';
import { UserState } from './State';

const cache = new NodeCache({ stdTTL: 5 * 60, maxKeys: 1000 });

export default class UserStore {
    public getUserState(phoneNumber: string): UserState {
        return cache.get(phoneNumber);
    }

    public setUserState(state: UserState): void {
        cache.set(state.phoneNumber, state);
    }
}
