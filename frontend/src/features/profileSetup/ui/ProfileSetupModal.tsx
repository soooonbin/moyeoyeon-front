// src/features/profileSetup/ui/ProfileSetupModal.tsx
import React, { useState } from "react";
import BaseModal from "@/shares/ui/modal/BaseModal";
import ActionButton from "@/shares/ui/button/ActionButton";
import clsx from "clsx";

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (d: { avatar: string; nickname: string }) => void;
}

const AVATARS = [
    "/avatars/gift.png",
    "/avatars/snowman1.png",
    "/avatars/snowman2.png",
    "/avatars/elf.png",
    "/avatars/santa.png",
    "/avatars/snowman3.png",
];

const ProfileSetupModal: React.FC<Props> = ({ open, onClose, onSave }) => {
    const [selected, setSelected] = useState(AVATARS[0]);
    const [nickname, setNickname] = useState("");

    const handleSave = () => {
        if (!nickname.trim()) {
            alert("닉네임을 입력해 주세요!");
            return;
        }
        onSave({ avatar: selected, nickname: nickname.trim() });
    };

    if (!open) return null;

    return (
        /* 가로폭을 800px로 살짝 넓힘 */
        <BaseModal open={open} onClose={onClose} maxWidth={800} hideCloseIcon>
            {/* 상·하 패딩과 중간 여백을 더 줄여 전체 높이 ↓ */}
            <div className="relative overflow-hidden rounded-[40px] bg-[#ba4d4e] pt-4 pb-6 text-center text-white">
                {/* 상단 흰색 곡선 (살짝 낮춤) */}
                <div className="absolute inset-x-0 top-0 h-[160px] rounded-b-[240px] bg-[#fffbea]" />

                {/* 큰 아바타 */}
                <div className="relative z-10 mt-[60px] flex justify-center">
                    <img
                        src={selected}
                        alt="avatar"
                        className="h-[140px] w-[140px] rounded-full border-[8px] border-[#ba4d4e] object-cover"
                    />
                </div>

                {/* 아바타 선택 리스트 (위·아래 간격 조금 축소) */}
                <div className="mt-4 mb-6 flex justify-center gap-5">
                    {AVATARS.map((url) => (
                        <button
                            key={url}
                            onClick={() => setSelected(url)}
                            className={clsx(
                                "h-14 w-14 rounded-full border-2 transition",
                                url === selected
                                    ? "scale-110 border-[#38c172]"
                                    : "border-transparent opacity-75 hover:opacity-100"
                            )}
                        >
                            <img
                                src={url}
                                alt=""
                                className="h-full w-full rounded-full object-cover"
                            />
                        </button>
                    ))}
                </div>

                {/* 닉네임 입력 (간격 살짝 축소) */}
                <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    className="mx-auto mb-4 block w-[50%] border-0 border-b-2 border-white bg-transparent py-2 text-center text-3xl font-medium placeholder:text-white/60 focus:outline-none"
                />

                {/* 프로필 저장 버튼 (위치 그대로) */}
                <ActionButton onClick={handleSave} className="mx-auto w-[260px]">
                    프로필 저장
                </ActionButton>
            </div>
        </BaseModal>
    );
};

export default ProfileSetupModal;
