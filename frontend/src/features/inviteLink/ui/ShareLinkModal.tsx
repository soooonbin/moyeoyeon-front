// src/features/inviteLink/ui/ShareLinkModal.tsx
import React from "react";
import { BaseModal, ActionButton } from "@/shares/ui";

interface ShareLinkModalProps {
    open: boolean;
    onClose: () => void;
    /** 실제 초대 링크 – 아직 없으면 빈 문자열 전달 */
    link?: string;
    /** 넘어와도 모바일에서는 360px로 클램프 */
    maxWidth?: number | string;
    isLoading?: boolean;
}

/**
 * 친구 초대 링크 모달 (모바일 전용)
 * - 항상 모바일 폭으로 표시되도록 maxWidth를 내부에서 360px로 고정
 */
const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
                                                           open,
                                                           onClose,
                                                           link = "",
                                                            isLoading = false,
                                                       }) => {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            alert("링크가 클립보드에 복사되었습니다!");
        } catch {
            alert("복사에 실패했습니다. 수동으로 복사해 주세요.");
        }
    };

    if (!open) return null;

    // 모바일 고정 폭
    const MOBILE_MAX = 360;

    return (
        <BaseModal open={open} onClose={onClose} maxWidth={MOBILE_MAX} hideCloseIcon>
            <div className="mx-auto w-[min(92vw,360px)]">
                {/* 빨간 카드 */}
                <div className="relative rounded-[18px] bg-[#C83B44] px-6 pt-10 pb-8 text-white shadow-xl">
                    {/* 우상단 원형 닫기 */}
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={onClose}
                        className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#C83B44] text-white shadow"
                    >
                        ×
                    </button>

                    {/* 안내 문구 */}
                    <p className="mb-6 text-center text-[14px] leading-6">
                        아래 링크를 함께하고 싶은
                        <br />
                        친구에게 전달해주세요
                    </p>

                    {isLoading ? (
                        <div className="mx-auto w-full rounded-[12px] border border-white/10 bg-[#FFF2E9] px-4 py-3 text-center text-[13px] text-[#999]">
                            링크 생성 중...
                        </div>
                    ) : (
                        <input
                            type="text"
                            readOnly
                            value={link || "링크 생성에 실패했습니다"}
                            onFocus={(e) => e.currentTarget.select()}
                            className="mx-auto w-full truncate rounded-[12px] border border-white/10 bg-[#FFF2E9] px-4 py-3 text-center text-[13px] text-[#333] shadow-inner outline-none"
                        />
                    )}

                    {/* ✅ 수정: 복사 버튼 - 로딩 중이거나 링크가 없으면 비활성화 */}
                    <ActionButton
                        onClick={handleCopy}
                        disabled={isLoading || !link}
                        className="mx-auto mt-7 w-[200px] rounded-full border border-white/25 bg-white/35 py-2.5 text-[14px] text-white backdrop-blur-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "생성 중..." : "복사하기"}
                    </ActionButton>
                </div>
            </div>
        </BaseModal>
    );
};

export default ShareLinkModal;
