import React from "react";
import BaseModal from "@/shares/ui/modal/BaseModal";
import ActionButton from "@/shares/ui/button/ActionButton";

interface ShareLinkModalProps {
    open: boolean;
    onClose: () => void;
    /** 실제 초대 링크 – 아직 없으면 빈 문자열 전달 */
    link?: string;
    maxWidth?: number | string;
}

/**
 * “친구 초대 링크” 모달
 *  - BaseModal 레이아웃을 그대로 사용
 *  - 복사 버튼 클릭 → 클립보드 복사(임시 알림) 처리
 */
const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
                                                           open,
                                                           onClose,
                                                           link = "https://example.com/invite/xxxxxxxx",
    maxWidth,
                                                       }) => {
    /* 클립보드 복사 */
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            alert("링크가 클립보드에 복사되었습니다!");
        } catch {
            alert("복사에 실패했습니다. 수동으로 복사해 주세요.");
        }
    };

    return (
        <BaseModal open={open} onClose={onClose} maxWidth={maxWidth}>
            <div className="px-14 py-16 bg-[#ba4d4e] rounded-[40px] text-white">
                <p className="mb-10 text-xl font-medium leading-relaxed">
                    아래 링크를 함께하고 싶은 친구에게 전달해 주세요
                </p>

                {/* 링크 input */}
                <input
                    type="text"
                    readOnly
                    value={link}
                    className="mx-auto w-full rounded-full bg-[#fffbea] py-4 text-center text-base text-[#333] outline-none"
                />

                {/* 복사 버튼 */}
                <ActionButton
                    onClick={handleCopy}
                    className="mt-12 inline-block w-[260px] rounded-full border border-white py-4 text-base font-semibold transition hover:bg-white hover:text-[#ba4d4e]"
                >
                    복사하기
                </ActionButton>
            </div>
        </BaseModal>
    );
};

export default ShareLinkModal;
