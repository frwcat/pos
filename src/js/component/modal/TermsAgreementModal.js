import Popup from "../../../components/common/pubComponents/Popup";
import { useEffect, useState } from "react";
import AgreeAllChkBoxThirdType from "../../../components/common/pubComponents/AgreeAllChkBoxThirdType";
import { AD_INFO_RECEIVE, AGREE_AG, AGREE_AH, LINK_TERMS_AGREEMENT_DATA, POS_KCP_CHK_AGREE_DCFFSTPIDS, POS_KFT_CHK_AGREE_DCFFSTPIDS, POS_KIS_CHK_AGREE_REQUIRED_DCFFSTPIDS, POS_KIS_CHK_AGREE_SELECTED_DCFFSTPIDS, POS_KOC_CHK_AGREE_DCFFSTPIDS, POS_NIC_CHK_AGREE_DCFFSTPIDS, POS_N_CHK_AGREE_REQUIRED_DCFFSTPIDS, POS_N_CHK_AGREE_SELECTED_DCFFSTPIDS, POS_N_KIS_TERMS_AGREEMENT_DATA, POS_SMT_CHK_AGREE_REQUIRED_DCFFSTPIDS, POS_SMT_CHK_AGREE_SELECTED_DCFFSTPIDS, POS_Y_CHK_AGREE_REQUIRED_DCFFSTPIDS, POS_Y_TERMS_AGREEMENT_DATA, PRODUCT_SERVICE_GUIDE, STATUS_1000, STATUS_1001, STATUS_1002, STATUS_1003, STATUS_9000, STATUS_9001, STATUS_9002, STATUS_9003, STATUS_9004, STATUS_9005, STATUS_9006, STATUS_9007, STATUS_9014, VAN_KIS } from "../../../code/CommCd";
import { useRecoilValue } from "recoil";
import { CertReplyAtom } from "../../../atom/CertReplyAtom";
import { VanAtom } from "../../../atom/VanAtom";
import { BznAtom } from "../../../atom/BznAtom";
import { POS_CD, POS_MSG_CD, SCB_CD, WORD_CD } from "../../../code/MsgCd";
import { useModal } from "../../../hook/useModal";
import { callGetOpenApi, callMockApi, callOpenApi } from "../../../modules/TokenBase";
import { API_URL_MAPPER } from "../../../api/ApiEnv";
import { ErrorModule } from "../../../modules/ErrorModule";
import { chkBizType } from "../../../modules/Common";
import { CORPORATE_CD, INDIVIDUAL, INDIVIDUAL_CD, UPS_CD } from "../../../code/PosCd";
import { useNavigate } from "react-router";
import { useLoading } from "../../../hook/useLoading";
import { ACOTYPE } from "../../../code/AccountCd";
import FullPopAgree from "../../common/pubComponents/FullPopAgree";
import { SCF_ARR_CD_REVIEW, SCF_CD_204, SCF_CD_205, SCF_CD_602, SCF_CD_801, SCF_CD_802, SCF_CD_803, SCF_CD_804 } from "../../../code/ScfCd";
import { ScfSttsCompeleteModule } from "../../../modules/ScfSttsCompeleteModule";
import { posErrorApi, scfErrorApi } from "../../../modules/ErrorSend";

const TermsAgreementModal = ({setIsAgreeMentOpenFlg }) => {
    const {openLoading, closeLoading} = useLoading();
    const navigate = useNavigate();
    const [agreeMentData, setAgreeMentData] = useState([]);
    const certReplyInfo = useRecoilValue(CertReplyAtom);
    const vanInfo = useRecoilValue(VanAtom);
    const bzn = useRecoilValue(BznAtom);
    const [onFlg, setOnFlg] = useState(false);
    const {openModal} = useModal();
    const [subDataChecked, setSubDataChecked] = useState(true);
    const [allDataChecked, setAllDataChecked] = useState('');
    const [dcffObj, setDcffObj] = useState('');
    const [dcffAgreeFlg, setDcffAgreeFlg] = useState(false)
    const [requiredData, setRequiredData] = useState([]);                         //필수 약관코드
    const [sendArrData, setSendArrData] = useState([]);
    const [sendStrData, setSendStrData] = useState('');
    const [isFAPopOpen, setIsFAPopOpen] = useState(false);

    useEffect(()=> {
        if(bzn == '') {
            navigate('/700')
        }else{
            agreeViewSet();
            agreeCodeRequiredSet();
            setAllDataChecked(true);
        }

    },[])

    useEffect(()=> {
        if(allDataChecked === '') {
            return;
        }else if(allDataChecked===true) {
            agreeCodeinitSet();
            setAllDataChecked('');
        }else{
            setSendArrData([]);
            setAllDataChecked('');
        }
    },[allDataChecked])

    useEffect(()=> {
        if(validationChkEvent()){
            setOnFlg(true);
        }else{
            setOnFlg(false);
        }
    },[sendArrData])

    //약관초기값설정
    const agreeViewSet = () => {
        if(certReplyInfo.posYn === 'Y') {
            setAgreeMentData(POS_Y_TERMS_AGREEMENT_DATA);
        }else if(certReplyInfo.posYn === 'N') {
            //기존 6개에 kis나 특수 링크 담을 배열
            const baseTerms = [...POS_N_KIS_TERMS_AGREEMENT_DATA];

            if(vanInfo === 'MLPX'){
                baseTerms.push(...LINK_TERMS_AGREEMENT_DATA);
            // 2025-02-10 추후 단일 van사 추가 시 확인하기
            }else{
                // VanAtom.vanInfo 값과 LINK_TERMS_AGREEMENT_DATA 의 id 비교 해서 객체 가져오기
                const termsMatched = LINK_TERMS_AGREEMENT_DATA.find(item => item.id === vanInfo);
                
                if(termsMatched){
                    baseTerms.push(termsMatched);
                }
            }
            const merged = baseTerms.concat(POS_Y_TERMS_AGREEMENT_DATA);
            setAgreeMentData(merged);
        }else{
            let modalData = {
                title : POS_MSG_CD.POS_AGREE_NOT_VALUE_ERROR.CD,
                content : POS_MSG_CD.POS_AGREE_NOT_VALUE_ERROR.MSG,
            }
            openModal(modalData);
        }
    }

    //전체 약관 코드
    const agreeCodeinitSet = () => {
        let termsCode = [...POS_Y_CHK_AGREE_REQUIRED_DCFFSTPIDS];

        if(certReplyInfo.posYn === 'Y') {
            setSendArrData([...new Set(termsCode)]);
            return;
        }
        if(certReplyInfo.posYn === 'N') {
            termsCode = termsCode.concat(POS_N_CHK_AGREE_REQUIRED_DCFFSTPIDS);                  // 통합가입 이용신청 pos_n 필수 코드 
            termsCode = termsCode.concat(POS_N_CHK_AGREE_SELECTED_DCFFSTPIDS);                  // 통합가입 이용신청 pos_n 선택 코드 
            if(vanInfo === ''){
                setSendArrData([...new Set(termsCode)]);
                return;
            }else if(vanInfo === 'MLPX'){
                termsCode = termsCode.concat(POS_KIS_CHK_AGREE_REQUIRED_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_KIS_CHK_AGREE_SELECTED_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_SMT_CHK_AGREE_REQUIRED_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_SMT_CHK_AGREE_SELECTED_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_KFT_CHK_AGREE_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_NIC_CHK_AGREE_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_KCP_CHK_AGREE_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_KOC_CHK_AGREE_DCFFSTPIDS);
            // 2025-02-10 추후 단일 van사 추가 시 확인하기
            }else{
                const byVan = {
                    KIS : [...new Set([...POS_KIS_CHK_AGREE_REQUIRED_DCFFSTPIDS, ...POS_KIS_CHK_AGREE_SELECTED_DCFFSTPIDS])],
                    SMT : [...new Set([...POS_SMT_CHK_AGREE_REQUIRED_DCFFSTPIDS, ...POS_SMT_CHK_AGREE_SELECTED_DCFFSTPIDS])],
                    KFT : POS_KFT_CHK_AGREE_DCFFSTPIDS,
                    NIC : POS_NIC_CHK_AGREE_DCFFSTPIDS,
                    KCP : POS_KCP_CHK_AGREE_DCFFSTPIDS,
                    KOC : POS_KOC_CHK_AGREE_DCFFSTPIDS
                };
                if(byVan[vanInfo]) {
                    termsCode = termsCode.concat(byVan[vanInfo]);
                }
            }
        }
        // console.log("전체 약관 코드", termsCode);
        setSendArrData([...new Set(termsCode)]);
    }

    //필수 약관 코드
    const agreeCodeRequiredSet = () => {
        let termsCode = [...POS_Y_CHK_AGREE_REQUIRED_DCFFSTPIDS];

        if(certReplyInfo.posYn === 'Y') {
            setRequiredData([...new Set(termsCode)]);
            return;
        }
        if(certReplyInfo.posYn === 'N') {
            termsCode = termsCode.concat(POS_N_CHK_AGREE_REQUIRED_DCFFSTPIDS);                  // 통합가입 이용신청 pos_n 필수 코드 
            if(vanInfo === ''){
                setRequiredData([...new Set(termsCode)]);
                return;
            }else if(vanInfo === 'MLPX'){
                termsCode = termsCode.concat(POS_KIS_CHK_AGREE_REQUIRED_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_SMT_CHK_AGREE_REQUIRED_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_KFT_CHK_AGREE_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_NIC_CHK_AGREE_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_KCP_CHK_AGREE_DCFFSTPIDS);
                termsCode = termsCode.concat(POS_KOC_CHK_AGREE_DCFFSTPIDS);
                // 2025-02-10 추후 단일 van사 추가 시 확인하기
            }else{
                const byVan = {
                    KIS : POS_KIS_CHK_AGREE_REQUIRED_DCFFSTPIDS,
                    SMT : POS_SMT_CHK_AGREE_REQUIRED_DCFFSTPIDS,
                    KFT : POS_KFT_CHK_AGREE_DCFFSTPIDS,
                    NIC : POS_NIC_CHK_AGREE_DCFFSTPIDS,
                    KCP : POS_KCP_CHK_AGREE_DCFFSTPIDS
                };
                if(byVan[vanInfo]) {
                    termsCode = termsCode.concat(byVan[vanInfo]);
                }
            }
        
        }
        // console.log("필수 약관 코드", termsCode);
        setRequiredData([...new Set(termsCode)]);
    }

    const validationChkEvent = () => {
        // requiredData 값이 sendArrData에 포함되어 있으면 true, 아니면 false
        return requiredData.every(v => sendArrData.includes(v));
    }

    const insertPosAgreeApi = (str) => {
        let param = {
            utlinsttId : UPS_CD,
            dcffStplId : encodeURIComponent(str),                                       //약관 ID
        }
        openLoading();
        callOpenApi(API_URL_MAPPER.POS_INSERT_STPLAT_AGREE , param , function( result ){
        // callMockApi("/mock/posJoinStatus.json", param, function( result ){
            closeLoading();
            if(result.STATUS === "0000") {
                if(certReplyInfo.posYn === 'Y'){
                    //카바 심사 api 호출
                    scfInfoGetApi();
                }else if(certReplyInfo.posYn === 'N'){
                    navigate('/signup/userInfoSuccess');
                }else{
                    let modalData = {
                        title : POS_MSG_CD.POS_AGREE_NOT_VALUE_ERROR.CD,
                        content : POS_MSG_CD.POS_AGREE_NOT_VALUE_ERROR.MSG,
                    }
                    openModal(modalData);
                }
            //에러 처리
            }else {
                posErrorApi(bzn,API_URL_MAPPER.POS_INSERT_STPLAT_AGREE,result,'BOX POS 이용약관 등록');
                let modalData = {
                    title : WORD_CD.ERROR_CD+POS_CD.POS_SERVER_CD,
                    content : result.RSLT_MSG,
                }
                openModal(modalData);
            }
        },function (e) {
            closeLoading();
            posErrorApi(bzn,API_URL_MAPPER.POS_INSERT_STPLAT_AGREE,null,'BOX POS 이용약관 등록');
            // 공통에러처리
            ErrorModule(e);
        });
    }

    const scfInfoGetApi = () => {
        openLoading();
        callGetOpenApi(API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,  function( result ){
        //callMockApi("/mock/scfAplChk.json", {}, function( result ){
            closeLoading();
            if(result.STATUS === "0000") {
                //상태값이동처리
                chkSttsEvent(result);
            }else {
                scfErrorApi(bzn,API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,result,'선정산가능 계좌정보조회,카드매출 바로 입금 서비스 신청하기 가능 여부 확인');
                let modalData = {
                    title : WORD_CD.ERROR_CD + SCB_CD.SCF_SERVER_CD,
                    content : result.RSLT_MSG,
                    //callback: () => alert('modal callback()'),
                }
                openModal(modalData);
            }
        },function (e) {
            closeLoading();
            scfErrorApi(bzn,API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,null,'선정산가능 계좌정보조회,카드매출 바로 입금 서비스 신청하기 가능 여부 확인');
            ErrorModule(e);
        });
        
    }
    const chkSttsEvent = (result) => {
        //상태값 이동처리
        const resultData = result.RSLT_DATA;
        if(resultData.scfStts == SCF_CD_205) {
            ScfSttsCompeleteModule(navigate, bzn, openLoading, closeLoading);
        }else if(resultData.scfStts == SCF_CD_801) {
            scfErrorApi(bzn,API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,result,'선정산 상태 '+resultData.scfStts+ ' 화면 실패 상태 1002 해지신청 중 입니다.');
            navigate(`/signup/cardAuditFail?status=${STATUS_1002}`);
        }else if(resultData.scfStts == SCF_CD_802) {
            scfErrorApi(bzn,API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,result,'선정산 상태 '+resultData.scfStts+ ' 화면 실패 상태 1003 서울보증보험 해지가 완료되지 않은 경우, 카드매출 바로입금 서비스 재신청이 어렵습니다.');
            navigate(`/signup/cardAuditFail?status=${STATUS_1003}`);
        }else if(resultData.scfStts == SCF_CD_803 || resultData.scfStts == SCF_CD_804 || resultData.scfStts == SCF_CD_602) {
            scfErrorApi(bzn,API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,result,'선정산 상태 '+resultData.scfStts+ ' 화면 실패 상태 1001 채권양도통지 해지 여부를 먼저 확인해 주세요.');
            navigate(`/signup/cardAuditFail?status=${STATUS_1001}`);
        }else if(resultData.scfStts == SCF_CD_204) {
            navigate(`/account/landing?acType=${ACOTYPE}`);
        }else if(SCF_ARR_CD_REVIEW.find(v=> v == resultData.scfStts)) {
            scfExmApi();
        }else{
            scfErrorApi(bzn,API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,result,'선정산 상태 '+resultData.scfStts+ ' 화면 실패 상태 1000 고객센터로 문의 부탁드립니다.');
            navigate(`/signup/cardAuditFail?status=${STATUS_1000}`);
        }
    }
    //카바 심사 api
    const scfExmApi = () => {
        if(bzn == ''){
            let modalData = {
                title : POS_MSG_CD.POS_BZN_NOT_VALUE_ERROR.CD,
                content : POS_MSG_CD.POS_BZN_NOT_VALUE_ERROR.MSG,
            }
            openModal(modalData);
            return;
        }
        let param = {
            type :  chkBizType(bzn) == INDIVIDUAL ? INDIVIDUAL_CD : CORPORATE_CD,                                     // 1 : 법인 , 2 : 개인
            rnnUuid : certReplyInfo.rnnUuid
        }
        openLoading();
        callOpenApi(API_URL_MAPPER.SCF_APL_BIZ_CHECK_INQ , param , function( result ){
        // callMockApi("/mock/posScfAplBizChkInq.json", param, function( result ){
            closeLoading();
            if(result.STATUS === "0000") {
                //계좌 로딩창으로 이동
                navigate(`/account/landing?acType=${ACOTYPE}`);
            }else if(result.STATUS === STATUS_9000) {
                // van사가 kis가 아니면 심사후 실패화면 이동
                if(vanInfo !== VAN_KIS){
                    navigate(`/signup/cardAuditFail?status=${result.STATUS}`);
                }else {
                    // van사가 kis면 회원가입 완료 7일 화면 이동
                    navigate('/signup/cardUnregist');
                }
            }else if(result.STATUS === STATUS_9001 || result.STATUS === STATUS_9002 || result.STATUS === STATUS_9003 
            || result.STATUS === STATUS_9004 || result.STATUS === STATUS_9005 || result.STATUS === STATUS_9006
            || result.STATUS === STATUS_9007 || result.STATUS === STATUS_9014) {
                //회원가입 후 심사실패 화면 이동
                navigate(`/signup/cardAuditFail?status=${result.STATUS}`);
            //에러 처리
            }else {
                scfErrorApi(bzn,API_URL_MAPPER.SCF_APL_BIZ_CHECK_INQ,result,'카드매출 바로 입금 서비스 신청하기 사업장 가능 여부 조회(카바 심사)');
                navigate('/500');
            }
        },function (e) {
            closeLoading();
            scfErrorApi(bzn,API_URL_MAPPER.SCF_APL_BIZ_CHECK_INQ,null,'카드매출 바로 입금 서비스 신청하기 사업장 가능 여부 조회(카바 심사)');
            // 공통에러처리
            ErrorModule(e);
        });
    }

    const nextBtnEvent= () => {
        if(onFlg) {
            let filtered = sendArrData.filter((item) => item !== 'XXXXXX').filter(Boolean);
            // AG를 포함하는 값이 하나라도 존재하면 hasAG는 true
            const hasAG = filtered.some(v => v.startsWith(AGREE_AG));
            const hasAH = filtered.some(v => v.startsWith(AGREE_AH));

            if(hasAH){
                if(!filtered.includes(AD_INFO_RECEIVE)){
                    filtered.push(AD_INFO_RECEIVE);
                }
            }else{
                if(filtered.includes(AD_INFO_RECEIVE)){
                    // AD_INFO_RECEIVE = '10120'  가 아닌 값들로만 골라서 만든다.(뺴기)
                    filtered = filtered.filter(v => v !== AD_INFO_RECEIVE)
                }
            }
            if(hasAG){
                if(!filtered.includes(PRODUCT_SERVICE_GUIDE)){
                    filtered.push(PRODUCT_SERVICE_GUIDE);
                }
            }else{
                if(filtered.includes(PRODUCT_SERVICE_GUIDE)){
                    filtered = filtered.filter(v => v !== PRODUCT_SERVICE_GUIDE)
                }
            }
            filtered = [...new Set(filtered)];
            const str = filtered.join(',');
            // console.log("param", str);
            // 등록 api
            insertPosAgreeApi(str);
        }
    }

    return(
        <>        
            <Popup className="halflayerPop" isOpen={true} isClose={() => setIsAgreeMentOpenFlg(false)}>
                {({isClose}) => (
                <div className="layerPopCont">
                    <div className="popHeader">
                        <p className="popTitle">약관동의</p>
                        <button className="btnPopClose" onClick={isClose}>팝업창 닫기</button>
                    </div>
                    <div className="con maxHScroll">
                        <div className="pBox02440 addBtn">
                            <div className="b2 txtGray700 mb16">
                                카드매출 바로입금 서비스 이용을 위해 약관동의가 필요해요.
                            </div>
                            <div className="agreeChkWrap">
                                {agreeMentData != '' ? <AgreeAllChkBoxThirdType dataName={agreeMentData} uniqueId="agree1" allTitle="모두 동의합니다" 
                                allDataChecked={allDataChecked} setAllDataChecked={setAllDataChecked} 
                                subDataChecked={subDataChecked} setSubDataChecked={setSubDataChecked} 
                                sendArrData={sendArrData} setSendArrData={setSendArrData} 
                                dcffObj={dcffObj} setDcffObj={setDcffObj} setIsFAPopOpen={setIsFAPopOpen}
                                dcffAgreeFlg={dcffAgreeFlg} setDcffAgreeFlg={setDcffAgreeFlg}/>  : <></>}
                            </div>
                        </div>
                        <div className="popBtnGroupWrap">
                            <button className={`popbtn btn fillBtn ${onFlg ? 'on' : ''}`} onClick={nextBtnEvent}>모두 동의하고 다음</button>
                        </div>
                    </div>
                </div>
                )}
            </Popup>
            {isFAPopOpen ? <FullPopAgree btnVw={WORD_CD.AGREE} isFAPopOpen={isFAPopOpen} setIsFAPopOpen={setIsFAPopOpen} subItem={dcffObj} setDcffAgreeFlg={setDcffAgreeFlg}/> : <></>}
        </>
    )
}
export default TermsAgreementModal;