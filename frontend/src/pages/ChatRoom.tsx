// src/pages/ChatRoom.tsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    MoreHorizontal,
    UserPlus2,
    SendHorizontal,
    Crown,
} from "lucide-react";

import ShareLInkModal from "@/features/inviteLink/ui/ShareLInkModal";
import ProfileSetupModal from "@/features/profileSetup/ui/ProfileSetupModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

/* ------------------------------------------------------------------ */
/* 타입                                                               */
/* ------------------------------------------------------------------ */
interface Member {
    id: number;
    nickname: string;
    avatarUrl: string;
    isMe?: boolean;
    isOwner?: boolean;
}

interface RoomDetailResponse {
    roomId: number;
    roomName: string;
    roomQnum: number;
    userInfo: {
        userId: number;
        userName: string;
        userImg: number;
        userColor: string;
        isOwner: boolean;
    }[];
}

/* ------------------------------------------------------------------ */
/* 컴포넌트                                                           */
/* ------------------------------------------------------------------ */
const ChatRoom: React.FC = () => {
    /* URL 파라미터 & state ------------------------------------------- */
    const { roomId } = useParams<{ roomId: string }>();
    const location = useLocation();
    const state =
        (location.state as
            | { roomName?: string; roomQnum?: number; userName?: string }
            | null) ?? {};

    /* 상태 ----------------------------------------------------------- */
    const [roomName, setRoomName] = useState(state.roomName ?? "Loading…");
    const [roomQnum, setRoomQnum] = useState(state.roomQnum ?? 20);
    const [createdAt] = useState(new Date());
    const [members, setMembers] = useState<Member[]>([]);
    const [message, setMessage] = useState("");
    const [showShareModal, setShowShareModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const formattedDate = format(createdAt, "yyyy. MM. dd EEE", { locale: ko });

    /* 내가 입력한 닉네임 → Me 라벨·말풍선 등에 사용 ------------------ */
    const myNickname =
        members.find((m) => m.isMe)?.nickname || state.userName || "ME";

    /* 방 상세 불러오기 ------------------------------------------------ */
    useEffect(() => {
        if (!roomId) return;

        const fetchRoom = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/room/${roomId}`);
                if (!res.ok) throw new Error("Failed to fetch room");
                const data: RoomDetailResponse = await res.json();

                setRoomName(data.roomName);
                setRoomQnum(data.roomQnum);

                const transformed: Member[] = data.userInfo.map((u) => ({
                    id: u.userId,
                    nickname: u.userName,
                    avatarUrl: `/avatars/${u.userImg}.png`,
                    isMe: u.userName === state.userName,
                    isOwner: u.isOwner,
                }));
                setMembers(transformed);
            } catch (e) {
                console.error(e);
            }
        };

        fetchRoom();
    }, [roomId, state.userName]);

    /* 핸들러 --------------------------------------------------------- */
    const handleMoreOptions = () => setShowProfileModal(true);
    const handlePlay = () => {
        if (window.confirm("질문을 시작하시겠습니까?")) {
            console.log("Question sequence started!");
        }
    };
    const handleSendMessage = () => {
        if (!message.trim()) return;
        console.log("SEND:", message);
        setMessage("");
    };

    /* 프로필 저장 → members 배열 업데이트 ----------------------------- */
    const handleProfileSave = (data: { avatar: string; nickname: string }) => {
        setMembers((prev) => {
            /** isMe 멤버가 있으면 업데이트, 없으면 새로 삽입 */
            const idx = prev.findIndex((m) => m.isMe);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], nickname: data.nickname, avatarUrl: data.avatar };
                return next;
            }
            return [
                {
                    id: Date.now(),
                    nickname: data.nickname,
                    avatarUrl: data.avatar,
                    isMe: true,
                    isOwner: false,
                },
                ...prev,
            ];
        });
        setShowProfileModal(false);
    };

    /* ---------------------------------------------------------------- */
    /* JSX                                                              */
    /* ---------------------------------------------------------------- */
    return (
        <div className="flex min-h-screen bg-[#fef6f7]">
            {/*────────────── 좌측 사이드바 ─────────────*/}
            <aside className="flex w-[360px] flex-col gap-8 bg-[#fde9eb] px-8 py-10">
                <img src="/logo-moyeo.svg" alt="MOYEOYEON" className="w-[200px]" />

                <div>
                    <h2 className="text-2xl font-semibold text-[#a53d47]">{roomName}</h2>
                    <p className="mt-1 text-sm text-[#c67a7f]">
                        {formattedDate.toUpperCase()}
                    </p>
                </div>

                {/* Me 카드 */}
                <Card className="rounded-3xl bg-[#ba4d4e] text-white">
                    <CardContent className="relative p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">Me</h3>
                            <button onClick={handleMoreOptions}>
                                <MoreHorizontal className="h-7 w-7" />
                            </button>
                        </div>

                        {members
                            .filter((m) => m.isMe)
                            .map((m) => (
                                <div key={m.id} className="flex items-center gap-3">
                                    <img
                                        src={m.avatarUrl}
                                        alt={m.nickname}
                                        className="h-14 w-14 rounded-full border-2 border-white object-cover"
                                    />
                                    <div className="flex items-center gap-1">
                                        {m.isOwner && (
                                            <Crown className="h-5 w-5 text-yellow-300" />
                                        )}
                                        <span className="font-medium">{m.nickname}(나)</span>
                                    </div>
                                </div>
                            ))}

                        {/* Fallback: 아직 내 정보가 members에 없을 때 */}
                        {members.every((m) => !m.isMe) && (
                            <div className="flex items-center gap-3">
                                <span className="font-medium">{myNickname}(나)</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Members 카드 */}
                <Card className="flex-1 rounded-3xl bg-[#ba4d4e] text-white">
                    <CardContent className="flex h-full flex-col p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">Members</h3>
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="rounded-full p-1.5 hover:bg-white/10"
                            >
                                <UserPlus2 className="h-7 w-7" />
                            </button>
                        </div>

                        <div className="space-y-3 overflow-y-auto pr-1">
                            {members.map((m) => (
                                <div key={m.id} className="flex items-center gap-3">
                                    <img
                                        src={m.avatarUrl}
                                        alt={m.nickname}
                                        className="h-10 w-10 rounded-full border-2 border-white object-cover"
                                    />
                                    <div className="flex items-center gap-1">
                                        {m.isOwner && (
                                            <Crown className="h-4 w-4 flex-shrink-0 text-yellow-300" />
                                        )}
                                        <span className="text-sm">
                      {m.nickname}
                                            {m.isMe && "(나)"}
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </aside>

            {/*────────────── 우측 대화 영역 ─────────────*/}
            <section className="flex flex-1 flex-col p-10">
                <div className="flex flex-1 flex-col rounded-[40px] bg-[#eecaca] p-8">
                    {/* 노란 말풍선 & PLAY 버튼 */}
                    <div className="relative flex justify-center">
                        <div className="relative flex w-[88%] flex-col items-center rounded-full bg-[#fffbea] py-6 px-16 text-[#a53d47]">
                            <p className="font-semibold">Welcome to MOYEOYEON !</p>
                            <p className="mt-[2px] font-semibold">
                                왼쪽 멤버 추가 버튼으로 친구들을 초대해 보세요!
                            </p>
                        </div>

                        <Button
                            size="sm"
                            onClick={handlePlay}
                            className="absolute right-[calc(6%_-_20px)] top-1/2 -translate-y-1/2 rounded-full bg-[#a53d47] px-6 py-2 text-white hover:bg-[#8f343c]"
                        >
                            PLAY ▶
                        </Button>
                    </div>

                    {/* 진행 바 */}
                    <div className="mt-0.5 mb-4 flex items-center">
                        <span className="mr-4 font-semibold text-[#a53d47]">Start</span>
                        <div className="flex flex-1 justify-between">
                            {Array.from({ length: roomQnum }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="mx-[2px] flex-1 rounded-full bg-[#f0dede] h-1"
                                />
                            ))}
                        </div>
                        <span className="ml-4 font-semibold text-[#a53d47]">End</span>
                    </div>

                    {/* 메시지 영역 */}
                    <div className="flex-1 space-y-4 overflow-y-auto px-2" />

                    {/* 입력창 */}
                    <div className="mt-6 flex items-end gap-3">
            <span className="rounded-full border border-black px-5 py-2 text-sm font-semibold">
              {myNickname}
            </span>

                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your answer…"
                            className="h-12 flex-1 bg-[#fffbea] text-base"
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />

                        <button
                            onClick={handleSendMessage}
                            className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-white hover:bg-gray-100"
                        >
                            <SendHorizontal className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </section>

            {/*───────── 모달들 ─────────*/}
            <ShareLInkModal
                open={showShareModal}
                onClose={() => setShowShareModal(false)}
                maxWidth={800}
            />

            {/* ★ ProfileSetupModal */}
            <ProfileSetupModal
                open={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onSave={handleProfileSave}
            />
        </div>
    );
};

export default ChatRoom;