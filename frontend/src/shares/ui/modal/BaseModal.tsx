import React, { ReactNode, MouseEvent } from "react";
import { X } from "lucide-react";

interface BaseModalProps {
    /** 모달 표시 여부 */
    open: boolean;
    /** 오버레이 또는 X 버튼 클릭 시 */
    onClose: () => void;
    /** 모달 본문 */
    children: ReactNode;
    /** 카드(내용) 최대 폭 – 기본 600px */
    maxWidth?: string | number;
    /** X 아이콘 숨김 여부 */
    hideCloseIcon?: boolean;
}

/**
 * 💡 앱 전역에서 공통으로 쓰는 “껍데기” 모달 컴포넌트
 *  - 오버레이(검은 반투명) + 중앙 카드 레이아웃
 *  - Tailwind‧shadcn 프로젝트 어디서든 import 가능
 */
const BaseModal: React.FC<BaseModalProps> = ({
                                                 open,
                                                 onClose,
                                                 children,
                                                 maxWidth = 600,
                                                 hideCloseIcon = false,
                                             }) => {
    if (!open) return null;

    /* 오버레이 배경 클릭 시 닫기 */
    const handleBackgroundClick = (e: MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={handleBackgroundClick}
        >
            <div
                className="relative w-[90%] rounded-[40px] bg-white text-center shadow-xl"
                style={{ maxWidth }}
            >
                {/* 닫기 아이콘 */}
                {!hideCloseIcon && (
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 rounded-full p-1.5 text-gray-600 hover:bg-gray-100"
                    >
                        <X className="h-6 w-6" />
                    </button>
                )}

                {/* 모달 내용 */}
                {children}
            </div>
        </div>
    );
};

export default BaseModal;
