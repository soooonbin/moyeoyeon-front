import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { SendHorizontal, MoreHorizontal, Crown } from "lucide-react";

import ShareLinkModal from "@/features/inviteLink/ui/ShareLinkModal";
import ProfileSetupModal from "@/features/profileSetup/ui/ProfileSetupModal";
import HeaderOverlayMenu from "@/features/headerMenu/ui/HeaderOverlayMenu";

/* ✅ 항상 절대주소 사용 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

/* ------------------------------------------------------------------ */
/* 유틸                                                              */
/* ------------------------------------------------------------------ */
const norm = (s?: string) => (s ?? "").trim().toLowerCase();
const toAvatarUrl = (id?: number) => (id ? `/avatars/${id}.png` : "/avatars/1.png");

/* ------------------------------------------------------------------ */
/* 타입                                                               */
/* ------------------------------------------------------------------ */
interface Member {
    id: number;
    nickname: string;
    avatarId: number;
    avatarUrl: string;
    isMe?: boolean;
    isOwner?: boolean;
    color?: string;
}

interface RoomDetailResponse {
    roomId: number;
    roomName: string;
    roomQnum: number;
    userInfo: {
        userId: number;
        userName: string;
        userImgId?: number;     // ✅ 신규 권장 필드
        userImg?: number;       // ↔︎ 구버전 호환
        userColor: string;
        isOwner: boolean;
    }[];
}

/** members 배열에서 ‘나’를 고르는 보정 함수 */
const pickMe = (
    list: Member[],
    preferId?: number,
    preferName?: string
): Member | undefined => {
    if (preferId) {
        const byId = list.find((m) => String(m.id) === String(preferId));
        if (byId) return byId;
    }
    if (preferName) {
        const byName = list.find((m) => norm(m.nickname) === norm(preferName));
        if (byName) return byName;
    }
    if (list.length === 1) return list[0];
    return undefined;
};

/* ------------------------------------------------------------------ */
/* 컴포넌트 (모바일 레이아웃)                                         */
/* ------------------------------------------------------------------ */
const ChatRoom: React.FC = () => {
    /* URL 파라미터 & state ------------------------------------------- */
    const { roomId } = useParams<{ roomId: string }>();
    const location = useLocation();
    const state =
        (location.state as
            | { roomName?: string; roomQnum?: number; userName?: string; userId?: number }
            | null) ?? {};

    /* 상태 ----------------------------------------------------------- */
    const [roomName, setRoomName] = useState(state.roomName ?? "Loading…");
    const [roomQnum, setRoomQnum] = useState(state.roomQnum ?? 20);
    const [createdAt] = useState(new Date());
    const [members, setMembers] = useState<Member[]>([]);
    const [message, setMessage] = useState("");

    // 모달/오버레이 메뉴
    const [showShareModal, setShowShareModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [overlayDimOnly, setOverlayDimOnly] = useState(false);

    // 초대 링크 관련 state
    const [inviteLink, setInviteLink] = useState<string>("");
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);

    // ✅ state → localStorage → undefined 순서로 보강
    const stateUserId = state?.userId;
    const stateUserName = state?.userName?.trim() || "";

    // ✅ localStorage에서 roomId별 데이터 읽기
    const storedUserId = roomId
        ? Number(localStorage.getItem(`moyeo:room:${roomId}:userId`) || "0")
        : 0;
    const storedUserName = roomId
        ? localStorage.getItem(`moyeo:room:${roomId}:userName`) || ""
        : "";

    // ✅ 최종 복구 로직 (state 우선, 없으면 localStorage 사용)
    const preferredUserId =
        (stateUserId && stateUserId > 0 ? stateUserId : storedUserId > 0 ? storedUserId : undefined);
    const preferredUserName = stateUserName || storedUserName || "";

    const formattedDate = useMemo(
        () => format(createdAt, "yyyy", { locale: ko }),
        [createdAt]
    );

    /* 방 상세 불러오기 ------------------------------------------------ */
    useEffect(() => {
        if (!roomId) return;

        const fetchRoom = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/room/${roomId}`);
                if (!res.ok) throw new Error("Failed to fetch room");

                // ✅ Content-Type 검사
                const ct = res.headers.get("content-type") || "";
                if (!ct.includes("application/json")) {
                    const hint = await res.text().catch(() => "");
                    alert(
                        `Room API가 JSON이 아니라 ${ct} 입니다.\n응답 미리보기:\n${hint.slice(0, 200)}`
                    );
                    return;
                }

                const data: RoomDetailResponse = await res.json();

                setRoomName(data.roomName);
                setRoomQnum(data.roomQnum);

                // ✅ 서버의 userImgId(숫자) → avatarId, avatarUrl 매핑
                const mapped: Member[] = data.userInfo.map((u) => {
                    const id = (u.userImgId ?? u.userImg ?? 1) as number;
                    return {
                        id: u.userId,
                        nickname: u.userName,
                        avatarId: id,
                        avatarUrl: toAvatarUrl(id),
                        isOwner: u.isOwner,
                        color: u.userColor,
                    };
                });

                // ✅ 바로 ‘나’를 결정 (ID 우선, 이름 보조, 마지막 1명 보정)
                const me = pickMe(mapped, preferredUserId, preferredUserName);

                // isMe 플래그 세팅(있으면)
                setMembers(
                    mapped.map((m) => ({ ...m, isMe: !!me && m.id === me?.id }))
                );

                // me가 결정되면 localStorage에 보강 저장
                if (me && roomId) {
                    try {
                        localStorage.setItem(`moyeo:room:${roomId}:userId`, String(me.id));
                        localStorage.setItem(`moyeo:room:${roomId}:userName`, me.nickname);
                    } catch {}
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchRoom();
    }, [roomId, preferredUserId, preferredUserName]);

    // 항상 최신 members에서 ‘나’를 한 번 더 안전하게 구한다
    const me = useMemo(
        () => pickMe(members, preferredUserId, preferredUserName),
        [members, preferredUserId, preferredUserName]
    );

    // 모달에 넘길 값(무조건 존재하도록 보정)
    const myUserId =
        (me?.id != null ? Number(me.id) : undefined) ??
        (preferredUserId != null ? Number(preferredUserId) : undefined) ??
        (roomId ? Number(localStorage.getItem(`moyeo:room:${roomId}:userId`) || "0") : 0);
    const myNickname = me?.nickname ?? preferredUserName ?? "ME";
    const myAvatarId = me?.avatarId ?? 1;
    const myColor = me?.color;

    /* ✅ 모달 열기 전, userId를 서버에서 한 번 더 보강 (CT 가드 포함) */
    const ensureMe = async () => {
        if (!roomId) return;
        try {
            const res = await fetch(`${API_BASE}/api/room/${roomId}`);
            if (!res.ok) return;

            /*const ct = res.headers.get("content-type") || "";
            if (!ct.includes("application/json")) {
                const hint = await res.text().catch(() => "");
                alert(`Room API가 JSON이 아니라 ${ct} 입니다.\n응답 미리보기:\n${hint.slice(0, 200)}`);
                return;
            }*/

            const data: RoomDetailResponse = await res.json();
            const found =
                data.userInfo.find((u) => norm(u.userName) === norm(preferredUserName)) ||
                data.userInfo.find((u) => u.isOwner) ||
                data.userInfo[0];
            if (found) {
                setMembers((prev) => prev.map((m) => ({ ...m, isMe: m.id === found.userId })));
                try {
                    localStorage.setItem(`moyeo:room:${roomId}:userId`, String(found.userId));
                    localStorage.setItem(`moyeo:room:${roomId}:userName`, found.userName);
                } catch {}
            }
        } catch {}
    };

    const handlePlay = () => {
        if (window.confirm("질문을 시작하시겠습니까?")) {
            console.log("Question sequence started!");
        }
    };

    const handleSubmitMessage: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        const text = message.trim();
        if (!text) return;
        console.log("SEND:", text);
        setMessage("");
    };

    // 오버레이 메뉴 → 각 모달 열기 (오버레이 닫지 않음)
    const openEditProfile = async () => {
        if (!myUserId || myUserId <= 0) {
            await ensureMe();
            await new Promise((r) => setTimeout(r, 200));
        }

        const latestId = roomId
            ? Number(localStorage.getItem(`moyeo:room:${roomId}:userId`) || "0")
            : 0;

        if (!latestId || latestId <= 0) {
            alert("아직 사용자 정보가 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
            return;
        }

        setOverlayDimOnly(true);
        setShowProfileModal(true);
    };

    const openInvite = async () => {
        setOverlayDimOnly(true);
        setShowShareModal(true);

        // 이미 링크가 있으면 재생성하지 않음
        if (inviteLink) return;

        // 링크 생성 시작
        setIsGeneratingLink(true);

        try {
            // oriUrl 생성: {VITE_API_BASE_URL}/chat-room/{roomId}
            const oriUrl = `${API_BASE}/chat-room/${roomId}`;

            console.log("🔍 API 호출 정보:");
            console.log("  - URL:", `${API_BASE}/api/url/shorten`);
            console.log("  - userName:", myNickname);
            console.log("  - oriUrl:", oriUrl);

            // API 호출
            const response = await fetch(`${API_BASE}/api/url/shorten`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: myNickname,
                    oriUrl: oriUrl,
                }),
            });

            console.log("📡 응답 상태:", response.status, response.statusText);

            // ✅ Content-Type 확인
            const contentType = response.headers.get("content-type");
            console.log("📄 Content-Type:", contentType);

            // ✅ 먼저 텍스트로 읽기 (한 번만!)
            const responseText = await response.text();
            console.log("📝 응답 내용:", responseText);

            // 응답 상태 체크
            if (!response.ok) {
                console.error("❌ 서버 에러 응답:", responseText);
                throw new Error(`서버 에러: ${response.status} - ${responseText.substring(0, 100)}`);
            }

            // shortUrl을 state에 저장
            if (responseText) {
                setInviteLink(responseText);
                console.log("✅ 초대 링크 생성 완료:", responseText);
            } else {
                throw new Error("응답에 shortUrl이 없습니다.");
            }
        } catch (error) {
            console.error("❌ 초대 링크 생성 실패:", error);
            alert(`초대 링크 생성에 실패했습니다.\n\n에러: ${error instanceof Error ? error.message : '알 수 없는 에러'}`);
            // 실패 시 모달 닫기
            setShowShareModal(false);
            setOverlayDimOnly(false);
        } finally {
            setIsGeneratingLink(false);
        }
    };

    // 모달 닫을 때
    const closeProfileModal = () => {
        setShowProfileModal(false);
        setOverlayDimOnly(false);
    };
    const closeShareModal = () => {
        setShowShareModal(false);
        setOverlayDimOnly(false);
    };

    return (
        <div className="min-h-[100svh] w-full bg-[#FFF7F4]">
            {/* 모바일 캔버스: mock 기준 375px */}
            <div className="mx-auto flex min-h-[100svh] max-w-[375px] flex-col bg-[#FFF9F7]">
                {/* ───── 상단 레드 헤더 ───── */}
                <header className="relative w-full">
                    <div
                        className="h-[220px] w-full"
                        style={{
                            background:
                                "linear-gradient(180deg,#C83B44 0%,#C83B44 76%,#FFF9F7 76%)",
                        }}
                    />
                    {/* 헤더 컨트롤 */}
                    <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 pt-5">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold tracking-wider text-[#9E2F38] shadow-sm">
              MOYEOYEON
            </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setShowHeaderMenu(true);
                                    setOverlayDimOnly(false);
                                }}
                                className="rounded-full bg-white/90 p-2 shadow-sm"
                                aria-label="menu"
                            >
                                <MoreHorizontal className="h-5 w-5 text-[#9E2F38]" />
                            </button>
                        </div>
                    </div>

                    {/* 안내 박스 + START */}
                    <div className="absolute left-0 right-0 top-[84px] z-10 px-4">
                        <div className="rounded-[22px] border border-white/40 bg-[#F6DBDC] px-6 py-7 text-center text-[#A0343B] shadow-[0_8px_18px_rgba(160,52,59,0.18)]">
                            <p className="text-[15px] font-semibold">우측 상단 버튼을 눌러</p>
                            <p className="mt-1 text-[15px] font-semibold">
                                친구들을 초대해 주세요.
                            </p>
                            <button
                                onClick={handlePlay}
                                className="mx-auto mt-5 inline-flex items-center rounded-full bg-[#A0343B] px-7 py-2 text-sm font-semibold text-white shadow"
                            >
                                START ▶
                            </button>
                        </div>

                        <p className="mt-4 text-center text-[12px] leading-5 text-[#9B7073]">
                            함께 {formattedDate}년을 되돌아볼 수 있는
                            <br />
                            [{roomName === "Loading…" ? state.roomName ?? "새로운" : roomName}] 방이 개설되었습니다
                        </p>
                    </div>
                </header>

                {/* ───── 본문 ───── */}
                <main className="-mt-2 flex flex-1 flex-col px-4 pb-[12px]">
                    {/* 점선 진행바 */}
                    <div className="mt-[14px] mb-3 flex items-center">
            <span className="mr-3 text-[13px] font-semibold text-[#A0343B]">
              Start
            </span>
                        <div className="relative h-[2px] flex-1">
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-[#E7C9CB] border-dashed" />
                        </div>
                        <span className="ml-3 text-[13px] font-semibold text-[#A0343B]">
              End
            </span>
                    </div>

                    {/* 메시지 리스트 */}
                    <div className="flex-1 rounded-2xl bg-[#FFF2F2]/70 p-4">
                        <div className="mx-auto mt-6 max-w-[86%] text-center text-[13px] text-[#9B7073]">
                            멤버가 입장하면 여기서 대화가 시작돼요.
                        </div>

                        {/* 멤버 미리보기 */}
                        {members.length > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {members.map((m) => (
                                    <div
                                        key={m.id}
                                        className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[12px] text-[#7B4C51] shadow-sm"
                                    >
                                        <img
                                            src={m.avatarUrl}
                                            alt={m.nickname}
                                            className="h-6 w-6 rounded-full object-cover"
                                        />
                                        <span className="flex items-center gap-1">
                      {m.isOwner && (
                          <Crown className="h-3.5 w-3.5 text-yellow-400" />
                      )}
                                            {m.nickname}
                                            {m.isMe && "(나)"}
                    </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 하단 입력창 */}
                    <form onSubmit={handleSubmitMessage} className="mt-4 flex items-center gap-2">
            <span className="select-none rounded-full border border-[#E5C0C2] bg-white/80 px-4 py-2 text-[12px] font-semibold text-[#7B4C51]">
              {myNickname}
            </span>

                        <div className="flex min-w-0 flex-1 items-center rounded-full border border-[#E7AAB0] bg-white/80 pl-4 pr-1">
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="채팅 입력"
                                className="h-12 w-full flex-1 bg-transparent text-[15px] text-[#5B2E32] placeholder:text-[#C18A90] focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E7AAB0] bg-white hover:bg-white/90"
                                aria-label="send"
                            >
                                <SendHorizontal className="h-5 w-5" />
                            </button>
                        </div>
                    </form>

                    <div className="h-[env(safe-area-inset-bottom)] w-full" />
                </main>
            </div>

            {/* ───── 오버레이 헤더 메뉴 ───── */}
            <HeaderOverlayMenu
                open={showHeaderMenu}
                onClose={() => setShowHeaderMenu(false)}
                onEditProfile={openEditProfile}
                onInvite={openInvite}
                dimOnly={overlayDimOnly}
            />

            {/* ───── 모달 컨테이너 ───── */}
            <div className="relative z-[2000]">
                <ShareLinkModal
                    open={showShareModal}
                    onClose={closeShareModal}
                    link={inviteLink}
                    isLoading={isGeneratingLink}
                />
                <ProfileSetupModal
                    open={showProfileModal}
                    onClose={closeProfileModal}
                    roomId={roomId ? Number(roomId) : 0}
                    userId={myUserId}
                    initialColor={myColor}
                    initialNickname={myNickname}
                    initialAvatarId={myAvatarId}
                    onSave={(data) => {
                        // 1) 멤버 목록에서 나(me) 갱신
                        setMembers((prev) => {
                            const idx = prev.findIndex((m) => m.isMe);
                            const nextAvatarId = data.avatarId ?? myAvatarId;
                            const nextAvatarUrl = toAvatarUrl(nextAvatarId);
                            if (idx >= 0) {
                                const next = [...prev];
                                next[idx] = {
                                    ...next[idx],
                                    nickname: data.nickname,
                                    avatarId: nextAvatarId,
                                    avatarUrl: nextAvatarUrl,
                                    color: data.color ?? next[idx].color,
                                };
                                return next;
                            }
                            return [
                                {
                                    id: myUserId,
                                    nickname: data.nickname,
                                    avatarId: nextAvatarId,
                                    avatarUrl: nextAvatarUrl,
                                    isMe: true,
                                    isOwner: false,
                                    color: data.color,
                                },
                                ...prev,
                            ];
                        });

                        try {
                            if (roomId) {
                                localStorage.setItem(`moyeo:room:${roomId}:userName`, data.nickname);
                            }
                        } catch {}
                        setShowProfileModal(false);
                        setOverlayDimOnly(false);
                    }}
                />
            </div>
        </div>
    );
};

export default ChatRoom;
