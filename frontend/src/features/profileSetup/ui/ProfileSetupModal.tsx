import React, { useEffect, useState } from "react";
import { BaseModal, ActionButton } from "@/shares/ui";
import { X } from "lucide-react";
import clsx from "clsx";
import { apiClient } from "@/api";
import { RoomDetailResponse } from "@/types";

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (d: { avatar: string; nickname: string; color?: string; avatarId?: number }) => void;
    roomId: number;
    userId: number;
    initialColor?: string;
    initialNickname?: string;
    initialAvatarId?: number;
}

const AVATAR_IDS = [1, 2, 3, 4, 5, 6] as const;
const norm = (s?: string) => (s ?? "").trim().toLowerCase();
const toAvatarUrl = (id?: number) => (id ? `/avatars/${id}.png` : "/avatars/1.png");

const ProfileSetupModal: React.FC<Props> = ({
    open,
    onClose,
    onSave,
    roomId,
    userId,
    initialColor,
    initialNickname,
    initialAvatarId,
}) => {
    const [selectedId, setSelectedId] = useState<number>(initialAvatarId ?? 1);
    const [nickname, setNickname] = useState(initialNickname ?? "");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setNickname(initialNickname ?? "");
            setSelectedId(initialAvatarId ?? 1);
        }
    }, [open, initialNickname, initialAvatarId]);

    const resolveUserIdIfNeeded = async (currentUserId: number, guessNames: string[]) => {
        if (currentUserId && currentUserId > 0) return currentUserId;
        try {
            const { data } = await apiClient.get<RoomDetailResponse>(`/api/room/${roomId}`);
            const found =
                data.userInfo?.find((u) => guessNames.some((g) => g && norm(u.userName) === norm(g))) ||
                data.userInfo?.find((u) => u.isOwner) ||
                data.userInfo?.[0];
            return found?.userId ?? currentUserId;
        } catch {
            return currentUserId;
        }
    };

    const handleSave = async () => {
        const name = nickname.trim();
        if (!name) {
            alert("닉네임을 입력해 주세요!");
            return;
        }
        if (saving) return;

        const changes: Record<string, any> = {};
        const initialName = (initialNickname ?? "").trim();

        if (name !== initialName) changes.userName = name;

        const initId = initialAvatarId ?? 1;
        if (selectedId !== initId) {
            changes.imgId = selectedId;
            changes.userImgId = selectedId;
            changes.userImg = selectedId;
        }

        if (initialColor) {
            changes.userColor = initialColor;
        }

        if (Object.keys(changes).length === 0) {
            alert("변경된 내용이 없습니다.");
            return;
        }

        try {
            setSaving(true);

            let finalUserId = await resolveUserIdIfNeeded(userId, [nickname, initialNickname ?? ""]);
            if (!finalUserId || finalUserId <= 0) {
                alert("사용자 정보를 아직 식별하지 못했습니다. 잠시 후 다시 시도하거나 새로고침해 주세요.");
                setSaving(false);
                return;
            }

            const payload = { roomId, userId: finalUserId, ...changes };

            const res = await apiClient.put('/api/user/profile', payload);

            const data = res.data;
            const finalId = data?.userImgId ?? data?.userImg ?? selectedId;
            const finalUrl = toAvatarUrl(finalId);
            const nextName = (data?.userName ?? changes.userName ?? initialNickname ?? name).trim();
            const nextColor = data?.userColor ?? changes.userColor ?? initialColor;

            onSave({ avatar: finalUrl, nickname: nextName, color: nextColor, avatarId: finalId });

            alert("프로필이 저장되었습니다.");
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.message ?? err?.message ?? "프로필 저장 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <BaseModal open={open} onClose={onClose} maxWidth={360}>
            <div className="relative mx-auto w-[min(92vw,360px)]">
                <button
                    type="button"
                    aria-label="닫기"
                    onClick={onClose}
                    className={clsx(
                        "absolute right-2 top-2 z-20 inline-flex h-10 w-10 items-center justify-center",
                        "rounded-full bg-black/40 text-white shadow-md backdrop-blur",
                        "focus:outline-none focus:ring-2 focus:ring-white/70",
                        "active:scale-95"
                    )}
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="relative overflow-hidden rounded-[18px] bg-[#C13B43] text-white shadow-xl">
                    <div className="relative h-[128px] w-full rounded-b-[90px] bg-[#FFF7E9]" />
                    <div className="absolute left-1/2 top-[84px] -translate-x-1/2">
                        <div className="h-[104px] w-[104px] rounded-full ring-8 ring-[#C13B43]">
                            <img src={toAvatarUrl(selectedId)} alt="avatar" className="h-full w-full rounded-full object-cover" />
                        </div>
                    </div>

                    <div className="px-5 pb-6 pt-[74px]">
                        <div className="flex items-center justify-between gap-2">
                            {AVATAR_IDS.map((id) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSelectedId(id)}
                                    aria-pressed={selectedId === id}
                                    className={clsx(
                                        "h-12 w-12 rounded-full border-2 bg-white/95 p-[3px] transition",
                                        selectedId === id ? "scale-[1.05] border-emerald-400 shadow" : "border-transparent opacity-85 hover:opacity-100"
                                    )}
                                >
                                    <img src={toAvatarUrl(id)} alt={`avatar ${id}`} className="h-full w-full rounded-full object-cover" />
                                </button>
                            ))}
                        </div>

                        <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임을 입력하세요"
                            className="mx-auto mt-6 block w-[86%] border-0 border-b-2 border-white/90 bg-transparent py-2 text-center text-[20px] font-medium text-white placeholder:text-white/70 focus:outline-none"
                            maxLength={20}
                            inputMode="text"
                            aria-label="닉네임"
                            autoFocus
                        />

                        <ActionButton
                            onClick={handleSave}
                            disabled={saving}
                            className={clsx(
                                "mx-auto mt-6 w-[210px] rounded-full border border-white/20 bg-white/35 py-2 text-[14px] text-white backdrop-blur-[1px]",
                                saving && "opacity-70"
                            )}
                        >
                            {saving ? "저장 중..." : "저장하기"}
                        </ActionButton>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default ProfileSetupModal;
