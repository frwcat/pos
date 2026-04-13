import { atomWithStorage, createJSONStorage } from "jotai/utils";

const sessionStorageAtom = createJSONStorage(() => sessionStorage);

export const ObjAtomJotai = atomWithStorage(
    "userInfo",
    {name: "", bzn: "", telNo: ""},
    sessionStorageAtom,
    {getOnInit: true}
);