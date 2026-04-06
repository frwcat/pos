import { atom } from "recoil";

const 
export const VanAtom = atom({
    key : "VanAtom",
    default : "MLPX",
    effects_UNSTABLE : [persistAtom]
})