import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ───────── 백엔드 응답 타입 ───────── */
interface TeamChatRoomResponse {
    roomId: number;
    roomName: string;
    roomQnum: number;
    userInfo: {
        userId: number;
        userName: string;
        userImg: number;
        userColor: string;
    }[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

const CreateRoom: React.FC = () => {
    const navigate = useNavigate();

    /* ───────── 고정 값 ───────── */
    const headerText = "OUR 2025";
    const roomType = "group";

    /* ───────── 폼 상태 ───────── */
    const [roomName, setRoomName] = useState("");
    const [questionCount, setQuestionCount] = useState<number>(5);
    const [passkeyParts, setPasskeyParts] = useState(["", "", ""]);
    const [userName, setUserName] = useState("");

    /* ───────── 유효성 검사 ───────── */
    const isValidRoomName = (v: string) =>
        v.trim().length >= 2 && v.trim().length <= 50;
    const isValidPassword = (arr: string[]) =>
        arr.every((w) => w.length >= 1 && w.length <= 10);
    const isValidUserName = (v: string) =>
        v.trim().length >= 1 && v.trim().length <= 10;

    /** 전체 폼 유효 여부 → 버튼 활성화용 */
    const isFormValid = useMemo(
        () =>
            isValidRoomName(roomName) &&
            isValidPassword(passkeyParts) &&
            isValidUserName(userName),
        [roomName, passkeyParts, userName]
    );

    /* ───────── 입력 핸들러 ───────── */
    const handleRoomNameChange = (v: string) =>
        setRoomName(v.slice(0, 50)); // 50자 제한

    const handlePasskeyChange = (idx: number, value: string) => {
        const cleaned = value.replace(/\s/g, ""); // 공백 제거
        const next = [...passkeyParts];
        next[idx] = cleaned.slice(0, 10); // 10자 제한
        setPasskeyParts(next);
    };

    const handleUserNameChange = (v: string) =>
        setUserName(v.replace(/\s/g, "").slice(0, 10)); // 공백 제거 + 10자 제한

    /* ───────── 방 생성 ───────── */
    const handleCreateRoom = async () => {
        if (!isFormValid) return; // 방어적 체크

        const roomPassword = {
            firstWord: passkeyParts[0],
            secondWord: passkeyParts[1],
            thirdWord: passkeyParts[2],
        };

        const userInfo = {
            userName: userName.trim(),
            userImg: Math.floor(Math.random() * 6) + 1,  // 1~6
            userColor: Math.floor(Math.random() * 5) + 1 // 1~5
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
            if (!res.ok) throw new Error("Failed to create room");

            const data: TeamChatRoomResponse = await res.json();
            //alert(`Room created! ID: ${data.roomId}, Name: ${data.roomName}`);
            navigate(`/chat-room/${data.roomId}`, {
                state: {
                    roomName: data.roomName,
                    roomQnum: data.roomQnum,
                    userName,
                },
            });
        } catch (err) {
            console.error(err);
            alert("Failed to create room. Please try again.");
        }
    };

    return (
        /** 전체 배경 */
        <div className="min-h-screen bg-pink-100 flex">
            {/* 왼쪽 설명 영역 */}
            <div className="w-1/2 flex flex-col justify-center items-center px-8 py-10">
                <h1 className="text-4xl font-bold mb-4 text-red-600">{headerText}</h1>
                <p className="text-base text-center max-w-sm mb-8">
                    여러 명이 함께 참여하는 방입니다. 팀원들과 함께 즐거운 시간을
                    보내세요.
                </p>
            </div>

            {/* 오른쪽 폼 영역 */}
            <div className="w-1/2 flex flex-col justify-center items-center">
                <div className="bg-[#db8ab1] rounded-[50px] shadow-lg p-8 w-[620px] h-[560px] mr-[80px]">
                    {/* Room Name */}
                    <label className="block mt-4 mb-4">
            <span className="block mb-2 font-semibold text-white">
              Room Name (2~50자)
            </span>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            placeholder="Enter room name"
                            value={roomName}
                            maxLength={50}
                            onChange={(e) => handleRoomNameChange(e.target.value)}
                        />
                        <span className="text-xs text-white">
              {roomName.trim().length}/50
            </span>
                    </label>

                    {/* User Name */}
                    <label className="block mb-4">
            <span className="block mb-2 font-semibold text-white">
              Your Name (1~10자)
            </span>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            placeholder="Enter your name"
                            value={userName}
                            maxLength={10}
                            onChange={(e) => handleUserNameChange(e.target.value)}
                        />
                        <span className="text-xs text-white">
              {userName.trim().length}/10
            </span>
                    </label>

                    {/* Question Count */}
                    <div className="mb-6">
            <span className="block mb-2 font-semibold text-white">
              How many questions do you want?
            </span>
                        <div className="flex items-center gap-10">
                            {[5, 10, 15, 20].map((num) => (
                                <label key={num} className="flex items-center gap-1 text-white">
                                    <input
                                        type="radio"
                                        value={num}
                                        checked={questionCount === num}
                                        onChange={() => setQuestionCount(num)}
                                        className="accent-white"
                                    />
                                    {num}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Passkey 3-단어 */}
                    <label className="block mb-6">
            <span className="block mb-2 font-semibold text-white">
              Room Passkey (1~10자 / 띄어쓰기 불가)
            </span>
                        <div className="flex gap-2">
                            {passkeyParts.map((val, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded text-black"
                                    placeholder={`Word ${i + 1}`}
                                    value={val}
                                    maxLength={10}
                                    onChange={(e) => handlePasskeyChange(i, e.target.value)}
                                />
                            ))}
                        </div>
                    </label>

                    {/* 생성 버튼 */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleCreateRoom}
                            disabled={!isFormValid}
                            className={`mt-6 text-4xl font-bold text-white bg-transparent border-none ${
                                isFormValid
                                    ? "hover:opacity-80"
                                    : "opacity-40 cursor-not-allowed"
                            }`}
                        >
                            Create a Room &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
