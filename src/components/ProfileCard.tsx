import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Briefcase,
  CheckCircle,
  MessageCircle,
  Copy,
  Check,
  Music,
} from "lucide-react";

export interface InstructorProfile {
  name: string;
  major: string;
  school: string;
  experience: string;
  tagline: string;
  verifiedSchool: boolean;
  verifiedCareer: boolean;
  youtubeId?: string;
  curriculum: string[];
  kakaoLink: string;
  profileId: string;
  emoji?: string;
}

interface ProfileCardProps {
  profile: InstructorProfile;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const [copied, setCopied] = useState(false);

  const muleText = `[레슨 강사 프로필] MusicHub
━━━━━━━━━━━━━━━━━━━
👤 ${profile.name} (${profile.major})
🎓 ${profile.school} · ${profile.experience}
${profile.verifiedSchool ? "✅ 학력 인증" : ""}  ${profile.verifiedCareer ? "✅ 경력 확인" : ""}
━━━━━━━━━━━━━━━━━━━
📚 레슨 커리큘럼
${profile.curriculum.map((c) => `• ${c}`).join("\n")}
━━━━━━━━━━━━━━━━━━━
💬 카카오톡 문의: ${profile.kakaoLink}
🔗 프로필 보기: musichub.kr/p/${profile.profileId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(muleText);
    } catch {
      // clipboard API 미지원 환경에서는 조용히 무시
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100 w-full max-w-sm">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#ff8a3d] to-[#e85d00] p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl select-none">
            {profile.emoji ?? "🎵"}
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            {profile.verifiedSchool && (
              <Badge className="bg-white/25 text-white border border-white/40 text-xs gap-1 px-2 py-0.5">
                <GraduationCap size={11} />
                학력 인증
              </Badge>
            )}
            {profile.verifiedCareer && (
              <Badge className="bg-white/25 text-white border border-white/40 text-xs gap-1 px-2 py-0.5">
                <Briefcase size={11} />
                경력 확인
              </Badge>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-extrabold leading-tight">{profile.name}</h2>
        <p className="text-white/85 text-sm font-semibold mt-0.5">
          {profile.major} · {profile.school}
        </p>
        <p className="text-white/65 text-xs mt-1">{profile.tagline}</p>
      </div>

      {/* ── Video Embed ── */}
      <div className="bg-black">
        {profile.youtubeId ? (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${profile.youtubeId}?rel=0&modestbranding=1`}
              className="w-full h-full"
              allowFullScreen
              title={`${profile.name} 연주 영상`}
            />
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white/40">
            <Music size={44} className="mb-2" />
            <p className="text-sm">연주 영상 준비 중</p>
          </div>
        )}
      </div>

      {/* ── Curriculum & CTA ── */}
      <div className="p-5">
        <h3 className="font-extrabold text-gray-800 text-base mb-3">📚 레슨 커리큘럼</h3>
        <ul className="space-y-2 mb-5">
          {profile.curriculum.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle size={15} className="text-[#ff8a3d] mt-0.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <a href={profile.kakaoLink} target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-[#fee500] hover:bg-[#f0d900] text-[#3c1e1e] font-extrabold rounded-xl h-12 text-base gap-2 shadow-sm">
              <MessageCircle size={18} />
              카카오톡으로 문의하기
            </Button>
          </a>
          <Button
            variant="outline"
            className="w-full border-2 border-[#ff8a3d] text-[#ff8a3d] hover:bg-orange-50 font-bold rounded-xl h-11 text-sm gap-2 transition-colors"
            onClick={handleCopy}
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? "클립보드에 복사 완료! ✅" : "DrumHub 프로필 양식 복사"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
