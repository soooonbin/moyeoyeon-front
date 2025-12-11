export interface ServerUserInfo {
  userId: number;
  userName: string;
  userImg?: number | string;
  userImgId?: number;
  userColor?: string;
  isOwner?: boolean;
}

export interface Member {
  id: number;
  nickname: string;
  avatarId: number;
  avatarUrl: string;
  isMe?: boolean;
  isOwner?: boolean;
  color?: string;
}
