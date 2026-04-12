import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Detail from "./js/page/Detail";
import Home from "./js/page/Home";
import VanTest from "./js/page/VanTest";

const Router = () => {

    return(
        <RecoilRoot>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/detail" element={<Detail />} />
                    <Route path="/vanTest" element={<VanTest />} />
                </Routes>
            </BrowserRouter>
        </RecoilRoot>
    )
}
export default Router;