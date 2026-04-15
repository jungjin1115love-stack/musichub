const Footer = () => (
  <footer className="bg-white border-t border-gray-100 mt-8">
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* 로고 + 태그라인 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🎵</span>
        <span className="text-lg font-extrabold text-[#ff8a3d]">MusicHub</span>
      </div>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">
        음악인을 위한 가장 쉬운 포트폴리오 &amp; 정보 플랫폼
      </p>

      {/* 연락처 + 링크 */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-5">
        <a href="mailto:contact@musichub.kr"
           className="hover:text-[#ff8a3d] transition-colors">
          ✉️ contact@musichub.kr
        </a>
        <span className="hidden sm:inline text-gray-200">|</span>
        <span className="cursor-pointer hover:text-gray-600 transition-colors">서비스 이용약관</span>
        <span className="hidden sm:inline text-gray-200">|</span>
        <span className="cursor-pointer hover:text-gray-600 transition-colors">개인정보처리방침</span>
        <span className="hidden sm:inline text-gray-200">|</span>
        <span className="cursor-pointer hover:text-gray-600 transition-colors">공지사항</span>
      </div>

      {/* 법적 고지 */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 leading-relaxed mb-5 space-y-2">
        <p>
          <strong className="text-gray-500">【면책 고지】</strong>{" "}
          MusicHub에 게시된 강사 프로필·채용 공고·학원 정보는 이용자가 직접 등록한
          내용이며, MusicHub는 해당 정보의 정확성·신뢰성·합법성을 보증하지 않습니다.
        </p>
        <p>
          외부 링크(뮬, 당근마켓, 숨고, 크몽 등)는 해당 사이트의 정책에 따르며,
          MusicHub는 외부 사이트의 내용 및 그로 인해 발생하는 손해에 대해 책임을 지지
          않습니다.
        </p>
        <p>
          서비스 이용 중 발생하는 모든 거래·계약·분쟁은 당사자 간에 직접 해결하시기
          바랍니다. MusicHub는 이용자 간 거래에 개입하지 않으며 어떠한 보증도 제공하지
          않습니다.
        </p>
      </div>

      {/* 카피라이트 */}
      <p className="text-center text-xs text-gray-300">
        © 2026 MusicHub. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
