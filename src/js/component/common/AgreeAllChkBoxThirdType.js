import { useEffect, useState } from 'react';

const AgreeAllChkBoxThirdType = ({dataName = [], uniqueId, className, allTitle, showAllCheck = true, allDataChecked
    , setAllDataChecked, subDataChecked, setSubDataChecked, setSendArrData, 
    dcffObj, setDcffObj, setIsFAPopOpen, dcffAgreeFlg, setDcffAgreeFlg}) =>{ //추가 , showAllCheck = true
    const [data, setData] = useState(dataName);
    const [dataChecked, setDataChecked] = useState(false); //모든 1뎁스 체크 여부
    useEffect(()=> {
        if(allDataChecked) {
            handleAllCheckChange(true);
        }
    },[allDataChecked])

    useEffect(()=> {
        if(dcffAgreeFlg) {
            handleSubDataChange(true, dcffObj.parentId, dcffObj.sub);
            setDcffAgreeFlg(false);
        }
    },[dcffAgreeFlg])

    useEffect(() => {
        if (!data?.length) return;

        const checked = true;

        const updatedData = data.map((item) => ({
            ...item,
            checked,
            subData: item.subData
            ? item.subData.map((subItem) => ({
                ...subItem,
                checked,
                subData: subItem.subData
                    ? subItem.subData.map((third) => ({
                        ...third,
                        checked,
                    }))
                    : [],
                }))
            : [],
        }));

        setData(updatedData);
        setDataChecked(checked);
        setAllDataChecked(checked);
        setSubDataChecked(checked);

        const initialOpen = {};
        updatedData.forEach((item) => {
            initialOpen[item.id] = item.id === 'SMT' ? true : false;
        });
        setIsSubOpen(initialOpen);
    }, []);

    //전체 체크박스 동작
    const handleAllCheckChange = (checked) => {
        const updatedData = data.map((item) => ({
            ...item,
            checked,
            subData: item.subData 
                ? item.subData.map((subItem) => ({ 
                    ...subItem, 
                    checked, 
                    subData: subItem.subData 
                        ? subItem.subData.map((third) => ({
                        ...third,
                        checked,
                        })) 
                    : [],
                })) 
            : [],
        }));

        setDataChecked(checked);
        setAllDataChecked(checked);
        setSubDataChecked(checked);
        setData(updatedData);
    };

    //1뎁스 체크박스 동작
    const handleDataChange = (checked, id) => {
        let touchedIds = [];
        const updatedData = data.map((item) => {
            if (item.id !== id) return item;
            touchedIds = collectIds(item);
            const updatedItem = { ...item, checked };
            updatedItem.subData = (updatedItem.subData ?? []).map((subItem) => {
                const updatedSubItem = {...subItem, checked};
                updatedSubItem.subData = (subItem.subData ?? []).map((thirdItem) => {
                    const updatedThirdItem  = {...thirdItem, checked};
                    return updatedThirdItem;
                });
                return updatedSubItem;
            });
            return updatedItem;
        });
        setSendArrData((prev => {
            const next = new Set(prev);
            touchedIds.forEach((v)=>
                checked ? next.add(v) : next.delete(v)
            )
            return Array.from(next);
        }))
        
        //모든 1뎁스 체크박스가 선택되었는지 확인
        const allDataChecked = updatedData.every((item) => item.checked);
        //전체 동의 체크박스 상태 변경
        setDataChecked(allDataChecked);
        setSubDataChecked(allDataChecked);
        setData(updatedData);
    };

    //2뎁스 체크박스 동작
    //2뎁스 체크박스 동작
    const handleSubDataChange = (checked, parentId, sub) => {
        const updatedData = data.map((item) => {
            if (item.id !== parentId) return item;
            const updatedSubData = (item.subData ?? []).map((subItem) => {
                if(subItem.id !== sub.id) return subItem;
                const updatedSubItem = {...subItem, checked};

                //3뎁스존재시 일괄토글
                if(Array.isArray(subItem.subData)&& subItem.subData.length>0) {
                    updatedSubItem.subData = subItem.subData.map((third)=> ({
                        ...third,
                        checked,
                    }))
                }
                return updatedSubItem;
            })
            const allSubChecked = updatedSubData.every((s) => s.checked);
            return {
                ...item,
                checked: allSubChecked,
                subData: updatedSubData
            }
        })
        const touchedIds = collectIdsFromSub(sub);
        updatePushData(setSendArrData, touchedIds, checked);
        const allDataChecked = updatedData.every((it) => it.checked);
        //전체 동의 체크박스 상태 변경
        setDataChecked(allDataChecked);
        setSubDataChecked(allDataChecked);
        setData(updatedData);
    };   
    //3뎁스 체크박스 동작
    const handleThirdDataChange = (checked, parentId, subParentId, third) => {
        const updatedData = data.map((item) => {
            if (item.id !== parentId) return item;
            
            const updatedSubData = (item.subData ?? []).map((subItem) => {
                if (subItem.id !== subParentId) return subItem;

                const updatedThirdData = (subItem.subData ?? []).map(t => 
                    t.id === third.id ? {...t, checked} :t
                );
                const anyThirdChecked = updatedThirdData.some(t => !!t.checked);

                return {
                    ...subItem,
                    checked: anyThirdChecked,
                    subData: updatedThirdData
                }
            });
            const allSubChecked = updatedSubData.every(s => !!s.checked);
            return{
                ...item,
                checked: allSubChecked,
                subData: updatedSubData,
            }
        });
        const allDataChecked = updatedData.every((it) => !!it.checked);
        updatePushData(setSendArrData, third.dcffStplId, checked);
        setData(updatedData);
        setDataChecked(allDataChecked);
        setSubDataChecked(allDataChecked);
    };

    //아코디언동작
    const [isSubOpen, setIsSubOpen] = useState(false);

    const toggleSubOpen = (id) => {
        setIsSubOpen((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const agreeDetailEvent = (parent, sub) => {
        let param = {
            parentId : parent.id,
            sub : sub,
            dcffStplId :sub.dcffStplId,
            dcffStplDtlSqn: sub.dcffStplDtlSqn,
            title : sub.title
        }
    //    setSubItem(param);
        setDcffObj(param);
        setIsFAPopOpen(true);
    //    setIsFAPopOpen(true);
    }
    //1뎁스 약관값추가
    const collectIds = (node) => {
        const ids = [];
        const walk = (n) => {
            if(n?.dcffStplId != null) ids.push(String(n.dcffStplId));
            (n?.subData ?? []).forEach(walk);
        }
        walk(node);
        return ids;
    }
    //2뎁스 약관값추가
    const collectIdsFromSub = (subNode) => {
        const ids = [];
        if(subNode?.dcffStplId != null) ids.push(String(subNode.dcffStplId));
        (subNode?.subData ?? []).forEach(third => {
            if(third?.dcffStplId != null) ids.push(String(third.dcffStplId));
        })
        return ids;
    }
    // Set을 사용하여 중복없이 추가/삭제
    const updatePushData = (setSendArrData, ids, checked) => {
        const idList = Array.isArray(ids) ? ids : [ids];
        setSendArrData(prev => {
            const next = new Set(prev);
            idList.forEach(id => {
                if(!id) return;
                const key = String(id);
                checked ? next.add(key) : next.delete(key);
            });
            return Array.from(next);
        })
    }
    return(
        <>
        <div className={`agreeChkWrap ${className}`}>
            <ul>
                <li className="">
                    {/* 추가  {showAllCheck && ( )} */}
                    {showAllCheck && (
                    <div className="allChk">
                        <div className="checkbox checkmark">
                            <input type="checkbox" 
                                id={`allagreechk-${uniqueId}`}
                                checked={dataChecked && subDataChecked}
                                onChange={(e) => handleAllCheckChange(e.target.checked)}
                            />
                            <label htmlFor={`allagreechk-${uniqueId}`} className="check_list mediumTit txtBold">{allTitle}</label>
                        </div>
                    </div>
                    )}
                    <ul className="">
                        {data?.map((item) => (
                            <li className="chk_wrap" key={item.id}>
                                <div className="checkbox">
                                    <span className="innerBox">
                                        <input type="checkbox" 
                                            id={`select-${uniqueId}-${item.id}`}
                                            checked={item.checked || false}
                                            onChange={(e) => handleDataChange(e.target.checked, item.id)}
                                        />
                                        <label htmlFor={`select-${uniqueId}-${item.id}`}>
                                            <span className="tit">{item.title}</span>
                                            {item.field && item.field.length > 0 && (
                                                <span className="bar">{item.field}</span>
                                            )}
                                        </label>
                                    </span>
                                     {/* 수정 - 하위영역 텍스트 버전 추가 */}
                                    {item.subContens || (item.subData && item.subData.length > 0 ) ? <button onClick={() => toggleSubOpen(item.id)} className={`moreView ${isSubOpen[item.id] ? "on" : ""}`}></button> : <button className="agreeView">보기</button>}
                                </div>
                                {/* 수정 - 하위영역 텍스트 버전 추가 */}
                                {item.subContens && (
                                <ul className={`subBox ${isSubOpen[item.id] ? "dpNone" : ""}`}>
                                    {/* 텍스트 버전 */}
                                    <li className="text">
                                        {item.subContens}
                                    </li>
                                </ul>
                                )}
                                {/*하위영역 체크박스 버전 */}
                                {item.subData && item.subData.length > 0 && (
                                    <ul className={`subBox ${isSubOpen[item.id] ? "dpNone" : ""}`}>
                                        {item.subData.map((sub) => (
                                            <li className="chk_wrap" key={sub.id}>
                                                <div className="checkbox small">
                                                    <span className="innerBox">
                                                        <input type="checkbox"  
                                                            id={`select-${uniqueId}-${sub.id}`}
                                                            checked={sub.checked || false}
                                                            onChange={(e) => handleSubDataChange(e.target.checked, item.id, sub)}
                                                        />
                                                        <label htmlFor={`select-${uniqueId}-${sub.id}`}>
                                                            <span className="tit">{sub.title}</span>
                                                        </label>
                                                    </span>
                                                    {sub.agreeView !== false && ( <button className="agreeView" onClick={() => agreeDetailEvent(item, sub)}>보기</button>)}
                                                </div>
                                                {sub.subData && sub.subData.length > 0 && (
                                                <ul className="thirdBox">
                                                    {sub.subData.map((third) => (
                                                        <li className="chk_wrap" key={third.id}>
                                                            <div className="checkmark small">
                                                                <span className="innerBox">
                                                                    <input type="checkbox"  
                                                                        id={`select-${uniqueId}-${third.id}`}
                                                                        checked={third.checked || false}
                                                                        onChange={(e) => handleThirdDataChange(e.target.checked, item.id, sub.id, third)}
                                                                    />
                                                                    <label htmlFor={`select-${uniqueId}-${third.id}`}>
                                                                        <span className="tit">{third.title}</span>
                                                                    </label>
                                                                </span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </li>
            </ul>					
        </div>
        </>
    );
}
export default AgreeAllChkBoxThirdType;