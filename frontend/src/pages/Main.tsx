// src/pages/Main.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/** 이미지 자산 경로 (Vite: /public 하위 권장) */
const BG_URL = "/images/main-bg.jpg";                 // 전체 배경 이미지
const TITLE_URL = "/images/how-was-2025-title.png";   // "How was your 2025" 타이틀 이미지

const Main: React.FC = () => {
    const navigate = useNavigate();

    return (
        // 데스크탑 미리보기에서도 중앙에 "모바일 캔버스"가 보이도록 래핑
        <main className="min-h-[100svh] bg-black flex items-center justify-center">
            {/* 기본 375, 기종별 소폭 확장, 높이는 모바일 전체/데스크탑 미리보기 812 유지 */}
            <section
                className={[
                    "relative w-full",
                    "max-w-[375px] sm:max-w-[390px] md:max-w-[414px] lg:max-w-[428px]",
                    "min-h-[100svh] md:min-h-[812px]",
                    "bg-cover bg-center bg-no-repeat overflow-hidden",
                    "text-white",
                ].join(" ")}
                style={{ backgroundImage: `url(${BG_URL})` }}
                aria-label="MoyeoYeon 메인"
            >
                {/* 가독성 향상을 위한 반투명 오버레이 (상단 살짝 더 어둡게) */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/45" />

                {/* 상단 로고 배지 & 보조 배지 */}
                <header className="relative pt-6 pb-2 flex flex-col items-center">
                    {/* MOYEOYEON 테두리 배지 */}
                    <div className="px-5 py-1 rounded-[16px] border border-white/70 text-[13px] tracking-wide font-semibold bg-black/10 backdrop-blur-[1px]">
                        MOYEOYEON
                    </div>

                    {/* 2025's last 21 days 칩 */}
                    <div className="mt-2 px-4 py-1 rounded-full bg-white/85 text-[12px] text-black font-medium">
                        2025&apos;s last 21 days
                    </div>
                </header>

                {/* 타이틀 이미지: How was your 2025 */}
                <div className="relative mt-4 flex justify-center">
                    <img
                        src={TITLE_URL}
                        alt="How was your 2025"
                        className="w-[270px] md:w-[300px] h-auto select-none pointer-events-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
                        loading="eager"
                    />
                </div>

                {/* 본문 카피 (텍스트) */}
                <div className="relative mt-4 px-6">
                    <p className="whitespace-pre-line text-center leading-6 text-[14.5px] font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                        연말에만 열리는 특별한 공간,
                        모여연입니다.
                        {"\n"}소중한 사람들과 함께
                        모여연이 준비한 질문들을 통해
                        서로의 마음을 들여다보고,
                        {"\n"}때로는 웃으며,
                        때로는 깊이 생각하며
                        2025년을 마무리해보세요.
                        {"\n"}혼자서는 기억하지 못했던 순간들도
                        함께하면 더 선명해집니다.
                    </p>
                </div>

                {/* 하단 CTA & 카피라이트 */}
                <footer className="relative mt-6 pb-[calc(28px+env(safe-area-inset-bottom,0px))] px-6">
                    {/* 시작하기 버튼 (텍스트) */}
                    <div className="flex justify-center">
                        <Button
                            aria-label="시작하기"
                            onClick={() => navigate("/create-room")}
                            className={[
                                "w-full max-w-[230px] h-14",
                                "rounded-full",
                                "bg-white/35 hover:bg-white/45",
                                "border border-white/60",
                                "text-white text-[18px] font-extrabold tracking-wide",
                                "shadow-[inset_0_0_20px_rgba(255,255,255,0.25)]",
                                "backdrop-blur-md",
                                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/70 focus-visible:ring-offset-black/0",
                            ].join(" ")}
                        >
                            시작하기
                        </Button>
                    </div>

                    {/* 카피라이트 (텍스트) */}
                    <div className="mt-6 text-center text-[10px] tracking-wider text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                        © 2025 MOYEOYEON ALL RIGHTS RESERVED
                    </div>
                </footer>
            </section>
        </main>
    );
};

export default Main;
