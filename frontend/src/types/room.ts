import { ServerUserInfo } from './user';

export interface CreateRoomResponse {
  roomId: number;
  roomName: string;
  roomQnum: number;
  userInfo?: ServerUserInfo[] | ServerUserInfo | null;
  userId?: number;
}

export interface RoomDetailResponse {
  roomId: number;
  roomName: string;
  roomQnum: number;
  userInfo: {
    userId: number;
    userName: string;
    userImgId?: number;
    userImg?: number;
    userColor: string;
    isOwner: boolean;
  }[];
}
