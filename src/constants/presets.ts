import { PresetTheme } from '../types/ladder';

export const PLAYER_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#D946EF', // Fuchsia
];

export const STUDENT_AVATARS = [
  '🎓', '☕', '💻', '🎒', '🍺', '🍕', '📚', '😴', 
  '🎮', '⚡', '🏃', '🍜', '🎨', '🎵', '🥊', '🔥'
];

export const FUN_STUDENT_NICKNAMES = [
  '과탑 열공러',
  '복학생 선배',
  '새내기 25학번',
  '벼락치기 장인',
  '학식 매니아',
  '에타 헤비유저',
  '카페인 중독자',
  '프로 지각러',
  '동아리 회장',
  '도서관 죽돌이',
  '통학 2시간러',
  '자취방 요리사',
  '팀플 버스기사',
  '헬스장 출근러',
  '공강 사수생',
  '취준생 4학년',
];

export const FUN_PENALTIES = [
  '☕ 메가커피 아메리카노 1잔 쏘기',
  '🍕 오늘 야식 배달비 결제하기',
  '📑 팀플 회의록 작성 & 공지하기',
  '🍻 편의점 가서 숙취해소제 사오기',
  '🗑️ 분리수거 & 쓰레기통 비우기',
  '🎤 노래방 1곡 첫 타자 부르기',
  '🕺 귀여운 애교 or 춤 3초 보여주기',
  '📱 단톡방에 셀카 한 장 투척하기',
  '🥤 편의점 음료 골든벨 (전원)',
  '🏃 강의실 자리 맨 앞줄 먼저 맡기',
];

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: 'coffee',
    title: '☕ 오늘 커피 쏠 사람',
    badge: '인기 1위',
    description: '공강 시간 or 시험 기간, 커피값 결제할 행운의 주인공을 뽑습니다!',
    icon: '☕',
    playerCount: 4,
    density: 'normal',
    defaultPlayers: [
      { name: '도서관 죽돌이', avatar: '📚' },
      { name: '카페인 중독자', avatar: '☕' },
      { name: '벼락치기 장인', avatar: '⚡' },
      { name: '프로 지각러', avatar: '🏃' },
    ],
    defaultPrizes: [
      { text: '💥 커피 전액 결제 (몰빵)', isPenalty: true },
      { text: '✨ 완전 면제 (공짜 커피)', isPenalty: false },
      { text: '💸 50% 반띵 결제', isPenalty: true },
      { text: '✨ 완전 면제 (공짜 커피)', isPenalty: false },
    ],
  },
  {
    id: 'teamwork',
    title: '📑 팀플 평화로운 역할분담',
    badge: '싸움 방지',
    description: '조별과제 불화 종식! 운명에 맡기는 공정한 역할 배정',
    icon: '💻',
    playerCount: 5,
    density: 'normal',
    defaultPlayers: [
      { name: '팀플 버스기사', avatar: '💻' },
      { name: '과탑 열공러', avatar: '🎓' },
      { name: '에타 헤비유저', avatar: '📱' },
      { name: '새내기 25학번', avatar: '🐣' },
      { name: '복학생 선배', avatar: '😎' },
    ],
    defaultPrizes: [
      { text: '🎤 발표자 (무대의 주인공)', isPenalty: true },
      { text: '🎨 PPT 제작 (디자인 마스터)', isPenalty: true },
      { text: '🔍 자료조사 A (논문/기사)', isPenalty: false },
      { text: '🔍 자료조사 B (설문/통계)', isPenalty: false },
      { text: '☕ 조장 (회의소집+음료제공)', isPenalty: true },
    ],
  },
  {
    id: 'snack',
    title: '🍕 시험기간 야식 내기',
    badge: '군침 도는',
    description: '도서관 밤샘이나 자취방에서 야식 시킬 때 역할/비용 나누기',
    icon: '🍕',
    playerCount: 4,
    density: 'normal',
    defaultPlayers: [
      { name: '자취방 요리사', avatar: '🍳' },
      { name: '학식 매니아', avatar: '🍜' },
      { name: '통학 2시간러', avatar: '🎒' },
      { name: '밤샘 전사', avatar: '🌙' },
    ],
    defaultPrizes: [
      { text: '🍗 치킨값 쏘기 (대인배)', isPenalty: true },
      { text: '🛵 배달비 + 사이드 결제', isPenalty: true },
      { text: '🏃 1층 내려가서 픽업하기', isPenalty: false },
      { text: '🧹 야식 먹고 분리수거/뒷정리', isPenalty: true },
    ],
  },
  {
    id: 'drinking',
    title: '🍻 엠티/술자리 벌칙',
    badge: '분위기 UP',
    description: '개강총회, 동아리 MT, 뒷풀이 술자리 분위기 띄우는 벌칙 사다리',
    icon: '🍻',
    playerCount: 5,
    density: 'crazy',
    defaultPlayers: [
      { name: '술고래 동기', avatar: '🍺' },
      { name: '알쓰 새내기', avatar: '🧃' },
      { name: '동아리 회장', avatar: '👑' },
      { name: '분위기 메이커', avatar: '🎉' },
      { name: '귀가본능러', avatar: '🏠' },
    ],
    defaultPrizes: [
      { text: '🕺 엉덩이로 이름 쓰기', isPenalty: true },
      { text: '🧊 얼음물 원샷 (생존)', isPenalty: false },
      { text: '🎤 애창곡 1절 무반주 라이브', isPenalty: true },
      { text: '💬 흑역사 1개 고백하기', isPenalty: true },
      { text: '👑 왕의 권한 (벌칙 지정권)', isPenalty: false },
    ],
  },
  {
    id: 'cleaning',
    title: '🧹 기숙사/동방 대청소',
    badge: '평화 유지',
    description: '미루고 미루던 동아리방, 기숙사, 자취방 청소 구역 분담!',
    icon: '🧹',
    playerCount: 4,
    density: 'normal',
    defaultPlayers: [
      { name: '청결 왕', avatar: '✨' },
      { name: '룸메이트 A', avatar: '🛌' },
      { name: '룸메이트 B', avatar: '🧦' },
      { name: '방주인', avatar: '🔑' },
    ],
    defaultPrizes: [
      { text: '🚽 화장실 타일 물청소', isPenalty: true },
      { text: '🗑️ 분리수거 & 쓰레기 배출', isPenalty: true },
      { text: '✨ 완전 청소 면제 (꿀휴식)', isPenalty: false },
      { text: '🧽 바닥 청소기 & 물걸레', isPenalty: true },
    ],
  },
  {
    id: 'custom',
    title: '🎲 직접 만드는 사다리',
    badge: '자유 설정',
    description: '인원수, 플레이어 이름, 벌칙/결과를 마음대로 설정하세요.',
    icon: '🎲',
    playerCount: 4,
    density: 'normal',
    defaultPlayers: [
      { name: '철수', avatar: '🙋‍♂️' },
      { name: '영희', avatar: '🙋‍♀️' },
      { name: '민수', avatar: '🧑‍💻' },
      { name: '지수', avatar: '👩‍🎨' },
    ],
    defaultPrizes: [
      { text: '당첨 1등 🎉', isPenalty: false },
      { text: '벌칙 당첨 💥', isPenalty: true },
      { text: '무난한 통과 👍', isPenalty: false },
      { text: '아쉬운 꽝 😭', isPenalty: true },
    ],
  },
];
