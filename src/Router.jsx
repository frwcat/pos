import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Detail from "./js/page/Detail";
import Home from "./js/page/Home";

const Router = () => {

    return(
        <RecoilRoot>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/detail" element={<Detail />} />
                </Routes>
            </BrowserRouter>
        </RecoilRoot>
    )
}
export default Router;