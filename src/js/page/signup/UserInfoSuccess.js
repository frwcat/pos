import Header from '../../components/common/Header'; //헤더
import Footer from '../../components/common/footer/Footer'; //푸터
import UserInfoChkCard from '../../components/signup/UserInfoChkCard';
import { MSG_CON, WORD_CD } from '../../code/MsgCd';
import { useTwoModal } from '../../hook/useTwoModal';
import { useResetRecoil } from '../../modules/ResetModule';
import { useNavigate } from 'react-router';

const UserInfoSuccess = () => {
    const {openTwoModal} = useTwoModal();
    const resetAtom = useResetRecoil();
    const navigate = useNavigate();

    const closeEvent = () => {
        openTwoModal({
            title: WORD_CD.ANNOUNCE,
            content: MSG_CON.SERVICE_CANCEL_MSG,
            onConfrim : () => {},
            onCancel : () => resetMoveEvent(),
            okValue : WORD_CD.NO,
            cancelValue : WORD_CD.OK,
        });
    }

    const resetMoveEvent = () => {
        resetAtom();
        navigate('/');
    }

    return(
        <>        
            <Header className="subType btnClose" title="카드매출 바로입금 신청" onClose={closeEvent}/>
            <div className="container">
                <div className="contentsWrap">
                    <UserInfoChkCard />
                </div>
                <Footer className="" />
            </div>
        </>
    );
}
export default UserInfoSuccess;