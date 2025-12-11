// 서버에서 내려오는 유저 정보
export interface ServerUserInfo {
  userId: number;
  userName: string;
  userImg?: number | string;
  userImgId?: number;
  userColor?: string;
  isOwner?: boolean;
}

// 프론트에서 사용하는 멤버 정보
export interface Member {
  id: number;
  nickname: string;
  avatarId: number;
  avatarUrl: string;
  isMe?: boolean;
  isOwner?: boolean;
  color?: string;
}
