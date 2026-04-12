import { recoilPersist } from "recoil-persist";

export const PERSIST_KEY = 'recoil-persist';

const persistConfig = {
    key: PERSIST_KEY,
    storage: sessionStorage
};

export const purgeStoredState = () => {
    sessionStorage.removeItem(PERSIST_KEY);
}

export const {persistAtom} = recoilPersist(persistConfig);