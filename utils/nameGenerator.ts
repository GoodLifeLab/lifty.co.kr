// 랜덤 이름 생성을 위한 유틸리티

// 첫 번째 단어 목록 (형용사나 특성)
const FIRST_WORDS = [
  "화이팅하는",
  "힘내는",
  "도전하는",
  "용기있는",
  "당당한",
  "씩씩한",
  "열정적인",
  "의지가강한",
  "끈기있는",
  "꿋꿋한",
  "굳센",
  "패기넘치는",
  "대담한",
  "불굴의",
  "승부욕강한",
  "포기안하는",
  "밀어붙이는",
  "도전적인",
  "역동적인",
  "추진력있는",
  "의욕넘치는",
  "활력있는",
  "에너지충전한",
  "파워풀한",
  "강인한",
  "터프한",
  "꺾이지않는",
  "일어서는",
  "전진하는",
  "돌진하는",
  "질주하는",
  "날아오르는",
  "성장하는",
  "발전하는",
  "향상하는",
  "극복하는",
  "뛰어넘는",
  "도약하는",
];

// 두 번째 단어 목록 (명사나 대상)
const SECOND_WORDS = [
  "파이터",
  "챔피언",
  "러너",
  "클라이머",
  "워리어",
  "개척자",
  "도전자",
  "모험가",
  "탐험가",
  "승부사",
  "운동선수",
  "마라토너",
  "등반가",
  "서퍼",
  "라이더",
  "드리머",
  "체이서",
  "브레이커",
  "댄서",
  "크리에이터",
  "빌더",
  "메이커",
  "스타터",
  "게임체인저",
  "트렌드세터",
  "엔진",
  "로켓",
  "제트기",
  "번개",
  "태풍",
  "파도",
  "산",
  "독수리",
  "사자",
  "호랑이",
  "치타",
  "다이아몬드",
  "스틸",
  "타이탄",
  "볼트",
  "플레임",
  "스파크",
  "블레이드",
  "미사일",
  "부스터",
  "터보",
  "불사조",
  "용",
  "매",
  "늑대",
  "표범",
  "상어",
  "돌고래",
  "고래",
  "거북이",
  "에너지",
  "파워",
  "스피드",
  "포스",
];

/**
 * 랜덤한 사용자 이름을 생성합니다.
 * 형식: [단어1] [단어2] [6자리 숫자]
 * 예: 빠른_파이터_123456, 멋진_챔피언_789012
 */
export function generateRandomName(): string {
  const firstWord = FIRST_WORDS[Math.floor(Math.random() * FIRST_WORDS.length)];
  const secondWord =
    SECOND_WORDS[Math.floor(Math.random() * SECOND_WORDS.length)];
  const number = Math.floor(Math.random() * 90) + 10; // 10-99 사이의 6자리 숫자

  return `${firstWord} ${secondWord} ${number}`;
}

/**
 * 기존 사용자 이름과 중복되지 않는 랜덤 이름을 생성합니다.
 * @param existingNames 기존 사용자 이름 목록
 * @param maxAttempts 최대 시도 횟수 (기본값: 10)
 */
export function generateUniqueRandomName(
  existingNames: string[],
  maxAttempts: number = 10,
): string {
  for (let i = 0; i < maxAttempts; i++) {
    const name = generateRandomName();
    if (!existingNames.includes(name)) {
      return name;
    }
  }

  // 최대 시도 횟수를 초과한 경우 타임스탬프를 추가
  const timestamp = Date.now().toString().slice(-4);
  const firstWord = FIRST_WORDS[Math.floor(Math.random() * FIRST_WORDS.length)];
  const secondWord =
    SECOND_WORDS[Math.floor(Math.random() * SECOND_WORDS.length)];

  return `${firstWord}${secondWord}${timestamp}`;
}
