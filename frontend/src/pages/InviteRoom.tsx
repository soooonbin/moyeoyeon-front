// src/pages/InviteRoom.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import ActionButton from "@/shares/ui/button/ActionButton";
import ProfileSetupModal from "@/features/profileSetup/ui/ProfileSetupModal";

const InviteRoom: React.FC = () => {
    const { inviteId } = useParams<{ inviteId: string }>(); // /invite/:inviteId
    const navigate = useNavigate();

    /** 패스키 3칸 */

    const [passkey, setPasskey] = useState<string[]>(["", "", ""]);

    /** 프로필 설정 모달 표시 여부 */
    const [showProfileModal, setShowProfileModal] = useState(false);

    /* ---------------- 입장 버튼 ---------------- */
    const handleEnter = async () => {
        try {
            // TODO: 초대 토큰 + 패스키 검증 API 호출
            console.log("join room with", inviteId, passkey);

            /** 검증 성공 → 프로필 설정 모달 오픈 */
            setShowProfileModal(true);
        } catch (err) {
            alert("입장에 실패했습니다. 초대 키를 확인해 주세요.");
        }
    };

    /* 프로필 저장 후 방으로 이동 */
    const handleProfileSave = (data: { avatar: string; nickname: string }) => {
        console.log("saved profile:", data); // TODO: 서버에 저장
        navigate(`/chat-room/123`);          // 실제 roomId로 교체
    };

    /* ------------------- UI ------------------- */
    return (
        <div className="relative min-h-screen text-white">
            {/* 배경 블러 + 어둡게 */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* 중앙 카드 */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-[860px] rounded-[40px] bg-[#ba4d4e] px-16 py-20 text-center">
                    {/* 타이틀 */}
                    <h1 className="mb-6 text-4xl font-bold tracking-wide">
                        Welcome to&nbsp;MOYEOYEON&nbsp;!
                    </h1>

                    {/* 설명 */}
                    <p className="mx-auto mb-10 max-w-[780px] leading-relaxed">
                        당신의 2025년을 정리하는 시간, 연말에만 열리는 특별한 공간 모여연입니다.
                        <br />
                        모여연의 질문 카드로 올해의 순간들을 되돌아보세요. 혼자서 조용히,
                        또는 소중한 이들과 함께 이야기해도 좋습니다.
                        <br />
                        성취와 도전, 웃음과 눈물로 가득했던 한 해를 마음에 새기는
                        특별한 시간이 되시길 바랍니다.
                    </p>

                    {/* 초대 키 안내 */}
                    <p className="mb-6 text-2xl font-semibold">초대 키를 입력해주세요</p>

                    {/* 패스키 3칸 */}
                    <div className="mx-auto mb-12 flex max-w-[680px] gap-8">
                        {passkey.map((v, i) => (
                            <Input
                                key={i}
                                placeholder={`WORD ${i + 1}`}
                                value={v}
                                onChange={(e) => {
                                    const next = [...passkey];
                                    next[i] = e.target.value.trim();
                                    setPasskey(next);
                                }}
                                className="flex-1 rounded-full bg-[#fffbea] py-6 text-center text-black placeholder:text-gray-400"
                            />
                        ))}
                    </div>

                    {/* 입장 버튼 */}
                    <ActionButton onClick={handleEnter} className="mx-auto">
                        입장하기
                    </ActionButton>
                </div>
            </div>

            {/* ───────── 프로필 설정 모달 ───────── */}
            <ProfileSetupModal
                open={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onSave={handleProfileSave}
            />
        </div>
    );
};

export default InviteRoom;
