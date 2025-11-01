import React, { useEffect } from "react";
import { X } from "lucide-react";

interface HeaderOverlayMenuProps {
    open: boolean;
    onClose: () => void;
    onEditProfile: () => void;
    onInvite: () => void;
    /** 배경만 보이고 내부 콘텐츠(로고/버튼/X)는 숨김 */
    dimOnly?: boolean;
}

/**
 * 모바일 전용 전체 화면 헤더 메뉴 (ChatRoom 캔버스와 동일 폭: max-w-[375px])
 * - dimOnly=true면 배경만(내용 숨김) → 모달 뒤 배경용
 */
const HeaderOverlayMenu: React.FC<HeaderOverlayMenuProps> = ({
                                                                 open,
                                                                 onClose,
                                                                 onEditProfile,
                                                                 onInvite,
                                                                 dimOnly = false,
                                                             }) => {
    // ESC 닫기
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            /* ▼ z-index를 낮춰 모달이 항상 위로 오도록 */
            className="fixed inset-0 z-[600] flex justify-center bg-black/50"
            role="dialog"
            aria-modal="true"
        >
            {/* ChatRoom과 동일한 모바일 캔버스 폭 */}
            <div className="relative flex min-h-[100svh] w-full max-w-[375px] flex-col bg-[#2E2E2E] text-white">
                {!dimOnly && (
                    <>
                        {/* 상단바 */}
                        <div className="flex items-center justify-between px-5 pt-6">
                            <span className="text-sm font-bold tracking-widest">MOYEOYEON</span>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 hover:bg-white/10"
                                aria-label="close"
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        {/* 버튼 영역: 상단 쪽(왼쪽 치우침) */}
                        <div className="mt-10 flex flex-col items-start gap-4 px-6">
                            <button
                                onClick={onEditProfile}
                                className="w-[80%] rounded-xl bg-white/90 px-6 py-4 text-left text-lg font-semibold text-[#2E2E2E] shadow hover:bg-white"
                            >
                                프로필 편집
                            </button>
                            <button
                                onClick={onInvite}
                                className="w-[80%] rounded-xl bg-white/90 px-6 py-4 text-left text-lg font-semibold text-[#2E2E2E] shadow hover:bg-white"
                            >
                                초대하기
                            </button>
                        </div>
                    </>
                )}

                {/* 안전영역 */}
                <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
        </div>
    );
};

export default HeaderOverlayMenu;
