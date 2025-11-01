import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ───────── 백엔드 응답 타입(유연하게) ───────── */
interface ServerUserInfo {
    userId: number;
    userName: string;
    userImg?: number | string;
    userColor?: string;
    isOwner?: boolean;
}
type TeamChatRoomResponse =
    | {
    roomId: number;
    roomName: string;
    roomQnum: number;
    userInfo?: ServerUserInfo[] | ServerUserInfo | null;
    userId?: number;
}
    | any;

/* ✅ 항상 절대주소 사용: env 없으면 8080 기본 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

/* 소문자/트림 정규화 */
const norm = (s?: string) => (s ?? "").trim().toLowerCase();

const CreateRoom: React.FC = () => {
    const navigate = useNavigate();

    /* ───────── 고정 값 ───────── */
    const headerText = "MOYEOYEON";
    const roomType = "group";

    /* ───────── 폼 상태 ───────── */
    const [roomName, setRoomName] = useState("");
    const [questionCount, setQuestionCount] = useState<number>(5);
    const [passkeyParts, setPasskeyParts] = useState(["", "", ""]);
    const [userName, setUserName] = useState("");

    /* ───────── 유효성 검사 ───────── */
    const isValidRoomName = (v: string) => v.trim().length >= 2 && v.trim().length <= 50;
    const isValidPassword = (arr: string[]) => arr.every((w) => w.length >= 1 && w.length <= 10);
    const isValidUserName = (v: string) => v.trim().length >= 1 && v.trim().length <= 10;

    /** 전체 폼 유효 여부 → 버튼 활성화용 */
    const isFormValid = useMemo(
        () => isValidRoomName(roomName) && isValidPassword(passkeyParts) && isValidUserName(userName),
        [roomName, passkeyParts, userName]
    );

    /* ───────── 입력 핸들러 ───────── */
    const handleRoomNameChange = (v: string) => setRoomName(v.slice(0, 50)); // 50자 제한
    const handlePasskeyChange = (idx: number, value: string) => {
        const cleaned = value.replace(/\s/g, ""); // 공백 제거
        const next = [...passkeyParts];
        next[idx] = cleaned.slice(0, 10); // 10자 제한
        setPasskeyParts(next);
    };
    const handleUserNameChange = (v: string) => setUserName(v.replace(/\s/g, "").slice(0, 10)); // 공백 제거 + 10자 제한

    /* ───────── 방 생성 ───────── */
    const handleCreateRoom = async () => {
        if (!isFormValid) return;

        const roomPassword = {
            firstWord: passkeyParts[0],
            secondWord: passkeyParts[1],
            thirdWord: passkeyParts[2],
        };

        const userInfo = {
            userName: userName.trim(),
            userImg: Math.floor(Math.random() * 6) + 1, // 1~6
            userColor: Math.floor(Math.random() * 5) + 1, // 1~5
        };

        const requestBody = {
            roomName,
            roomType,
            roomQnum: questionCount,
            roomPassword,
            userInfo,
        };

        try {
            const res = await fetch(`${API_BASE}/api/room`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            // 상태 코드 우선 체크
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`Failed to create room (${res.status}) ${text}`);
            }

            // ✅ Content-Type 검사(HTML이면 이유 미리보기)
            const ct = res.headers.get("content-type") || "";
            if (!ct.includes("application/json")) {
                const hint = await res.text().catch(() => "");
                alert(
                    `방 생성 API 응답이 JSON이 아닙니다(${ct}).\n응답 미리보기:\n${hint.slice(0, 200)}`
                );
                return;
            }

            const data: TeamChatRoomResponse = await res.json();

            // ✅ 응답에서 내 userId 안전하게 추출
            let myUserId: number | undefined = undefined;

            const ui = (data as any)?.userInfo;
            if (Array.isArray(ui)) {
                const me = (ui as ServerUserInfo[]).find((u) => norm(u.userName) === norm(userName));
                myUserId = me?.userId;
            } else if (ui && typeof ui === "object" && "userId" in ui) {
                myUserId = Number((ui as any).userId) || undefined;
            } else if (typeof (data as any)?.userId === "number") {
                myUserId = (data as any).userId;
            }
            console.log("사용자아이디는?  ", myUserId);

            // 방별로 로컬 저장(새로고침/직접접속 대비)
            try {
                localStorage.setItem(`moyeo:room:${(data as any)?.roomId}:userId`, myUserId != null ? String(myUserId) : "");
                localStorage.setItem(`moyeo:room:${(data as any)?.roomId}:userName`, userName.trim());
            } catch {}

            navigate(`/chat-room/${(data as any)?.roomId}`, {
                state: {
                    roomName: (data as any)?.roomName,
                    roomQnum: (data as any)?.roomQnum,
                    userName,
                    userId: myUserId, // 없을 수도 있으니 ChatRoom에서 보강
                },
            });
        } catch (err) {
            console.error(err);
            alert("방 생성에 실패했습니다. 다시 시도해 주세요.");
        }
    };

    return (
        // 데스크톱에서 중앙 정렬된 모바일 캔버스로 보이도록 래핑
        <main className="min-h-[100svh] bg-[#f3f4f6] flex items-center justify-center">
            {/* 모바일 캔버스: 기본 375, 주요 기종 폭 대응 */}
            <section
                className={[
                    "relative w-full",
                    "max-w-[375px] sm:max-w-[390px] md:max-w-[414px] lg:max-w-[428px]",
                    "min-h-[100svh] md:min-h-[812px]",
                    "bg-gradient-to-b from-rose-100 to-rose-200",
                    "overflow-hidden",
                ].join(" ")}
            >
                {/* 상단 여백 */}
                <div className="pt-6 px-5">
                    {/* 상단 로고 텍스트 (시안의 MOYEOYEON) */}
                    <div className="w-full flex justify-center">
                        <h1 className="text-[18px] font-extrabold tracking-wider text-rose-700">
                            {headerText}
                        </h1>
                    </div>

                    {/* (이미지 슬롯) 상단 일러스트 자리 */}
                    <div
                        aria-hidden
                        className="mt-4 mx-auto w-[260px] h-[160px] rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center justify-center text-rose-600 text-sm"
                    >
                        IMAGE
                    </div>

                    {/* 타이틀 & 서브타이틀 */}
                    <div className="mt-5 text-center">
                        <p className="text-[18px] font-extrabold text-rose-700">
                            방을 만들어 친구들을 초대해보세요!
                        </p>
                        <p className="mt-1 text-[12px] text-rose-700/90">
                            모여연은 최대 5명까지 함께할 수 있습니다
                        </p>
                    </div>

                    {/* 폼 영역 */}
                    <form
                        className="mt-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateRoom();
                        }}
                    >
                        {/* 입력자 이름 */}
                        <label className="block">
              <span className="block text-[12px] font-semibold text-rose-700">
                내 이름을 입력해주세요.
              </span>
                            <div className="mt-2 rounded-full bg-white/70 border border-rose-300 overflow-hidden">
                                <input
                                    type="text"
                                    className="w-full h-12 px-4 bg-transparent text-[14px] text-rose-900 placeholder:text-rose-400 outline-none"
                                    placeholder="예: 수아"
                                    value={userName}
                                    maxLength={10}
                                    onChange={(e) => handleUserNameChange(e.target.value)}
                                />
                            </div>
                            <span className="mt-1 block text-[11px] text-rose-700/80">
                {userName.trim().length}/10
              </span>
                        </label>

                        {/* 방 이름 */}
                        <label className="block mt-5">
              <span className="block text-[12px] font-semibold text-rose-700">
                방 이름을 지어주세요.
              </span>
                            <div className="mt-2 rounded-full bg-white/70 border border-rose-300 overflow-hidden">
                                <input
                                    type="text"
                                    className="w-full h-12 px-4 bg-transparent text-[14px] text-rose-900 placeholder:text-rose-400 outline-none"
                                    placeholder="예: 우리들의 2025"
                                    value={roomName}
                                    maxLength={50}
                                    onChange={(e) => handleRoomNameChange(e.target.value)}
                                />
                            </div>
                            <span className="mt-1 block text-[11px] text-rose-700/80">
                {roomName.trim().length}/50
              </span>
                        </label>

                        {/* 질문 개수 선택 (라디오) */}
                        <fieldset className="mt-6">
                            <legend className="block text-[12px] font-semibold text-rose-700">
                                응답할 질문의 개수를 선택하세요.
                            </legend>
                            <div className="mt-3 flex items-center justify-between px-2">
                                {[5, 10, 15, 20].map((num) => (
                                    <label
                                        key={num}
                                        className="flex items-center gap-2 text-[16px] text-rose-800"
                                    >
                                        <input
                                            type="radio"
                                            value={num}
                                            checked={questionCount === num}
                                            onChange={() => setQuestionCount(num)}
                                            className="h-[18px] w-[18px] accent-rose-600"
                                            aria-label={`${num}개`}
                                        />
                                        <span>{num}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {/* 패스키 3단어 */}
                        <label className="block mt-6">
              <span className="block text-[12px] font-semibold text-rose-700">
                룸 패스키로 사용할 단어 3개를 입력하세요.
              </span>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {passkeyParts.map((val, i) => (
                                    <div
                                        key={i}
                                        className="rounded-full bg-white/70 border border-rose-300 overflow-hidden"
                                    >
                                        <input
                                            type="text"
                                            className="w-full h-12 px-4 bg-transparent text-[14px] text-rose-900 placeholder:text-rose-400 outline-none text-center"
                                            placeholder={`단어 ${i + 1}`}
                                            value={val}
                                            maxLength={10}
                                            onChange={(e) => handlePasskeyChange(i, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-2 pl-1 text-[11px] text-rose-700/80">
                                ┗ 친구 초대 시 필요한 입장 비밀번호예요. (띄어쓰기 불가 / 각 1~10자)
                            </div>
                        </label>

                        {/* 하단 버튼 */}
                        <div className="mt-8 pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
                            <button
                                type="submit"
                                disabled={!isFormValid}
                                className={[
                                    "w-full h-12 rounded-full",
                                    "bg-gradient-to-b from-rose-500 to-rose-600",
                                    "text-white text-[15px] font-semibold tracking-wide",
                                    "shadow-md",
                                    "transition-opacity",
                                    isFormValid ? "hover:opacity-90" : "opacity-40 cursor-not-allowed",
                                ].join(" ")}
                                aria-disabled={!isFormValid}
                            >
                                방 만들기
                            </button>
                        </div>
                    </form>
                </div>

                {/* (선택) 하단 카피라이트 */}
                <div className="pb-4 text-center text-[10px] text-rose-700/90">
                    © 2025 MOYEOYEON ALL RIGHTS RESERVED
                </div>
            </section>
        </main>
    );
};

export default CreateRoom;
