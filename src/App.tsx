import { useEffect, useMemo, useState } from 'react'
import {
  FORTUNES,
  type Fortune,
  pickPercent,
  predictFromText,
  shuffledFortunes,
} from './data/fortunes'
import './App.css'

type Screen = 'home' | 'shuffle' | 'select' | 'reveal' | 'result' | 'ai'

const SHUFFLE_LINES = [
  '승리의 기운을 불러오는 중...',
  '오늘의 흐름을 읽는 중...',
  '승리 타로를 섞는 중...',
]

const COUNTER_KEY = 'ainii-taro-draws'
const BASE_COUNT = 1284

function readCounter(): number {
  try {
    const n = Number(localStorage.getItem(COUNTER_KEY) ?? 0)
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function bumpCounter(): number {
  const next = readCounter() + 1
  try {
    localStorage.setItem(COUNTER_KEY, String(next))
  } catch {
    /* ignore */
  }
  return next
}

function AeniSlot({ note }: { note?: string }) {
  return (
    <div className="aeni-slot" aria-hidden="true">
      <div className="aeni-slot__ring" />
      <p className="aeni-slot__label">{note ?? '애이니 이미지 예정'}</p>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [localDraws, setLocalDraws] = useState(0)
  const [shuffleLine, setShuffleLine] = useState(SHUFFLE_LINES[0])
  const [deck, setDeck] = useState<Fortune[]>(FORTUNES)
  const [picked, setPicked] = useState<Fortune | null>(null)
  const [percent, setPercent] = useState(0)
  const [aiText, setAiText] = useState('')
  const [aiLine, setAiLine] = useState('')

  const totalShown = useMemo(() => BASE_COUNT + localDraws, [localDraws])

  useEffect(() => {
    setLocalDraws(readCounter())
  }, [])

  useEffect(() => {
    if (screen !== 'shuffle') return
    let i = 0
    setShuffleLine(SHUFFLE_LINES[0])
    const tick = window.setInterval(() => {
      i = (i + 1) % SHUFFLE_LINES.length
      setShuffleLine(SHUFFLE_LINES[i])
    }, 900)
    const done = window.setTimeout(() => {
      setDeck(shuffledFortunes())
      setScreen('select')
    }, 2800)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(done)
    }
  }, [screen])

  useEffect(() => {
    if (screen !== 'reveal' || !picked) return
    const t = window.setTimeout(() => setScreen('result'), 1600)
    return () => window.clearTimeout(t)
  }, [screen, picked])

  function startDraw() {
    setPicked(null)
    setPercent(0)
    setAiLine('')
    setScreen('shuffle')
  }

  function chooseCard(card: Fortune) {
    const p = pickPercent(card.percentRange)
    setPicked(card)
    setPercent(p)
    setLocalDraws(bumpCounter())
    setScreen('reveal')
  }

  function resetHome() {
    setPicked(null)
    setPercent(0)
    setAiText('')
    setAiLine('')
    setScreen('home')
  }

  function runAiPredict() {
    if (!aiText.trim()) return
    const r = predictFromText(aiText)
    setPicked(r.fortune)
    setPercent(r.percent)
    setAiLine(r.line)
    setLocalDraws(bumpCounter())
    setScreen('result')
  }

  return (
    <div className="app">
      <div className="stage">
        {screen === 'home' && (
          <section className="panel home" aria-label="메인">
            <p className="eyebrow">애이니의 쪽집게 AI 타로 운세</p>
            <h1 className="title">
              오늘 나에게 들어온
              <br />
              승리의 기운은?
            </h1>
            <AeniSlot />
            <p className="lead">
              가상 AI 애이니 점술가가 오늘의 승리 타로를 준비했습니다.
              <br />
              선제골 · 역전 · 철벽 수비 · 응원 열기 중
              <br />
              오늘 가장 강하게 들어온 승리운을 판독합니다.
            </p>
            <p className="counter">
              지금까지 <strong>{totalShown.toLocaleString('ko-KR')}</strong>명이
              승리의 기운을 확인했어요
            </p>
            <button type="button" className="btn btn-cloud" onClick={startDraw}>
              승리 타로 뽑기
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setScreen('ai')}
            >
              문구로 운세 보기
            </button>
          </section>
        )}

        {screen === 'shuffle' && (
          <section className="panel shuffle" aria-live="polite">
            <p className="eyebrow">STEP 1</p>
            <h2 className="title sm">
              경기 시작 전,
              <br />
              당신에게 찾아온 승리의 기운은?
            </h2>
            <AeniSlot note="카드 섞는 중..." />
            <div className="shuffle-cards" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`card-back float f${i}`} />
              ))}
            </div>
            <p className="status">{shuffleLine}</p>
            <p className="hint">카드를 섞고 있으니 잠시 기다려 주세요.</p>
          </section>
        )}

        {screen === 'select' && (
          <section className="panel select">
            <p className="eyebrow">STEP 2–3</p>
            <h2 className="title sm">가장 끌리는 카드 한 장을 선택하세요</h2>
            <p className="status ready">네 장의 카드가 준비되었습니다</p>
            <div className="card-fan" role="list">
              {deck.map((card, idx) => (
                <button
                  key={card.id}
                  type="button"
                  className={`card-back pick p${idx}`}
                  role="listitem"
                  aria-label={`승리 타로 카드 ${idx + 1}`}
                  onClick={() => chooseCard(card)}
                />
              ))}
            </div>
            <p className="hint">애이니가 카드를 섞어 제시했어요</p>
          </section>
        )}

        {screen === 'reveal' && picked && (
          <section className="panel reveal" aria-live="polite">
            <div className="burst" aria-hidden="true" />
            <div
              className="card-face rising"
              style={{ borderColor: picked.accent }}
            >
              <span className="card-face__tag">VICTORY TAROT</span>
              <strong>{picked.title}</strong>
              <span>{picked.subtitle}</span>
            </div>
            <p className="status">
              선택한 카드에 승리의 기운이 모이고 있습니다.
              <br />
              오늘의 승리운을 공개합니다.
            </p>
          </section>
        )}

        {screen === 'result' && picked && (
          <section className="panel result">
            <div className="scroll">
              <p className="eyebrow">오늘의 승리운</p>
              <div
                className="card-face mini"
                style={{ borderColor: picked.accent }}
              >
                <strong>{picked.title}</strong>
              </div>
              <p className="percent" style={{ color: picked.accent }}>
                운수 <strong>{percent}%</strong>
              </p>
              <p className="blurb">{aiLine || picked.blurb}</p>
            </div>
            <button type="button" className="btn btn-cloud" onClick={resetHome}>
              돌아가기
            </button>
          </section>
        )}

        {screen === 'ai' && (
          <section className="panel ai">
            <p className="eyebrow">추가 운세</p>
            <h2 className="title sm">
              문구를 넣으면
              <br />
              오늘의 기운을 읽어드려요
            </h2>
            <AeniSlot note="키워드 점술" />
            <label className="field">
              <span className="sr-only">운세 문구</span>
              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="예: 인천 선제골, 포항전 역전, 오늘 응원 열기..."
                rows={3}
                maxLength={120}
              />
            </label>
            <button
              type="button"
              className="btn btn-cloud"
              onClick={runAiPredict}
              disabled={!aiText.trim()}
            >
              기운 판독하기
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetHome}>
              돌아가기
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
