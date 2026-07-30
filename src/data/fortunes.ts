import { asset } from '../lib/assets'

export type FortuneId = 'opener' | 'comeback' | 'defense' | 'cheer'

export type Fortune = {
  id: FortuneId
  title: string
  subtitle: string
  blurb: string
  cheer: string
  /** 표시용 운수 퍼센트 범위 */
  percentRange: [number, number]
  accent: string
  cardImg: string
  cardMiniImg: string
}

export const FORTUNES: Fortune[] = [
  {
    id: 'opener',
    title: '선제골 길운',
    subtitle: '먼저 움직이는 흐름',
    blurb:
      '오늘은 첫 슈팅이 골로 이어질 가능성이 높은 날! 경기 초반, 누구보다 먼저 기회를 잡은 선수가 선제골의 주인공이 됩니다.',
    cheer: '오늘 승리의 조건\n이 정도면 충분해',
    percentRange: [80, 92],
    accent: '#ff6b4a',
    cardImg: asset('/assets/fortune-opener.png'),
    cardMiniImg: asset('/assets/fortune-opener-mini.png'),
  },
  {
    id: 'comeback',
    title: '역전 대길운',
    subtitle: '끝까지 포기하지 마!',
    blurb:
      '오늘 경기는 마지막 10분까지 결과를 알 수 없습니다. 뒤지고 있어도 포기하지 마세요. 종료 직전, 극적인 골이 터질 수 있습니다.',
    cheer: '다시 일어서서\n끝까지 싸워서 승리하자',
    percentRange: [88, 96],
    accent: '#ffd166',
    cardImg: asset('/assets/fortune-comeback.png'),
    cardMiniImg: asset('/assets/fortune-comeback-mini.png'),
  },
  {
    id: 'defense',
    title: '철벽 수호운',
    subtitle: '위기를 막아내는 흐름',
    blurb:
      '오늘은 결정적인 슈팅 하나를 막아낸 뒤 승리의 흐름이 시작됩니다. 골키퍼의 선방이나 수비수의 마지막 태클이 경기의 승패를 바꿀 수 있습니다.',
    cheer: '시간이 흘러도 우리는\n언제나 네 곁에 있을게',
    percentRange: [78, 90],
    accent: '#7ec8ff',
    cardImg: asset('/assets/fortune-defense.png'),
    cardMiniImg: asset('/assets/fortune-defense-mini.png'),
  },
  {
    id: 'cheer',
    title: '함성 증폭운',
    subtitle: '응원을 통한 기세',
    blurb:
      '오늘은 관중석의 함성이 커지는 순간, 득점 기회도 함께 찾아옵니다. 응원가가 경기장을 가득 채운 직후 결정적인 공격이 시작될 수 있습니다.',
    cheer: '오늘만은 다 잊고\n외쳐보자 부르자!',
    percentRange: [84, 94],
    accent: '#c77dff',
    cardImg: asset('/assets/fortune-cheer.png'),
    cardMiniImg: asset('/assets/fortune-cheer-mini.png'),
  },
]

export function pickPercent(range: [number, number]): number {
  const [min, max] = range
  return Math.floor(min + Math.random() * (max - min + 1))
}

/** 카드 위치 셔플(표시용). 실제 결과는 선택 시 랜덤 매핑 */
export function shuffledFortunes(): Fortune[] {
  const copy = [...FORTUNES]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const KEYWORDS: { keys: string[]; fortuneId: FortuneId; line: string }[] = [
  {
    keys: ['인천', '유나이티드', '검은물결', '애이니', '선제골'],
    fortuneId: 'opener',
    line: '선제 기운이 강해요. 먼저 움직이는 선택이 오늘의 키입니다.',
  },
  {
    keys: ['포항', '스틸러스', '역전'],
    fortuneId: 'comeback',
    line: '역전의 기운이 꿈틀거려요. 끝까지 가면 승리가 따라옵니다.',
  },
  {
    keys: ['응원', '함성', '치어', '열기'],
    fortuneId: 'cheer',
    line: '함성 증폭운! 당신의 목소리가 경기장 공기를 바꿉니다.',
  },
  {
    keys: ['수비', '골키퍼', '수호', '방어', '철벽'],
    fortuneId: 'defense',
    line: '철벽 수호운이 들어왔어요. 한 번 막아내면 분위기가 바뀝니다.',
  },
  {
    keys: ['선제', '골', '공격', '전반'],
    fortuneId: 'opener',
    line: '선제 기운이 강해요. 먼저 움직이는 선택이 오늘의 키입니다.',
  },
  {
    keys: ['후반', '포기'],
    fortuneId: 'comeback',
    line: '역전의 기운이 꿈틀거려요. 끝까지 가면 승리가 따라옵니다.',
  },
]

export function predictFromText(text: string): {
  fortune: Fortune
  percent: number
  line: string
} {
  const t = text.trim().toLowerCase()
  const hit = KEYWORDS.find((k) =>
    k.keys.some((key) => t.includes(key.toLowerCase())),
  )
  const fortune = FORTUNES.find((f) => f.id === (hit?.fortuneId ?? 'cheer'))!
  return {
    fortune,
    percent: pickPercent(fortune.percentRange),
    line: hit?.line ?? fortune.blurb,
  }
}
