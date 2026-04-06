import { lazy, Suspense, useState, useEffect, useRef } from "react";
import Footer from "../components/common/footer/Footer";
import Header from "../components/common/Header";
import TopBtn from '../components/pub/feature/TopBtn'; //스크롤 탑버튼
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import { useLocation, useNavigate } from "react-router";
import { domainType } from "../modules/Common";
import { DOMAIN_POS } from "../code/CommCd";
import { useResetRecoil } from "../modules/ResetModule";
import { useRecoilState  } from "recoil";
import { VanAtom } from "../atom/VanAtom";
import { useLoading } from "../hook/useLoading";
import { API_URL_MAPPER } from "../api/ApiEnv";
import { callMockApi, callOpenApiNonAuth } from "../modules/TokenBase";
import { useModal } from "../hook/useModal"
import { WORD_CD } from "../code/MsgCd";
import { ErrorModule } from "../modules/ErrorModule";
import ScfStopModal from "../components/scf/modal/ScfStopModal";
import { scfErrorApi } from "../modules/ErrorSend";
import { BankCdAtom } from "../atom/BankCdAtom";
import { RecOrgAtom } from "../atom/RecOrgAtom";

const Index =  () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const type = params.get('van');
    //나중에 제휴 van 사 결제 연동시 다시 주석 해제하기
    // const ALLOWED_VANS = new Set(['KIS', 'SMT', 'KFT', 'NIC', 'KCP', 'KOC']);    
    // const vanValue = type?.replace(/['"]/g, '').trim().toUpperCase();
    // const vncpIdType = ALLOWED_VANS.has(vanValue) ? vanValue : 'MLPX';
    const vncpIdType = 'MLPX';
    const [van, setVan] = useRecoilState(VanAtom);
    const bankCdType = params.get('bankCd')?.trim() || '';
    const [bankCd, setBankCd] = useRecoilState(BankCdAtom);
    const recOrgGetValue = params.get('c')?.trim() || '';
    const [recOrgCd, setRecOrgCd] = useRecoilState(RecOrgAtom);
    const navigate = useNavigate();
    const [joinUnableFlg, setJoinUnableFlg] = useState(false);
    const ApplicationStatusModal = lazy(()=> import("../components/signup/modal/JoinUnableModal"));
    /* 탭버튼클릭시 스크롤이동 + 스크롤해서 영역에 도달했을때 탭버튼값 변경 */
    const [activeTap, setActiveTap] = useState('tab1_1');  //현재 활성화된 탭 상태값
    const resetAtom = useResetRecoil();
    //각 영역 ref
    const tab1Ref = useRef(null);
    const tab2Ref = useRef(null);
    const tab3Ref = useRef(null);
    const observeRef = useRef(null); //옵저버 인스턴스 저장
    const {openModal} = useModal();
    const {openLoading, closeLoading} = useLoading();
    const [stopFlg, setStopFlg] = useState(false);
    const [stopData, setStopData] = useState('');
    const [headerFlg, setHeaderFlg] = useState(false);

    useEffect(() => {
        const prevUrl = document.referrer;
        // console.log("prevUrl", prevUrl);
        if(prevUrl.indexOf(domainType(DOMAIN_POS))>-1){
            //header < X 유지(버튼이나 a 태그 등 을 통해 들어올 경우)
            setHeaderFlg(true);
        }else{
            //header < X 삭제(url 직접입력)
            setHeaderFlg(false);
        }
    }, [])

    useEffect(() => {
        resetAtom();
        //VAN 코드
        setVan(vncpIdType);
        //QR 영업점코드
        if(bankCd==null || bankCd==undefined || bankCdType==''){
        }else{
            setBankCd(bankCdType);
        }
        if(recOrgGetValue == null || recOrgGetValue == undefined || recOrgGetValue == ''){
        }else{
            setRecOrgCd(recOrgGetValue);
        }
    }, []);

    useEffect(() => {
        //옵션 설정
        const observerOptions = {
            root: null, //뷰포트를 기준으로 관찰
            rootMargin: "0px", //마진없이 관찰
            threshold: 0.6, //요소가 60% 이상 보일때 콜백 실행
        };
        //콜백함수(보이는 영역의 id로 activeTap 변경)
        const observerCallback = (enteries) => {
            enteries.forEach((entry) => {
                if(!entry.isIntersecting) return; //화면에 안보이면 무시
                const id = entry.target.id;
                //값이 바뀔때만 갱신
                setActiveTap((prev) => (prev === id ? prev : id));
            });
        };
        //인스턴스 생성 및 저장
        observeRef.current = new IntersectionObserver(observerCallback, observerOptions);
        //참조하고 있는 각 영역을 관찰시작
        const elements = [tab1Ref.current, tab2Ref.current, tab3Ref.current,];
        elements.forEach((el) => {
            if (el) observeRef.current.observe(el); //null 체크 후 관찰시작
        });
        //컴포넌트 언마운트 시 옵저버 해제(clean up)
        return () => {
            if (observeRef.current) {
                observeRef.current.disconnect();
            }
        };
    }, []); //빈배열 : 컴포넌트 마운트시 한번만 실행

    // const mnbModalEvent = () => {
    //     try { 
    //         var popUrl = (window.location.href.indexOf("//local") > -1)?"http://localwww.ibkbox.net:8081":((window.location.href.indexOf("//dev") > -1)?"https://devwww.ibkbox.net": "https://www.ibkbox.net");
    //         var e=document, h=e.createElement('script'), t=e.getElementsByTagName('script')[0]; 
    //         h.async=true; h.src=popUrl+'/COM005/popup?boxName=ups';
    //         if (t && t.parentNode) t.parentNode.insertBefore(h,t); else { var q = document.querySelector('head') || document.querySelector('body'); if (q) { q.insertBefore(h, q.firstChild); } else { console.error("Initialize Failure [BOX POPUP1]."); } } 
    //     } catch(ex) { 
    //         console.error("Initialize Failure [BOX POPUP2]\n" + ex); 
    //     }
    // }

    // const bannerModalEvent = () => {
    //     try { 
    //         var bannerUrl = (window.location.href.indexOf("//local") > -1)?"http://localwww.ibkbox.net:8081":((window.location.href.indexOf("//dev") > -1)?"https://devwww.ibkbox.net": "https://www.ibkbox.net");
    //             var r=document, j=r.createElement('script'), u=r.getElementsByTagName('script')[0]; 
    //             j.async=true; j.src=bannerUrl+'/COM005/banner?boxName=ups';
    //             if (u) u.parentNode.insertBefore(j,u); else { var v = document.querySelector('head') || document.querySelector('body'); if (v) { v.insertBefore(j, v.firstChild); } else { console.error("Initialize Failure [BOX BANNER1]."); } } 
    //         } catch(ex) { 
    //             console.error("Initialize Failure [BOX BANNER2]\n" + ex); 
    //         }
    // }

    //탭 클릭시 해당 영역으로 스크롤 이동
    const handleTapClick = (tabId) => {
        setActiveTap(tabId); //클릭한 탭으로 상태 변경
        observeRef.current?.disconnect(); //옵저버 일시정시
        const map = {tab1_1: tab1Ref, tab1_2: tab2Ref, tab1_3: tab3Ref};
        const section = map[tabId]?.current;
        if (!section) return;
        //1024 이상 (PC): 156(pc헤더+tap높이), 1023 이하 (태블릿+모바일) : 104(mo헤더+tap높이)
        const offset = window.innerWidth >= 1024 ? 156 : 104;
        window.scrollTo({
            top: section.offsetTop - offset,
            behavior: 'smooth',
        });
        //스크롤 완료 후 옵저버 재시작(약간의 지연)
        setTimeout(() => {
            if (!observeRef.current) return;
            const elements = [tab1Ref.current, tab2Ref.current, tab3Ref.current];
            elements.forEach((el) => {
                if (el) observeRef.current.observe(el);
            });
            setActiveTap(tabId); //클릭한 탭으로 다시 한번 보정
        }, 800); //스크롤 시간에 맞춰 조정
    };

    //가입절차 탭 동작
    const [activeTap2, setActiveTap2] = useState('tab2_1');  //현재 활성화된 탭 상태값
    const handleTapClick2 = (tabName) => {
        setActiveTap2(tabName);
    };

    //보였다 안보였다하는 플로팅버튼 동작 (pc: 디폴트_미노출, 스크롤시 노출, 최하단위치하면 미노출 / 모바일: 계속노출)
    const [visibleBtn, setVisibleBtn] = useState(false); //버튼 노출여부 상태
    useEffect(() => {
        let ticking = false; //스크롤 이벤트 중복실행을 막는 플래그 (ticking : false(처리가능), true(처리대기중))
        const mq = window.matchMedia('(min-width: 1024px)'); //화면 크기 확인용 미디어쿼리 객체 : PC인지 mo인지 확인(true(pc), false(mo))
        //버튼 표시 여부를 계산하는 함수
        const update = () => {
            const scrollY = window.scrollY; //현재 스크롤 위치
            //화면 전체 높이 구하기
            const doc = document.documentElement; 
            const bottomLimit = doc.scrollHeight - window.innerHeight - 300; //화면 하단 여백 위치
            //pc면 스크롤 위치 조건 확인, 모바일이면 항상 true (pc = 스크롤 위치 700px 이상 + 바텀 300px 일때만 노출, 모바일: true 계속노출)
            const nextVisible = mq.matches ? //PC인지 mo인지 확인
            scrollY >= 700 && scrollY < bottomLimit 
            : true;
            //상태가 실제로 바뀔때만 업데이트
            setVisibleBtn((prev) => prev === nextVisible ? prev : nextVisible,);
            ticking = false; //다음 스크롤 이벤트 처리 가능 상태로 변경
        };
        //스크롤 이벤트 핸들러
        const onScroll = () => {
            if(!ticking) {
                ticking = true; //처리중 상태로 변경
                requestAnimationFrame(update); //다음 프레임에서 update 실행
            }
        };
        //스크롤 이벤트 리스너 등록 (passive 옵션으로 성능최적화)
        window.addEventListener('scroll', onScroll, {passive: true,});
        update(); //컴포넌트 마운트 시 초기 상태 계산
        //컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    },[]);

    //스크롤 애니메이션동작
    const animationBoxRefs = useRef([]); //각 요소를 저장할 ref배열
    useEffect(() => {
        //요소가 화면에 들어오면 동작
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const el = entry.target;
                    const isOnce = el.dataset.once === 'true'; //1회만 실행 여부

                    if (entry.isIntersecting){
                        el.classList.add('moving'); //애니메이션 클래스 추가
                        if (isOnce) {
                            observer.unobserve(el);
                        } //한번만 실행 설정된 경우 중단
                    } else {
                        //요소가 화면에서 벗어났을때 처리
                        if(!isOnce) {
                            el.classList.remove('moving');
                        } //클래스 삭제
                    }
                });
            },
            {threshold: 0.7} //요소가 숫자%이상 보이면 동작
        );

        //각 ref 요소들을 observer에 등록
        animationBoxRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        })
        //컴포넌트 언마운트 시 observer 해제
        return () => {
            observer.disconnect();
        }; //관찰 중단   
    }, []);
    //애니메이션 각 영역에 ref를 설정
    const setAnimationBoxRef = (el, index) => {
        if(el) {
            animationBoxRefs.current[index] = el;
        }
    };

    const nextEvent = () => {
        serviceChkApi();
        
    }

    const serviceChkApi = () => {
        openLoading();
        callOpenApiNonAuth(API_URL_MAPPER.SCF_STOP_CHK_URL, {}, function( result ){
        //callMockApi("/mock/scfModal.json", {}, function( result ){
            closeLoading();
            if(result.STATUS === "0000") {
                if(result.RSLT_DATA.svcSspnYn === 'N') {
                    navigate('/signup/bizInput');
                }else{
                    setStopFlg(true);
                    setStopData(result.RSLT_DATA.svcSspnMsg);
                }
            }else {
                scfErrorApi('',API_URL_MAPPER.SCF_STOP_CHK_URL,result,'선정산 신청제어');
                let modalData = {
                    title : WORD_CD.ERROR_CD + result.STATUS,
                    content : result.RSLT_MSG,
                    //callback: () => alert('modal callback()'),
                }
                openModal(modalData);
            }
        },function (e) {
            closeLoading();
            scfErrorApi('',API_URL_MAPPER.SCF_STOP_CHK_URL,null,'선정산 신청제어');
            // 공통에러처리
            ErrorModule(e);
        });
    }
    const popupEvent = () => {
        setJoinUnableFlg(true);
    }
    const prevEvent = () => {
        window.location.href= domainType(DOMAIN_POS);
        //navigate('/');
    }

    const closeEvent = () => {
        resetAtom();
        window.location.href= domainType(DOMAIN_POS);
    }
    return(
        <>
            <Header className={`subType ${headerFlg ? 'btnArrow btnClose' : ''}`} title="카드매출 바로입금 신청" onPrev={prevEvent} onClose={closeEvent}/>
            <div className="container">
                <div className="contentsWrap">
                    {/* 메인화면용 or 가로사이즈전체용 */}
                    <div className="section section1">
                        <div className="w100">
                            <div className="inner1200">
                                <div className="leftBox">
                                    <div className="topTextBox">가입비, 이용료 없이 <span className="txtBold">모두 무료</span></div>
                                    <div className="mainBannerTit flexV gap6">
                                        <span className="pointColorBlue txtBold">오늘 카드매출</span>
                                        오늘 받으세요
                                    </div>
                                    <button className="btn fillBtn h56 on" onClick={nextEvent}>카드매출 바로입금 신청하기</button>
                                </div>
                                <div className="rightBox">
                                    <div className="mainBannerImg"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="section section2">
                        <div className="tabWrap">
                            {/* 탭영역 
                                기본 = 라인버전,
                                회색네모박스 = secondary*/}
                            <div className="tabHeader firstTab">
                                <ul>
                                    {/* 선택시 .on 추가 */}
                                    <li className={activeTap === 'tab1_1' ? 'on' : ''} onClick={() => handleTapClick('tab1_1')}><button className="tab">서비스 대상</button></li>
                                    <li className={activeTap === 'tab1_2' ? 'on' : ''} onClick={() => handleTapClick('tab1_2')}><button className="tab">가입 조건</button></li>
                                    <li className={activeTap === 'tab1_3' ? 'on' : ''} onClick={() => handleTapClick('tab1_3')}><button className="tab">가입절차</button></li>
                                </ul>
                            </div>
                            {/* 탭 컨텐츠영역 */}
                            <div className="tabBody">                                  
                                <div id="tab1_1" className="tabListBox tabListBox1_1" ref={tab1Ref}>
                                    <div className="w100 bgBox1">
                                        <div className="inner1200 flexV aiC jcC gap80">
                                            <div className="textWrap">
                                                <div className="h2">빠른 정산의 시작</div>
                                                <div className="title">이런 대표님께 추천합니다</div>
                                            </div>
                                            <div className="mainSwiper" ref={(el) => setAnimationBoxRef(el, 0)} data-once="true">
                                                <Swiper
                                                    modules={[Pagination]}
                                                    centeredSlides={false}
                                                    slidesPerView={3} //기본 3개
                                                    allowTouchMove={false} //슬라이드 이동 비활성화
                                                    spaceBetween={24}
                                                    pagination={true}
                                                    breakpoints={{
                                                        0: { //모바일
                                                            slidesPerView: 1.2,
                                                            spaceBetween: 16,
                                                            allowTouchMove: true, //스와이프 활성화
                                                            centeredSlides: true, //가운데정렬 활성화     
                                                        },
                                                        /*641: { //태블릿 이상
                                                            slidesPerView: '2',
                                                            spaceBetween: 16,
                                                            allowTouchMove: true, //스와이프 활성화
                                                            centeredSlides: true, //가운데정렬 활성화
                                                        },*/
                                                        1024: { //PC 이상
                                                            slidesPerView: '3',
                                                            spaceBetween: 24,
                                                        },
                                                    }}
                                                    loop={false}
                                                    className="mainSwiper"
                                                    watchOverflow={true} //슬라이드 1개일때 페이지네이션 자동 숨김
                                                    observer={true}
                                                    observeParents={true}
                                                >                    
                                                    <SwiperSlide>
                                                        <div className="mainBanner">
                                                            <div className="img img1"></div>
                                                            <div className="innerBanner">
                                                                <div className="glassEffect">
                                                                    <p className="mainTit">
                                                                        <span className="yellowStrong">자금이</span> 필요해요
                                                                    </p>
                                                                    <p className="mainTxt">
                                                                        오늘 당장<br/>현금이 필요한데<br/>돈이 없어요
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </SwiperSlide>
                                                    <SwiperSlide>
                                                        <div className="mainBanner">
                                                            <div className="img img2"></div>
                                                            <div className="innerBanner">
                                                                <div className="glassEffect">
                                                                    <p className="mainTit">
                                                                        <span className="yellowStrong">실시간으로</span> 확인 할래요
                                                                    </p>
                                                                    <p className="mainTxt">
                                                                        카드매출이 제대로 입금되고<br/>
                                                                        있는지 챙기기 힘들어요<br/>
                                                                        (i-ONE 뱅킹 앱에서 알림 설정 시)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </SwiperSlide>
                                                    <SwiperSlide>
                                                        <div className="mainBanner">
                                                            <div className="img img3"></div>
                                                            <div className="innerBanner">
                                                                <div className="glassEffect">
                                                                    <p className="mainTit">
                                                                        <span className="yellowStrong">공휴일</span>에도 받고 싶어요
                                                                    </p>
                                                                    <p className="mainTxt">
                                                                        연휴가 있어<br/>
                                                                        카드매출 입금될때까지<br/>
                                                                        오래 기다려야 해요
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </SwiperSlide>
                                                </Swiper>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w100 bgBox2">
                                        <div className="inner1200 flexV aiC jcC">
                                            <div className="textWrap">
                                                <div className="title">
                                                    <span className="pointColorBlue txtBold">50만원 이하</span> 결제라면<br/>
                                                    실시간으로 입금해 드려요~
                                                </div>
                                            </div>
                                            <div className="img img4" ref={(el) => setAnimationBoxRef(el, 1)} data-once="true"></div>
                                        </div>
                                    </div>
                                </div>
                                <div id="tab1_2" className="tabListBox tabListBox1_2" ref={tab2Ref}>
                                    <div className="w100">
                                        <div className="inner1200 flex aiS jcSB">
                                            <div className="leftBox">
                                                <div className="textWrap">
                                                    <div className="h2 pointColorBlue txtBold">가입 조건</div>
                                                    <div className="title txtGray900 txtBold">
                                                        소상공인이라면<br/>
                                                        대부분 신청할 수 있어요!
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rightBox">
                                                <ul className="conList" ref={(el) => setAnimationBoxRef(el, 2)} data-once="true">
                                                    <li className="">
                                                        <span className="ico ico1"></span>
                                                        <span className="flexV gap8">
                                                            <span className="tit">카드 단말기로 결제해야 해요</span>
                                                            <span className="txt">POS 단말기를 통한 카드결제만 입금돼요</span>
                                                        </span>
                                                    </li>
                                                    <li className="">
                                                        <span className="ico ico2"></span>
                                                        <span className="flexV gap8">
                                                            <span className="tit">기업은행 계좌가 필요해요</span>
                                                            <span className="txt">없으시다면 계좌 개설을 도와드릴게요</span>
                                                        </span>
                                                    </li>
                                                    <li className="">
                                                        <span className="ico ico3"></span>
                                                        <span className="flexV gap8">
                                                            <span className="tit">가맹점 등록이 되어야 해요</span>
                                                            <span className="txt">미등록 시 IBK가 대신 등록해 드려요</span>
                                                        </span>
                                                    </li>
                                                    <li className="">
                                                        <span className="ico ico4"></span>
                                                        <span className="flexV gap8">
                                                            <span className="tit">대표자 본인만 신청 가능해요</span>
                                                            <span className="txt">공동, 각자 대표자는 신청이 어려워요</span>
                                                        </span>
                                                    </li>
                                                    <li className="">
                                                        <span className="ico ico5"></span>
                                                        <span className="flexV gap8">
                                                            <span className="tit">정상 영업과 금융거래 유지</span>
                                                            <span className="txt">영업 상태와 금융거래가 모두 정상일 때 가입 가능해요</span>
                                                        </span>
                                                    </li>
                                                    <li className="">
                                                        <span className="ico ico6"></span>
                                                        <span className="flexV gap8">
                                                            <span className="tit">일부 업종은 신청이 제한돼요</span>
                                                            <button className="btn lineBtn round" onClick={popupEvent}>가입불가능한 업종보기</button>
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="tab1_3" className="tabListBox tabListBox1_3" ref={tab3Ref}>
                                    <div className="w100">
                                        <div className="inner1200 flexV aiC jcC">
                                            <div className="topBox">
                                                <div className="textWrap aiC">
                                                    <div className="h2 pointColorBlue txtBold">가입 절차</div>
                                                    <div className="title txtGray900 txtBold">
                                                        간편하게 신청하고 이용하세요
                                                    </div>
                                                    <div className="subTextWrap flexV gap8 aiC jcC">
                                                        <div className="text txtGray700">
                                                            직전 연도 총 매출액* 30억 원 이하인<br/>
                                                            개인사업자 및 법인이라면 누구든지 신청할 수 있습니다.
                                                        </div>
                                                        <div className="b2 multiLine txtGray600">*부가가치세법에 따라 신고한 직전 2회 과세기간의 과세표준의 합</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bottomBox">
                                                <div className="tabWrap flexV">
                                                    {/* 탭영역 
                                                        기본 = 라인버전,
                                                        회색네모박스 = secondary*/}
                                                    <div className="tabHeader secondary">
                                                        <ul>
                                                            {/* 선택시 .on 추가 */}
                                                            <li className={activeTap2 === 'tab2_1' ? 'on' : ''} onClick={() => handleTapClick2('tab2_1')}><button className="tab">3억원 이하</button></li>
                                                            <li className={activeTap2 === 'tab2_2' ? 'on' : ''} onClick={() => handleTapClick2('tab2_2')}><button className="tab">3억원 초과 30억원 이하</button></li>
                                                        </ul>
                                                    </div>
                                                    {/* 탭 컨텐츠영역 */}
                                                    <div className="tabBody" ref={(el) => setAnimationBoxRef(el, 3)} data-once="true">
                                                        {activeTap2 === 'tab2_1' &&                              
                                                        <div id="tab2_1" className="tabListBox tabListBox2_1">
                                                            <ul className="stepList">
                                                                <li>
                                                                    <div className="num">1</div>
                                                                    <div className="textBox">
                                                                        <div className="tit">서비스 신청</div>
                                                                        <div className="txt">약관동의, <span className="dpb">본인인증 진행</span></div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="num">2</div>
                                                                    <div className="textBox">
                                                                        <div className="tit">심사결과 확인</div>
                                                                        <div className="txt">조건 검증을 통해 <span className="dpb">가입가능여부 확인</span></div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="num">3</div>
                                                                    <div className="textBox">
                                                                        <div className="tit">계좌 보유 여부 확인</div>
                                                                        <div className="txt">IBK안심정산통장 <span className="dpb">미보유 시 개설</span></div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="num">4</div>
                                                                    <div className="textBox">
                                                                        <div className="tit">전자약정</div>
                                                                        <div className="txt">비대면 <span className="dpb">채권양도 계약</span></div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="num">5</div>
                                                                    <div className="textBox">
                                                                        <div className="tit">계좌변경</div>
                                                                        <div className="txt">IBK안심정산통장으로 <span className="dpb">입금계좌 변경</span></div>
                                                                    </div>
                                                                </li>
                                                            </ul>		
                                                        </div>
                                                        }
                                                        {activeTap2 === 'tab2_2' &&
                                                        <div id="tab2_2" className="tabListBox tabListBox2_2">
                                                            <ul className="stepList">
                                                                <li>
                                                                    <div className="num">1</div>
                                                                    <div className="textBox">
                                                                        <div className="tit">서비스 신청</div>
                                                                        <div className="txt">약관동의, <span className="dpb">본인인증 진행</span></div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="num">2</div>
                                                                    <div className="textBox">
                                                                        <div className="tit">심사결과 확인</div>
                                                                        <div className="txt">조건 검증을 통해 <span className="dpb">가입가능여부 확인</span></div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="num">3</div>
                                                                    <div className="textBox">
                                                                        <div className="tit">영업점 방문</div>
                                                                        <div className="txt">필요 서류 제출, <span className="dpb">채권양도통지서 작성</span></div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="num">4</div>
                                                                    <div className="textBox">
                                                                        <div className="tit">카드사 승낙</div>
                                                                        <div className="txt">카드사 <span className="dpb">승낙여부 확인</span></div>
                                                                    </div>
                                                                </li>
                                                            </ul>	
                                                        </div>
                                                        }
                                                    </div>

                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="section section3">
                        <div className="w100">
                            <div className="inner1200 flexV gap8">
                                <div className="approvedWrap">
                                    <div className="tit">준법감시인 심의필</div>
                                    <div className="txt">제2025-6648호(2025.10.01) 유효기간(2026.09.30)</div>
                                </div>
                                <ul className="listDot">
                                    <li className="b3 multiLine txtGray600">자세한 문의는 거래 영업점 또는 고객센터(02-729-7633)로 문의주시기 바랍니다.</li>
                                    <li className="b3 multiLine txtGray600">계약을 체결하기 전에 상품(서비스)설명서 및 약관을 반드시 확인하시기 바랍니다.</li>
                                    <li className="b3 multiLine txtGray600">일반금융소비자는 「금융소비자 보호에 관한 법률」 제19조 제1항에 따라 IBK기업은행으로부터 충분히 설명을 받을 권리가 있으며, 그 설명을 이해한 후 거래하시기 바랍니다.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    {/* 버튼영역 (pc는 sticky. mo는 fixed)
                        2:1 비율 버튼일때 = .oneTwo 추가  */}
                    <div className={`mainBtn ${visibleBtn ? 'view' : ''}`}>
                        <div className="btnGroupWrap wrapBtn">
                            {/* 활성화시 .on 추가 */}
                            <button className="btn fillBtn h56 on" onClick={nextEvent}>카드매출 바로입금 신청하기</button>
                        </div>
                    </div>
                                    </div>
                {/* 푸터 (pc는 노출. mo는 미노출)
                    모바일 노출시 .show 추가. 하단에 버튼 있으면 .addBtn 추가*/}
                <Footer className="show addBtn" />
                <TopBtn />
            </div>
            <Suspense fallback={<></>}>
                {joinUnableFlg ? <ApplicationStatusModal setJoinUnableFlg={setJoinUnableFlg} /> : <></>}
                {stopFlg  ? <ScfStopModal stopFlg={stopFlg} setStopFlg={setStopFlg} result={stopData}/> : <></>}
            </Suspense>
        </>
    )
}

export default Index;