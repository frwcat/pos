import { useRecoilValue } from "recoil";
import { CertReplyAtom } from "../../atom/CertReplyAtom";
import { CORPORATE } from "../../code/PosCd";
import { autoHypenBiz, autoHypenCorBiz, autoHypenPhone } from "../../modules/Common";


const UserInfoCard = ({userInfoData, chkBznValue}) => {
    const certReplyInfo = useRecoilValue(CertReplyAtom);

    return(
        <>
            <div className="bgDetailWrap flexV gap16 jcSB aiS bgGray50 borderR12 p2016">
                <div className="b1 multiLine txtGray900 txtMedium">카드 가맹점 기본 정보</div>
                <div className="detailRWrap">
                    <table className="detailList">
                        <tbody>
                            {/* 개인법인 노출되는 정보 다름 */}
                            {/* 반복 */}
                            <tr className="box">
                                <th className="txt b2 txtGray600 txtMedium">대표님 이름</th>
                                <td className="tit b2 txtGray900 txtSemiBold">{userInfoData?.rpprNm ? userInfoData?.rpprNm : ''}</td>
                            </tr>
                            {/* //반복 */}
                            <tr className="box">
                                <th className="txt b2 txtGray600 txtMedium">대표님 휴대폰번호</th>
                                <td className="tit b2 txtGray900 txtSemiBold">{certReplyInfo.phoneNm ? autoHypenPhone(certReplyInfo.phoneNm) : ''}</td>
                            </tr>
                            <tr className="box">
                                <th className="txt b2 txtGray600 txtMedium">사업장 명칭</th>
                                <td className="tit b2 txtGray900 txtSemiBold">{userInfoData?.afstNm ? userInfoData?.afstNm : ''}</td>
                            </tr> 
                            <tr className="box">
                                <th className="txt b2 txtGray600 txtMedium">사업자등록번호</th>
                                <td className="tit b2 txtGray900 txtSemiBold">{userInfoData?.bizrno ? autoHypenBiz(userInfoData?.bizrno) : ''}</td>
                            </tr>
                            {chkBznValue === CORPORATE ?
                            <tr className="box">
                                <th className="txt b2 txtGray600 txtMedium">법인등록번호</th>
                                <td className="tit b2 txtGray900 txtSemiBold">{userInfoData?.cgn ? autoHypenCorBiz(userInfoData?.cgn) : ''}</td>
                            </tr>
                            :<></>}                                    
                        </tbody>
                    </table>                                      
                </div>
            </div>
        </>
    )
}
export default UserInfoCard;