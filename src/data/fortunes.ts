export type FortuneId = 'opener' | 'comeback' | 'defense' | 'cheer'

export type Fortune = {
  id: FortuneId
  title: string
  subtitle: string
  blurb: string
  /** 표시용 운수 퍼센트 범위 */
  percentRange: [number, number]
  accent: string
}

export const FORTUNES: Fortune[] = [
  {
    id: 'opener',
    title: '선제골 길운',
    subtitle: '먼저 움직이는 흐름',
    blurb:
      '오늘은 먼저 움직이는 사람이 흐름을 잡는 날이에요. 망설이기보다 한 발 앞서 시작하면, 승리의 기운이 당신을 따라옵니다.',
    percentRange: [72, 94],
    accent: '#ff6b4a',
  },
  {
    id: 'comeback',
    title: '역전 대길운',
    subtitle: '끝까지 가는 힘',
    blurb:
      '끝까지 포기하지 않을수록 승리가 가까워지는 날이에요. 잠시 밀려도 괜찮아요. 후반의 한 방이 오늘을 뒤집습니다.',
    percentRange: [68, 91],
    accent: '#ffd166',
  },
  {
    id: 'defense',
    title: '철벽 수호운',
    subtitle: '위기를 막는 기운',
    blurb:
      '위기를 막아낼수록 좋은 흐름이 들어오는 날이에요. 흔들림을 지키면, 그 자리에 든든한 승리가 쌓입니다.',
    percentRange: [70, 93],
    accent: '#7ec8ff',
  },
  {
    id: 'cheer',
    title: '함성 증폭운',
    subtitle: '응원이 만드는 기세',
    blurb:
      '나의 응원이 경기장의 기세를 끌어올리는 날이에요. 목소리 한 번, 손뼉 한 번이 오늘의 흐름을 바꿉니다.',
    percentRange: [75, 96],
    accent: '#c77dff',
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
    keys: ['인천', '유나이티드', '검은물결', '애이니'],
    fortuneId: 'cheer',
    line: '인천의 함성이 오늘 당신 옆에 붙어 있어요. 응원할수록 기세가 커집니다.',
  },
  {
    keys: ['포항', '스틸러스'],
    fortuneId: 'defense',
    line: '맞수와의 긴장감이 철벽 기운을 불러와요. 흔들림을 지키면 흐름이 옵니다.',
  },
  {
    keys: ['선제', '골', '공격', '전반'],
    fortuneId: 'opener',
    line: '선제 기운이 강해요. 먼저 움직이는 선택이 오늘의 키입니다.',
  },
  {
    keys: ['역전', '후반', '포기'],
    fortuneId: 'comeback',
    line: '역전의 기운이 꿈틀거려요. 끝까지 가면 승리가 따라옵니다.',
  },
  {
    keys: ['수비', '골키퍼', '수호', '방어'],
    fortuneId: 'defense',
    line: '철벽 수호운이 들어왔어요. 한 번 막아내면 분위기가 바뀝니다.',
  },
  {
    keys: ['응원', '함성', '치어', '열기'],
    fortuneId: 'cheer',
    line: '함성 증폭운! 당신의 목소리가 경기장 공기를 바꿉니다.',
  },
]

export function predictFromText(text: string): {
  fortune: Fortune
  percent: number
  line: string
} {
  const t = text.trim().toLowerCase()
  const hit = KEYWORDS.find((k) => k.keys.some((key) => t.includes(key.toLowerCase())))
  const fortune = FORTUNES.find((f) => f.id === (hit?.fortuneId ?? 'cheer'))!
  return {
    fortune,
    percent: pickPercent(fortune.percentRange),
    line: hit?.line ?? '오늘의 승리 기운이 은은하게 감돌아요. 마음 가는 쪽으로 한 걸음 내디뎌 보세요.',
  }
}
