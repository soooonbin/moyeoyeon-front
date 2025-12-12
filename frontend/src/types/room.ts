import { ServerUserInfo } from './user';

// 방 생성 응답
export interface CreateRoomResponse {
  roomId: number;
  roomName: string;
  roomQnum: number;
  userInfo?: ServerUserInfo[] | ServerUserInfo | null;
  userId?: number;
}

// 방 상세 정보 응답
export interface RoomDetailResponse {  
  roomId: number;
  roomName: string;
  roomQnum: number;
  userInfo: ServerUserInfo[];
}

// 방 생성 요청
export interface CreateRoomRequest {
  roomName: string;
  roomType: string;
  roomQnum: number;
  roomPasskey: string;
  userName: string;
}
