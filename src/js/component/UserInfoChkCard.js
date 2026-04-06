import ClearInput from "../common/pubComponents/ClearInput";
import FakeSelectbox from "../common/pubComponents/FakeSelectbox";
import UserInfoCard from "./UserInfoCard";
import { useEffect, useState } from "react"
import EmailAddressCard from "./EmailAddressCard";
import BusinessPhoneNmCard from "./BusinessPhoneNmCard";
import { autoHypenPhone, chkBizType, removeS, rightEmail } from "../../modules/Common";
import { POS_MSG_CD, SCB_CD, WORD_CD } from "../../code/MsgCd";
import { useModal } from "../../hook/useModal";
import { ErrorModule } from "../../modules/ErrorModule";
import { useLoading } from "../../hook/useLoading";
import { useRecoilValue } from "recoil";
import { BznAtom } from "../../atom/BznAtom";
import { callGetOpenApi, callMockApi, callOpenApi, callOpenApiNonAuth, parseJwt } from "../../modules/TokenBase";
import { INPUT_MAXLENGTH_150, INPUT_MAXLENGTH_8, INTT_CODE, RECOMMAND_BRNM, RECOMMEND_ORG_CODE, STATUS_1000, STATUS_1001, STATUS_1002, STATUS_1003, STATUS_9000, STATUS_9001, STATUS_9002, STATUS_9003, STATUS_9004, STATUS_9005, STATUS_9006, STATUS_9007, STATUS_9014, TYPE_MD, VAN_KIS } from "../../code/CommCd";
import RecommendOrgCard from "./RecommendOrgCard";
import { CORPORATE, CORPORATE_CD, INDIVIDUAL, INDIVIDUAL_CD } from "../../code/PosCd";
import RecommendBranchModal from "../signup/modal/RecommendBranchModal";
import ClearSearchInputReadOnly from "../common/pubComponents/ClearSearchInputReadOnly";
import { API_URL_MAPPER } from "../../api/ApiEnv";
import { CertReplyAtom } from "../../atom/CertReplyAtom";
import { UserAtom } from "../../atom/UserAtom";
import { VanAtom } from "../../atom/VanAtom";
import { AuthTypeAtom } from "../../atom/AuthTypeAtom";
import { ACOTYPE } from "../../code/AccountCd";
import { useNavigate } from "react-router";
import { ScfSttsCompeleteModule } from "../../modules/ScfSttsCompeleteModule";
import { SCF_ARR_CD_REVIEW, SCF_CD_201, SCF_CD_202, SCF_CD_204, SCF_CD_205, SCF_CD_402, SCF_CD_403, SCF_CD_404, SCF_CD_405, SCF_CD_406, SCF_CD_407, SCF_CD_408, SCF_CD_409, SCF_CD_602, SCF_CD_801, SCF_CD_802, SCF_CD_803, SCF_CD_804 } from "../../code/ScfCd";
import { posErrorApi, scfErrorApi } from "../../modules/ErrorSend";
import { BankCdAtom } from "../../atom/BankCdAtom";
import { RecOrgAtom } from "../../atom/RecOrgAtom";
import RpprCompareModal from "./modal/RpprCompareModal";

const UserInfoChkCard = () => {
    const navigate = useNavigate();
    const [recommendBranchFlg, setRecommendBranchFlg] = useState(false);
    const [searchInfo, setSearchInfo] = useState({
        krnBrm : '',
        brcd : ''
    })
    const [emailValue, setEmailValue] = useState('');
    const [emailId, setEmailId] = useState('');
    const [emailDvalue, setEmailDvalue] = useState('');
    const [directFlg, setDirectFlg] = useState(false);
    const [bizPhoneValue, setBizPhoneValue] = useState('');
    const [hideAgencyInput, setHideAgencyInput] = useState(false);                              //추천대리점 숨김 처리
    const [clickZoneBtn, setClickZoneBtn] = useState(false);                                    //추천대리점 클릭시 토글
    const [onClickZonFlg, setOnClickZonFlg] = useState(false);                                  //추천대리점/영업점/기관 flg
    const [userInfoData, setUserInfoData] = useState('');                                       // 신청자정보 api 담을 변수
    const [recommendOrgInfoData, setRecommendOrgInfoData] = useState([]);                       // 추천기관 api 담을 변수
    const [recommendOrgSelectedValue, setRecommendOrgSelectedValue] = useState('');
    const {openModal} = useModal();
    const {openLoading, closeLoading} = useLoading();
    const certReplyInfo = useRecoilValue(CertReplyAtom);
    const vanInfo = useRecoilValue(VanAtom);
    const bzn = useRecoilValue(BznAtom);
    const authTypeInfo = useRecoilValue(AuthTypeAtom);
    const userInfo = useRecoilValue(UserAtom);
    const bankCd = useRecoilValue(BankCdAtom);
    const recOrgCd = useRecoilValue(RecOrgAtom);
    const [onFlg, setOnFlg] = useState(false);
    const [chkBznValue, setChkBznValue] = useState('');
    const [focusFlg, setFocusFlg] = useState(false);                                            //전화번호 포커스 Flg
    const [rpprCompareFlg, setRpprCompareFlg] = useState(false);                                //대표자여부확인모달
    //TODO 김중우 : 추천 대리점은 보류점
    const cateOptions2 =[
        {value: 'Option2_1', label: 'VAN1'},
        {value: 'Option2_2', label: 'VAN2'},
        {value: 'Option2_3', label: 'VAN3'},
        {value: 'Option2_4', label: 'VAN4'},
        {value: 'Option2_5', label: 'VAN5'},
    ]
    useEffect(()=> {
        if(bzn == '' ) {
            navigate('/700')
        }else{
            chkBznEvent();
        }
        
    },[]);

    useEffect(()=> {
        if(bizPhoneValue.length>20){
            setBizPhoneValue(bizPhoneValue.slice(0,20));
            return;
        }
    },[bizPhoneValue]);

    useEffect(()=> {
        if(!focusFlg){
            setBizPhoneValue(autoHypenPhone(bizPhoneValue));
        }
    },[focusFlg]);

    useEffect(()=> {
        if(recommendOrgInfoData.length>0 && recOrgCd !='') {
            const recItem = recommendOrgInfoData.find(item => item.value == recOrgCd);
            if(recItem==undefined) return;
            else  {
                setRecommendOrgSelectedValue(recItem.value);
                
            }
        }
    },[recommendOrgInfoData]);

    useEffect(()=> {
        if(validationEvent()){
            setOnFlg(true);
        }else{
            setOnFlg(false);
        }
    },[directFlg, bizPhoneValue, emailId, emailDvalue, emailValue, userInfoData, certReplyInfo]);

    useEffect(()=> {
        if(onClickZonFlg){
            setClickZoneBtn(true);
        }
    },[onClickZonFlg]);

    useEffect(() => {
        if(searchInfo.krnBrm != '' || recommendOrgSelectedValue !='') {
            setOnClickZonFlg(true);
        }
    },[searchInfo,recommendOrgSelectedValue])

    const bznTypeEvent = () => {
        if(chkBizType(bzn) == INDIVIDUAL){
            setChkBznValue(INDIVIDUAL);
            if(authTypeInfo === TYPE_MD){
                individualCardStoreInfoApi();
            }else{
                corporateCardStoreInfoApi();
            }
        }else{
            setChkBznValue(CORPORATE);
            corporateCardStoreInfoApi();
        }
    }
    const chkBznEvent = () => {
        if(bzn == '' || authTypeInfo == '' || userInfo.lgnMnbrNm == ''){
            let modalData = {
                title : WORD_CD.ERROR_CD + POS_MSG_CD.POS_AGREE_NOT_VALUE_ERROR.CD,
                content : POS_MSG_CD.POS_AGREE_NOT_VALUE_ERROR.MSG,
            }
            openModal(modalData);
            return;
        }
        try{
            chkBizType(bzn);
        }catch{
            navigate("/700");
        }
        bznTypeEvent();
        comCdCtlgInqApi();
        if(bankCd != ''){
            qrBankChkApi();
        }
    }

    //QR 영업점
    const qrBankChkApi = () => {
        let param = {
            brcd : bankCd
        }
        callOpenApiNonAuth(API_URL_MAPPER.POS_QR_RSPB_BOB_NM_DTL_INQ, param, function( result ){
            const addResult = {
                ...result,
                RSLT_MSG : result?.RSLT_MSG ?? null,
                SYS_MSG_CD : result?.SYS_MSG_CD ?? null,
            }
            if(addResult.STATUS == "0000"){
                searchInfo.brcd = addResult.DATA[0].brcd;
                searchInfo.krnBrm = addResult.DATA[0].krnBrm;
            }else{
                posErrorApi(bzn,API_URL_MAPPER.POS_QR_RSPB_BOB_NM_DTL_INQ,addResult,'QR 영업점');
            }
        },function (e) {
            posErrorApi(bzn,API_URL_MAPPER.POS_QR_RSPB_BOB_NM_DTL_INQ,null,'QR 영업점');
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
                    title : SCB_CD.SCF_SERVER_CD,
                    content : result.RSLT_MSG,
                    //callback: () => alert('modal callback()'),
                }
                openModal(modalData);
            }
        },function (e) {
            closeLoading();
            scfErrorApi(bzn,API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,null,'선정산가능 계좌정보조회,카드매출 바로 입금 서비스 신청하기 가능 여부 확인');
            // 공통에러처리
            ErrorModule(e);
        });
        
    }
    const chkSttsEvent = (result) => {
        //상태값 이동처리
        const resultData = result.RSLT_DATA;
        if(resultData.scfStts == SCF_CD_205) {
            ScfSttsCompeleteModule(navigate, bzn, openLoading, closeLoading);
        }else if(resultData.scfStts == SCF_CD_801) {
            scfErrorApi(bzn,API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,result, '선정산 상태 '+resultData.scfStts+ ' 화면 실패 상태 1002 해지신청 중 입니다.');
            navigate(`/signup/cardAuditFail?status=${STATUS_1002}`);
        }else if(resultData.scfStts == SCF_CD_802) {
            scfErrorApi(bzn,API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,result, '선정산 상태 '+resultData.scfStts+ ' 화면 실패 상태 1003 서울보증보험 해지가 완료되지 않은 경우, 카드매출 바로입금 서비스 재신청이 어렵습니다.');
            navigate(`/signup/cardAuditFail?status=${STATUS_1003}`);
        }else if(resultData.scfStts == SCF_CD_803 || resultData.scfStts == SCF_CD_804 || resultData.scfStts == SCF_CD_602) {
            scfErrorApi(bzn,API_URL_MAPPER.SCF_CHK_ACCOUNT_URL,result, '선정산 상태 '+resultData.scfStts+ ' 화면 실패 상태 1001 채권양도통지 해지 여부를 먼저 확인해 주세요.');
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
        let param = {
            type : chkBizType(bzn) == INDIVIDUAL ? INDIVIDUAL_CD : CORPORATE_CD,                                     // 1 : 법인 , 2 : 개인
            rnnUuid : certReplyInfo.rnnUuid,
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
                }else{
                    // van사가 kis면 회원가입 완료 7일 화면 이동
                    navigate('/signup/cardUnregist');
                }
            }else if(result.STATUS === STATUS_9001 || result.STATUS === STATUS_9002 || result.STATUS === STATUS_9003 
            || result.STATUS === STATUS_9004 || result.STATUS === STATUS_9005 || result.STATUS === STATUS_9006
            || result.STATUS === STATUS_9007 || result.STATUS === STATUS_9014) {
                //회원가입 후 심사실패 화면 이동
                navigate(`/signup/cardAuditFail?status=${result.STATUS}`);
            //에러 처리
            } else {
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

    //벨리데이션체크
    const validationEvent = () => {
        if(chkBizType(bzn) == INDIVIDUAL){
            return individualValidationEvent();
        }else{
            return corporateValidationEvent();
        }
    }

    //개인일 때 벨리데이션 체크
    const individualValidationEvent = () => {
        if(removeS(bizPhoneValue).length < INPUT_MAXLENGTH_8) {
            return false;
        }
        if(emailId === '' || userInfoData.rpprNm === '' || certReplyInfo.phoneNm === '' || userInfoData.afstNm === '' || userInfoData.bizrno === '') {
            return false;
        }
        if(directFlg) {
            if(emailDvalue === '') {
                return false;
            }
            if(!rightEmail(emailId+'@'+emailDvalue)) {
                return false;
            }
        }else {
            if(emailValue === '') {
                return false;
            }
            if(!rightEmail(emailId+'@'+emailValue)) {
                return false;
            }
        }
        return true;
    }

    //법인일 때 벨리데이션 체크
    const corporateValidationEvent = () => {
        if(emailId === '' || userInfoData.rpprNm === '' || certReplyInfo.phoneNm === '' 
        || userInfoData.afstNm === '' || userInfoData.bizrno === '' || userInfoData.cgn === ''){
            return false;
        }
        if(removeS(bizPhoneValue).length < INPUT_MAXLENGTH_8) {
            return false;
        }
        if(directFlg){
            if(emailDvalue === ''){
                return false;
            }
            if(!rightEmail(emailId+'@'+emailDvalue)) {
                return false;
            }
        }else{
            if(emailValue === ''){
                return false;
            }
            if(!rightEmail(emailId+'@'+emailValue)) {
                return false;
            }
        }
        return true;
    }

    const chkRpprNmEvent = (bType, data) => {
        if(userInfo.lgnMnbrNm == '') {
            setRpprCompareFlg(true);
            return;
        }
        if(bType==INDIVIDUAL) {
            const chkNmRslt = data.rpprNm + data.busiPtNm;
            if(chkNmRslt.includes(userInfo.lgnMnbrNm)){
                setUserInfoData(data);
            }else{
                setRpprCompareFlg(true);
            }
        }else{
            const chkNmRslt = data.rpprNm;
            if(chkNmRslt.includes(userInfo.lgnMnbrNm)){
                setUserInfoData(data);
            }else{
                setRpprCompareFlg(true);
            }
        }

    }

    //신청자 기본 정보(개인) api
    const individualCardStoreInfoApi = () => {
        let param = {
            rnnUuid : certReplyInfo.rnnUuid,
            bizNo : bzn
        }
        openLoading();
        callOpenApi(API_URL_MAPPER.POS_PBMD_BSNN_CRTF_INQ , param , function( result ){
        //callMockApi("/mock/individualCardStoreInfo.json", {}, function( result ){
            closeLoading();
            // 성공 처리
            if(result.STATUS === "0000") {
                chkRpprNmEvent(INDIVIDUAL,result.RSLT_DATA);
            //에러 처리
            }else {
                posErrorApi(bzn,API_URL_MAPPER.POS_PBMD_BSNN_CRTF_INQ,result,'공공마이데이터 사업자증명원조회');
                let modalData = {
                    title : WORD_CD.ERROR_CD + result.SYS_MSG_CD,
                    content : result.RSLT_MSG,
                }
                openModal(modalData);
            }
        },function (e) {
            closeLoading();
            posErrorApi(bzn,API_URL_MAPPER.POS_PBMD_BSNN_CRTF_INQ,null,'공공마이데이터 사업자증명원조회');
            // 공통에러처리
            ErrorModule(e);
        });
    }

    //신청자 기본 정보(법인) api
    const corporateCardStoreInfoApi = () => {
        let param = {
            bizNo : bzn
        }
        openLoading();
        callOpenApiNonAuth(API_URL_MAPPER.POS_GET_CERT_DATA , param , function( result ){
        // callMockApi("/mock/corporateCardStoreInfo.json", {}, function( result ){
            closeLoading();
            // 성공 처리
            if(result.STATUS === "0000") {
                chkRpprNmEvent(CORPORATE,result.RSLT_DATA);
            //에러 처리
            }else {
                posErrorApi(bzn,API_URL_MAPPER.POS_GET_CERT_DATA,result,'스크래핑 인증서 데이터 조회');
                let modalData = {
                    title : WORD_CD.ERROR_CD + result.SYS_MSG_CD,
                    content : result.RSLT_MSG,
                }
                openModal(modalData);
            }
        },function (e) {
            closeLoading();
            posErrorApi(bzn,API_URL_MAPPER.POS_GET_CERT_DATA,null,'스크래핑 인증서 데이터 조회');
            // 공통에러처리
            ErrorModule(e);
        });
    }

    // 추천기관 api
    const comCdCtlgInqApi = () => {
        let param = {
            groupCodeId: RECOMMEND_ORG_CODE,
        }
        callOpenApiNonAuth(API_URL_MAPPER.POS_COM_CD_CTLG_INQ , param , function( result ){
        //callMockApi("/mock/comCdCtlgInq.json", {}, function( result ){
            const addResult = {
                ...result,
                RSLT_MSG : result?.RSLT_MSG ?? null,
                SYS_MSG_CD : result?.SYS_MSG_CD ?? null,
            }
            // 성공 처리
            if(addResult.STATUS === "0000") {
                setRecommendOrgInfoData(addResult.RSLT_LIST.map(item => ({
                    value: item.cmmnCodeId,
                    label: item.cmmnCodeNm
                })));
            //에러 처리
            }else {
                posErrorApi(bzn,API_URL_MAPPER.POS_COM_CD_CTLG_INQ,addResult,'추천기관');
            }
        },function (e) {
            posErrorApi(bzn,API_URL_MAPPER.POS_COM_CD_CTLG_INQ,null,'추천기관');
        });
    }

    const recommendBranchModalEvent = () => {
        setRecommendBranchFlg(true);
    }

 
    
    //추천대리점 클릭시 토글
    const handdleClickZone = () => {
        setClickZoneBtn(prev => !prev);
    };

    //다음 버튼
    const nextBtnEvent = () => {
        if(onFlg){
            let param = {
                token: parseJwt(sessionStorage.getItem("SI")).accessToken,                                                                                                                                                    //어디서 가져옴?
                userNm: userInfo.lgnMnbrNm,                                                                                                                                         //사용자명(본인인증한 유저명)           공마 대표자명으로 넣어도 되나?
                userTpn: certReplyInfo.phoneNm,                                                                                                                                     //본인인증한 전화번호                                                                                                    
                afstTpn: removeS(bizPhoneValue),                                                                                                                                             //매장연락처 어디서 가져옴?             이게 사업자연락처?
                type:authTypeInfo,                                                                                                                            
                bizrno: bzn,                                                                                                                                                        //사업자번호
                jurirno: chkBznValue === INDIVIDUAL ? '' : userInfoData?.cgn,                                                                                                       //법인번호 (개인일때는 공백 고정값)
                corpIncrYmd: userInfoData?.corpIncrYmd,                                                                                                                              //개업일자
                bplcNm: window.btoa(encodeURIComponent(userInfoData?.afstNm)),                                                                                                        //사업장명
                rprsntvNm: userInfoData?.rpprNm,                                                                                                                                     //대표자명
                reprsntTelno: certReplyInfo.phoneNm,                                                                                                                                //대표자전화번호                        대표자여부 확인했으니까 상관없을듯?
                userEmail: directFlg ? window.btoa(encodeURIComponent(emailId+'@'+emailDvalue)) : window.btoa(encodeURIComponent(emailId+'@'+emailValue)),                          //이메일
                bzstNm: '',                                                                                                                                                         //업태
                bzstNmVan: userInfoData.bzstNm ? window.btoa(encodeURIComponent(userInfoData?.bzstNm)) : '',                                                                                                   //업태(KIS)                             ??? 정의서에는 없지만 ua에는 존재
                tpbsNm: userInfoData.tpbsNm ? window.btoa(encodeURIComponent(userInfoData?.tpbsNm)) : '',                                                                                                       //업종
                afstZpcd: userInfoData.afstZpcd ? userInfoData?.afstZpcd : '',                                                                                                                                    //우편번호
                afstAdr: userInfoData.afstAdr ? window.btoa(encodeURIComponent(userInfoData?.afstAdr)) : '',                                                                                                     //주소
                rpprBirtYmd: userInfoData.rpprBirtYmd ? userInfoData?.rpprBirtYmd : '',                                                                                                                              //대표자생년월일                        주민등록번호에서 가져와야하나? 앞에 19인지 20인지는 뒷자리 첫번째자리보고 해야할 듯
                agencyCode: '',                                                                                                                                                     //KIS대리점코드(입력받은값)
                reCommandCode: searchInfo.brcd ? searchInfo.brcd : '',                                                                                                                                     //영업점코드(입력받은값)
                bankDcd: '',                                                                                                                                                        //은행구분코드(공백 고정값)
                adjsAcntNo: '',                                                                                                                                                     //정산 계좌번호(공백 고정값)
                uploadFileNm: '',                                                                                                                                                   //첨부파일명  direct:직접입력시 첨부파일 필수(INF-PS-375 response RSLT_DATA값)          업로드도 파일이 있어야 하는데 어떻게 가져옴? 우린 업로드 없으니까 공백처리?
                inttCd: INTT_CODE,
                vncpId: vanInfo === VAN_KIS ? '' : vanInfo,                                                                                                                                                    //다중VAN 이용 신청의 경우에만 vncpId 값 존재한다는데 어디서 가져옴?
                rcmdInttCd: recommendOrgSelectedValue,                                                                                                                              //추천기관                                                                                                                                           //???이건 뭐임?
                eventCd: '',                                                                                                                                                        //이벤트코드
                eventInvttId: ''                                                                                                                                                    //이벤트ID
            } 
            openLoading();
            callOpenApi(API_URL_MAPPER.POS_SERVICE_APPLICATION , param , function( result ){
            // callMockApi("/mock/serviceApplication.json", {}, function( result ){
                closeLoading();
                // 성공 처리
                if(result.STATUS === "0000") {
                    scfInfoGetApi();
                }
                //에러 처리
                else {
                    posErrorApi(bzn,API_URL_MAPPER.POS_SERVICE_APPLICATION,result,'신청자 정보 성공 저장');
                    let modalData = {
                        title : WORD_CD.ERROR_CD + result.SYS_MSG_CD,
                        content : result.RSLT_MSG,
                    }
                    openModal(modalData);
                }
            },function (e) {
                closeLoading();
                posErrorApi(bzn,API_URL_MAPPER.POS_SERVICE_APPLICATION,null,'신청자 정보 성공 저장');
                // 공통에러처리
                ErrorModule(e);
            });
        }
    }

    return(
        <>
        {/* 컨텐츠영역 */}
        <div className="contents">
            <div className="contentsInner">
                <div className="titleWrap">   
                    <div className="title">
                        카드매출 바로입금 서비스 신청을 위해 <span className="dpib txtBold">BOX POS 가입을 진행해 주세요</span>
                    </div>
                </div>
                <div className="contentFlex">
                    <div className="wrapBox">
                        <div className="inBox flex inBoxP24">
                            {/* 신청자 정보 */}
                            <UserInfoCard userInfoData={userInfoData} chkBznValue={chkBznValue}/>

                            {/* 이메일 */}
                            <EmailAddressCard emailValue={emailValue} setEmailValue={setEmailValue} emailId={emailId} setEmailId={setEmailId} emailDvalue={emailDvalue}
                            setEmailDvalue={setEmailDvalue} directFlg={directFlg} setDirectFlg={setDirectFlg}/>

                            {/* 사업장 연락처 */}
                            <BusinessPhoneNmCard bizPhoneValue={bizPhoneValue} setBizPhoneValue={setBizPhoneValue} setFocusFlg={setFocusFlg}/>

                            {/* 나눔선 */}
                            <div className="divide mt8"></div>

                            {/* 추천대리점/영업점/기관 입력 = 닫힘이 default(현업요구사항) */}
                            <div className={`formTitleAcc accordionType bgWhite borderR12 cursorPointer ${clickZoneBtn ? 'on' : ''}`}>
                                <div className="flex aiC jcSB gap8 accordionTypeHeader" onClick={handdleClickZone}>
                                    <div className="w100 flex aiC gap8">
                                        <div className="tit b1 txtGray900 txtBold">추천대리점/영업점/기관</div>
                                    </div>
                                    <button className="arrowBtn"></button>
                                </div>
                                <div className="accordionTypeBody mt16">
                                    <div className="w100 flexV gap24">
                                        {hideAgencyInput &&
                                        <div className='formbox mt16'>
                                            <p className="tit">추천 대리점</p>
                                            {/* 메세지 상태별 노출 > 오류 = .error / 도움말 = .explain / 성공 = .success / 글자수체크 = .count */}
                                            <div className="valChk">
                                                <div className="inpbox">
                                                    <span className="w100">
                                                        <FakeSelectbox options={cateOptions2} placeholder="선택" popTitle="추천 대리점" className="fakeSelect selBox" />
                                                    </span>
                                                    <ClearInput type="text" placeholder="코드 입력" className="" />
                                                </div>
                                                {/* 메세지 + 글자수체크 영역 - default = 미노출 */}
                                                <div className="flexBox message">
                                                    <span className="infoTxt">도움말 메세지</span>
                                                    <div className="textCount"><span className="strong">0</span> / N자</div>
                                                </div>
                                            </div>
                                        </div>
                                        }
                                        <div className="formbox">
                                            <p className="tit">추천 영업점</p>
                                            <div className="valChk">
                                                <div className="inpbox">
                                                    {/* 읽기전용(수정불가) = disabled / readOnly */}
                                                    <ClearSearchInputReadOnly placeholder="선택" className="noneX fakeDisabled" inputValue={searchInfo.krnBrm} setInputValue={setSearchInfo} maxLength={INPUT_MAXLENGTH_150} readOnly searchEvent={recommendBranchModalEvent}/>
                                                </div>
                                                {/* 메세지 + 글자수체크 영역 - default = 미노출 */}
                                                <div className="flexBox message">
                                                    <span className="infoTxt">도움말 메세지</span>
                                                    <div className="textCount"><span className="strong">0</span> / N자</div>
                                                </div>
                                            </div>
                                        </div>
                                        {recommendOrgInfoData.length>0 ? <RecommendOrgCard recOrgData={recommendOrgInfoData} recommendOrgSelectedValue={recommendOrgSelectedValue} setRecommendOrgSelectedValue={setRecommendOrgSelectedValue}/> : <></>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="btnGroupWrap wrapBtn">
                        <button className={`btn fillBtn h56 w100 ${onFlg ? 'on' : ''}`} onClick={nextBtnEvent}>다음</button>
                    </div>
                </div>
            </div>
        </div>
        {rpprCompareFlg ? <RpprCompareModal setRpprCompareFlg={setRpprCompareFlg} /> : <></>}
        {recommendBranchFlg ? <RecommendBranchModal titleNm={RECOMMAND_BRNM} setRecommendBranchFlg={setRecommendBranchFlg} setSearchInfo={setSearchInfo}/> : <></>}
        </>
    )
}
export default UserInfoChkCard;