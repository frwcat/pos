import { atomWithStorage, createJSONStorage } from "jotai/utils";

const sessionStorageAtom = createJSONStorage(() => sessionStorage);

export const VanAtomJotai = atomWithStorage(
    "VanAtom",              //key
    "MLPX",                 //default 값
    sessionStorageAtom,     //Storage
    {
        getOnInit: true     //Storage에 저장된 값 먼저 읽기
    }
);