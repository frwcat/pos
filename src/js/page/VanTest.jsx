import React from "react";

// Recoil
import { useRecoilState } from "recoil";
import { VanAtom } from "../atom/VanAtom";

// Jotai
import { useAtom } from "jotai";
import { VanAtomJotai } from "../atom/VanAtomJotai";

const VanTest = () => {
  // Recoil
  const [recoilVan, setRecoilVan] = useRecoilState(VanAtom);

  // Jotai
  const [jotaiVan, setJotaiVan] = useAtom(VanAtomJotai);

  return (
    <>
    <div style={{ padding: "20px" }}>
      <h2>🔥 Recoil vs Jotai 테스트</h2>

      {/* Recoil */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Recoil</h3>
        <p>현재 값: {recoilVan}</p>

        <button onClick={() => setRecoilVan("KIS")}>KIS</button>
        <button onClick={() => setRecoilVan("NICE")}>NICE</button>
        <button onClick={() => setRecoilVan("MLPX")}>MLPX</button>
      </div>

      {/* Jotai */}
      <div>
        <h3>Jotai</h3>
        <p>현재 값: {jotaiVan}</p>

        <button onClick={() => setJotaiVan("KIS")}>KIS</button>
        <button onClick={() => setJotaiVan("NICE")}>NICE</button>
        <button onClick={() => setJotaiVan("MLPX")}>MLPX</button>
      </div>

      <hr />

      <h4>🧪 테스트 방법</h4>
      <ul>
        <li>값 변경 → 새로고침</li>
        <li>둘 다 유지되는지 확인</li>
        <li>깜빡임 있는지 확인</li>
      </ul>
    </div>
    </>
  );
}

export default VanTest;