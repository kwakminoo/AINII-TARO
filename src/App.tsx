import { useEffect, useMemo, useState } from 'react'
import {
  FORTUNES,
  type Fortune,
  pickPercent,
  predictFromText,
  shuffledFortunes,
} from './data/fortunes'
import { asset } from './lib/assets'
import './App.css'

type Screen =
  | 'home'
  | 'shuffle'
  | 'select'
  | 'reveal'
  | 'preview'
  | 'ai'

const SHUFFLE_LINES = [
  '승리의 기운을 불러오는 중...',
  '오늘의 흐름을 읽는 중...',
  '승리 타로를 섞는 중...',
]

const AI_CHIPS = ['인천 선제골', '포항전 역전', '오늘 응원 열기']

/** 카드 선택 후, 승리운 공개 직전 — 카드가 위에 뜨는 로딩 시간(초) */
const REVEAL_LOADING_SEC = 3

const COUNTER_KEY = 'ainii-taro-draws'
const BASE_COUNT = 100

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

function ImgBtn({
  src,
  alt,
  onClick,
  disabled,
  className = '',
}: {
  src: string
  alt: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      className={`img-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={alt}
    >
      <img src={src} alt="" draggable={false} />
    </button>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [localDraws, setLocalDraws] = useState(0)
  const [shuffleLine, setShuffleLine] = useState(SHUFFLE_LINES[0])
  const [deck, setDeck] = useState<Fortune[]>(FORTUNES)
  const [picked, setPicked] = useState<Fortune | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [percent, setPercent] = useState(0)
  const [aiText, setAiText] = useState('')
  const [aiLine, setAiLine] = useState('')
  const [sceneFx, setSceneFx] = useState<'idle' | 'fade'>('idle')
  const [showResult, setShowResult] = useState(false)

  const totalShown = useMemo(() => BASE_COUNT + localDraws, [localDraws])

  useEffect(() => {
    setLocalDraws(readCounter())
  }, [])

  useEffect(() => {
    const el = document.querySelector('.stage-scroll')
    if (el) el.scrollTop = 0
  }, [screen])

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
      transitionTo('select')
    }, 2800)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(done)
    }
  }, [screen])

  useEffect(() => {
    if (screen !== 'reveal' || !picked) return
    const t = window.setTimeout(
      () => transitionTo('preview', 'none'),
      REVEAL_LOADING_SEC * 1000,
    )
    return () => window.clearTimeout(t)
  }, [screen, picked])

  function transitionTo(next: Screen, effect: 'fade' | 'none' = 'fade') {
    if (effect === 'none') {
      setScreen(next)
      return
    }
    setSceneFx('fade')
    window.setTimeout(() => setScreen(next), 220)
    window.setTimeout(() => setSceneFx('idle'), 520)
  }

  function startDraw() {
    setPicked(null)
    setSelectedId(null)
    setPercent(0)
    setAiLine('')
    setShowResult(false)
    transitionTo('shuffle')
  }

  function chooseCard(card: Fortune) {
    if (selectedId) return
    const p = pickPercent(card.percentRange)
    setSelectedId(card.id)
    window.setTimeout(() => {
      setPicked(card)
      setPercent(p)
      setLocalDraws(bumpCounter())
      transitionTo('reveal')
    }, 1150)
  }

  function resetHome() {
    setPicked(null)
    setSelectedId(null)
    setPercent(0)
    setAiText('')
    setAiLine('')
    setShowResult(false)
    transitionTo('home')
  }

  function runAiPredict() {
    if (!aiText.trim()) return
    const r = predictFromText(aiText)
    setPicked(r.fortune)
    setPercent(r.percent)
    setAiLine(r.line)
    setLocalDraws(bumpCounter())
    setShowResult(false)
    transitionTo('preview')
  }

  return (
    <div className="app">
      <div className={`stage ${sceneFx !== 'idle' ? `scene-${sceneFx}` : ''}`}>
        <div className="scene-overlay" aria-hidden="true" />
        <div className="stage-scroll">
        {screen === 'home' && (
          <section className="panel home" aria-label="메인">
            <img
              className="panel-halo halo-home"
              src={asset("/assets/sunburst.png")}
              alt=""
              draggable={false}
            />
            <header className="hero-copy">
              <p className="brand-line">애이니의 쪽집게</p>
              <h1 className="brand-title">AI 타로 운세</h1>
              <p className="hero-q">오늘 나에게 들어온 승리의 기운은?</p>
            </header>
            <img
              className="aeny aeny-home"
              src={asset("/assets/aeny-home.png")}
              alt="애이니"
              draggable={false}
            />
            <div className="cta-stack">
              <ImgBtn
                src={asset("/assets/btn-draw.png")}
                alt="승리 타로 뽑기"
                onClick={startDraw}
              />
              <ImgBtn
                src={asset("/assets/btn-ask-alt.png")}
                alt="질문으로 승부운 보기"
                onClick={() => setScreen('ai')}
              />
            </div>
            <p className="counter">
              *지금까지 <strong>{totalShown.toLocaleString('ko-KR')}</strong>명이
              승리의 기운을 확인했어요*
            </p>
          </section>
        )}

        {screen === 'shuffle' && (
          <section className="panel shuffle" aria-live="polite">
            <img
              className="shuffle-scene"
              src={asset("/assets/aeny-table.png")}
              alt=""
              draggable={false}
            />
            <div className="shuffle-overlay">
              <div className="shuffle-cards" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <img
                    key={i}
                    className={`card-back float f${i}`}
                    src={asset("/assets/card-back.png")}
                    alt=""
                    draggable={false}
                  />
                ))}
              </div>
              <p className="status">{shuffleLine}</p>
              <p className="hint blink">*카드를 섞고 있으니 잠시 기다려주세요*</p>
            </div>
          </section>
        )}

        {screen === 'select' && (
          <section className="panel select">
            <p className="step">STEP 2</p>
            <h2 className="step-title">카드를 한 장 선택해주세요</h2>
            <img
              className="aeny aeny-select"
              src={asset("/assets/aeny-home.png")}
              alt="애이니"
              draggable={false}
            />
            <div className="card-fan" role="list">
              {deck.map((card, idx) => (
                <button
                  key={card.id}
                  type="button"
                  className={`card-pick p${idx} ${
                    selectedId === card.id
                      ? 'is-picked'
                      : selectedId
                        ? 'is-dimmed'
                        : ''
                  }`}
                  role="listitem"
                  aria-label={`승리 타로 카드 ${idx + 1}`}
                  onClick={() => chooseCard(card)}
                  disabled={Boolean(selectedId)}
                >
                  {selectedId === card.id && (
                    <img
                      className="pick-glow"
                      src={asset("/assets/sunburst.png")}
                      alt=""
                      draggable={false}
                    />
                  )}
                  <img src={asset("/assets/card-back.png")} alt="" draggable={false} />
                </button>
              ))}
            </div>
            <p className="hint">
              {selectedId
                ? '승리의 기운을 읽는 중입니다...'
                : '승리의 기운이 담긴 카드가 준비되었습니다.'}
            </p>
          </section>
        )}

        {screen === 'reveal' && picked && (
          <section className="panel reveal" aria-live="polite">
            <p className="step">STEP 3</p>
            <div className="reveal-stage">
              <img
                className="sunburst"
                src={asset("/assets/sunburst.png")}
                alt=""
                draggable={false}
              />
              <img
                className="card-rising"
                src={asset("/assets/card-back.png")}
                alt=""
                draggable={false}
              />
            </div>
            <p className="status">
              선택한 카드에 승리의 기운이 모이고 있습니다.
              <br />
              오늘의 승리운을 공개합니다.
            </p>
            <div className="reveal-rest" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <img
                  key={i}
                  src={asset("/assets/card-back.png")}
                  alt=""
                  draggable={false}
                />
              ))}
            </div>
          </section>
        )}

        {screen === 'preview' && picked && (
          <section
            className={`panel preview${showResult ? ' is-result' : ''}`}
          >
            <img
              className="panel-halo halo-preview"
              src={asset("/assets/sunburst.png")}
              alt=""
              draggable={false}
            />
            <img
              className="title-today"
              src={asset("/assets/title-today.png")}
              alt="오늘의 승리운"
              draggable={false}
            />
            <div className="result-body">
              <img
                className="fortune-card"
                src={picked.cardImg}
                alt={`${picked.title} — ${picked.subtitle}`}
                draggable={false}
              />
              <div className="result-sheet" aria-hidden={!showResult}>
                <p className="result-label">오늘의 승리운 지수</p>
                <p className="result-percent" style={{ color: '#5a2d8a' }}>
                  <span className="star">✦</span>
                  <strong>{percent}%</strong>
                  <span className="star">✦</span>
                </p>
                <p className="result-blurb">{aiLine || picked.blurb}</p>
                <div className="cheer-wrap">
                  <p className="cheer-badge">✦ 오늘의 응원주문 ✦</p>
                  <blockquote className="cheer-bubble">
                    {picked.cheer.split('\n').map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </blockquote>
                </div>
              </div>
            </div>
            {!showResult ? (
              <ImgBtn
                src={asset("/assets/btn-result.png")}
                alt="결과 보기"
                onClick={() => setShowResult(true)}
              />
            ) : (
              <ImgBtn
                className="btn-back-result"
                src={asset("/assets/btn-back.png")}
                alt="돌아가기"
                onClick={resetHome}
              />
            )}
          </section>
        )}

        {screen === 'ai' && (
          <section className="panel ai">
            <header className="hero-copy">
              <h1 className="brand-title sm">질문으로 승부운 보기</h1>
              <p className="hero-q">
                애이니에게 질문하면
                <br />
                오늘의 기운을 읽어드려요
              </p>
            </header>
            <div className="ai-stage">
              <img
                className="aeny aeny-ask"
                src={asset("/assets/aeny-home.png")}
                alt="애이니"
                draggable={false}
              />
              <ul className="ai-chips" aria-label="예시 질문">
                {AI_CHIPS.map((chip) => (
                  <li key={chip}>
                    <button
                      type="button"
                      onClick={() => setAiText(chip)}
                    >
                      {chip}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <label className="field">
              <span className="sr-only">질문 입력</span>
              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="질문을 입력해주세요."
                rows={2}
                maxLength={120}
              />
            </label>
            <ImgBtn
              src={asset("/assets/btn-read.png")}
              alt="기운 판독하기"
              onClick={runAiPredict}
              disabled={!aiText.trim()}
            />
            <button type="button" className="link-back" onClick={resetHome}>
              돌아가기
            </button>
          </section>
        )}
        </div>
      </div>
    </div>
  )
}
