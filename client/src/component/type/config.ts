export const CONFIG = {
  "roomMake": {
    title: "방 생성",
    placeholder: "방 이름",
    btn:"만들기"
  },
  "password-change": {
    title: "비밀번호 변경",
    placeholder: "새 비밀번호 입력",
    btn: "확인",
  },
    "password-auth": {
    title: "비밀번호 변경",
    placeholder: "현재 비밀번호 입력",
    btn: "확인",
  },

}as const;

export type PopupMode = keyof typeof CONFIG;

