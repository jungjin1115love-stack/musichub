const Footer = () => (
  <footer className="border-t mt-8" style={{ background: "#0d0f1a", borderColor: "rgba(212,175,55,0.15)" }}>
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* 로고 + 태그라인 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🥁</span>
        <span className="text-lg font-extrabold" style={{ color: "#D4AF37" }}>DrumHub</span>
      </div>
      <p className="text-sm mb-5 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
        대한민국 드럼 강사의 종착역 — 구인·구직·포트폴리오
      </p>

      {/* 연락처 + 링크 */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
        <a href="mailto:contact@drumhub.kr"
           className="transition-colors hover:opacity-80"
           style={{ color: "#D4AF37" }}>
          ✉️ contact@drumhub.kr
        </a>
        <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
        <span className="cursor-pointer hover:opacity-70 transition-opacity">서비스 이용약관</span>
        <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
        <span className="cursor-pointer hover:opacity-70 transition-opacity">개인정보처리방침</span>
        <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
        <span className="cursor-pointer hover:opacity-70 transition-opacity">공지사항</span>
      </div>

      {/* 법적 고지 */}
      <div className="rounded-xl p-4 text-xs leading-relaxed mb-5 space-y-2"
           style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}>
        <p>
          <strong style={{ color: "rgba(255,255,255,0.5)" }}>【면책 고지】</strong>{" "}
          DrumHub에 게시된 강사 프로필·채용 공고·학원 정보는 이용자가 직접 등록한
          내용이며, DrumHub는 해당 정보의 정확성·신뢰성·합법성을 보증하지 않습니다.
        </p>
        <p>
          DrumHub의 검색 결과는 참고용이며, 실제 채용·레슨 계약은 당사자 간에 직접
          확인하시기 바랍니다. DrumHub는 이용자 간 거래에 개입하지 않습니다.
        </p>
        <p>
          서비스 이용 중 발생하는 모든 거래·계약·분쟁은 당사자 간에 직접 해결하시기
          바랍니다. DrumHub는 어떠한 보증도 제공하지 않습니다.
        </p>
      </div>

      {/* 카피라이트 */}
      <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        © 2026 DrumHub. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
