import { atom } from "recoil";
import { persistAtom } from "./Persist";

export const VanAtom = atom({
    key : "VanAtom",
    default: 'MLPX',
    effects_UNSTABLE : [persistAtom]
});