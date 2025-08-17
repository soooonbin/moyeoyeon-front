import React, { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge"; // 선택: className 병합용

/**
 * 🔸 모여연의 대표 CTA(Primary) 버튼
 *  - 기본 스타일을 지정하고 props.className 으로 추가/덮어쓰기 가능
 */
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

const ActionButton: React.FC<Props> = ({ className, children, ...rest }) => (
    <button
        {...rest}
        className={twMerge(
            "inline-block w-[260px] rounded-full border border-white " +
            "py-4 text-base font-semibold transition " +
            "bg-[#fffbea] text-[#ba4d4e] hover:bg-white/90",
            className
        )}
    >
        {children}
    </button>
);

export default ActionButton;
