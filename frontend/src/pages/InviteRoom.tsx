// src/pages/InviteRoom.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import ActionButton from "@/shares/ui/button/ActionButton";

const InviteRoom: React.FC = () => {
    const { inviteId } = useParams<{ inviteId: string }>();
    const navigate = useNavigate();

    const [passkey, setPasskey] = useState<string[]>(["", "", ""]);

    /** 입장 버튼 클릭 */
    const handleEnter = async () => {
        try {
            console.log("join room with", inviteId, passkey);
            // TODO: 초대키 검증 API
            navigate(`/chat-room/123`); // 실제 roomId로 교체
        } catch {
            alert("입장에 실패했습니다. 초대 키를 확인해 주세요.");
        }
    };

    return (
        <div
            className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage:
                    "url('/images/invite-bg.jpg')", // 로컬 또는 퍼블릭 경로 이미지 사용
            }}
        >
            {/* 반투명 오버레이 */}
            <div className="absolute inset-0 bg-black/20" />

            {/* 초대 카드 */}
            <div className="relative z-10 w-[90%] max-w-[420px] rounded-[24px] bg-[#c44d3b]/90 px-8 py-10 text-center text-white shadow-lg">
                {/* 로고 */}
                <h1 className="mb-6 text-2xl font-bold tracking-wide">
                    MOYEOYEON
                </h1>

                {/* 방 제목 */}
                <h2 className="mb-4 text-lg font-bold">
                    방방이름방이름's 2025
                </h2>

                {/* 설명 문구 */}
                <p className="mb-6 text-sm leading-relaxed text-white/90">
                    친구가 당신을 모여연에 초대했습니다.
                    <br />
                    함께 2025년을 돌아보며
                    <br />
                    소중한 추억을 만들어보세요.
                </p>

                {/* 초대 키 안내 */}
                <p className="mb-4 text-sm font-semibold">
                    🔑 초대 키를 입력해 주세요!
                </p>

                {/* 입력창 3개 */}
                <div className="mx-auto mb-6 flex flex-col gap-3">
                    {passkey.map((v, i) => (
                        <Input
                            key={i}
                            value={v}
                            onChange={(e) => {
                                const next = [...passkey];
                                next[i] = e.target.value.trim();
                                setPasskey(next);
                            }}
                            className="rounded-full bg-[#fff8ec] py-4 text-center text-black placeholder:text-gray-400"
                        />
                    ))}
                </div>

                {/* 입장 버튼 */}
                <button
                    onClick={handleEnter}
                    className="mx-auto w-[140px] rounded-full bg-white/20 py-3 text-sm font-semibold text-white hover:bg-white/30"
                >
                    입장하기
                </button>
            </div>
        </div>
    );
};

export default InviteRoom;
