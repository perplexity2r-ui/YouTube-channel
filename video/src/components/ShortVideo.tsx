import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Scene, ShortScript, VisualKind } from "../data/scripts";
import { CHANNEL_NAME } from "../data/scripts";

/* ---------------------------------- utils --------------------------------- */

const seeded = (i: number, mod: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return Math.floor((x - Math.floor(x)) * mod);
};

function Stars({ accent }: { accent: string }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: 90 }).map((_, i) => {
        const tw =
          0.35 + 0.65 * Math.abs(Math.sin(frame / (18 + (i % 7) * 4) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: seeded(i, 1080),
              top: seeded(i + 500, 1920),
              width: i % 9 === 0 ? 5 : 3,
              height: i % 9 === 0 ? 5 : 3,
              borderRadius: "50%",
              background: i % 11 === 0 ? accent : "#ffffff",
              opacity: tw * 0.8,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

/** Крупный заголовок. *слово ... слово* = акцентный цвет. Внутри Sequence frame — локальный. */
function Title({ text, accent }: { text: string; accent: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Парсим по словам: пробелы рендерим явно между inline-block спанами,
  // звёздочки только включают/выключают акцент (иначе пробел у акцента теряется).
  let accentOn = false;
  const words = text.split(" ").map((raw) => {
    if (raw.startsWith("*")) accentOn = true;
    const isAccent = accentOn;
    if (raw.length > 1 && raw.endsWith("*")) accentOn = false;
    return { clean: raw.replaceAll("*", ""), isAccent };
  });
  return (
    <div
      style={{
        fontSize: 96,
        lineHeight: 1.04,
        fontWeight: 900,
        letterSpacing: -1,
        textAlign: "center",
        color: "#fff",
        textTransform: "uppercase",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {words.map((w, i) => {
        const spr = spring({
          frame: frame - i * 2,
          fps,
          config: { damping: 14, stiffness: 180, mass: 0.7 },
        });
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: "inline-block",
                color: w.isAccent ? accent : "#fff",
                transform: `translateY(${interpolate(spr, [0, 1], [46, 0])}px) scale(${interpolate(spr, [0, 1], [0.92, 1])})`,
                opacity: spr,
                textShadow: w.isAccent ? `0 0 42px ${accent}66` : "0 6px 30px rgba(0,0,0,.55)",
              }}
            >
              {w.clean}
            </span>
            {i < words.length - 1 ? " " : ""}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* --------------------------------- visuals -------------------------------- */

function Visual({
  kind,
  accent,
  accent2,
}: {
  kind: VisualKind;
  accent: string;
  accent2: string;
}) {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 14) * 0.045;
  const common: React.CSSProperties = {
    width: 860,
    height: 620,
    margin: "0 auto",
    position: "relative",
  };

  if (kind === "sun") {
    return (
      <div style={common}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 380,
            height: 380,
            borderRadius: "50%",
            transform: `translate(-50%,-50%) scale(${pulse})`,
            background:
              "radial-gradient(circle at 42% 38%, #fff7cc, #fbbf24 42%, #f97316 72%, rgba(249,115,22,0) 74%)",
            boxShadow: "0 0 140px 60px rgba(245,158,11,.35)",
          }}
        />
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 5,
              height: 120,
              borderRadius: 4,
              background: accent2,
              opacity: 0.55,
              transform: `translate(-50%,-50%) rotate(${i * 30 + frame * 0.35}deg) translateY(-285px)`,
            }}
          />
        ))}
      </div>
    );
  }

  if (kind === "eye") {
    const look = Math.sin(frame / 26) * 26;
    return (
      <div style={common}>
        <svg viewBox="0 0 860 620" width="860" height="620">
          <path
            d="M60 310 Q430 40 800 310 Q430 580 60 310 Z"
            fill="rgba(255,255,255,.06)"
            stroke="#fff"
            strokeWidth="10"
          />
          <circle cx={430 + look} cy="310" r="118" fill={accent} opacity="0.92" />
          <circle cx={430 + look} cy="310" r="54" fill="#020617" />
          <circle cx={452 + look} cy="282" r="18" fill="#fff" />
          <line x1="110" y1="110" x2="750" y2="510" stroke="#f43f5e" strokeWidth="18" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (kind === "galaxy") {
    return (
      <div style={common}>
        <svg viewBox="0 0 860 620" width="860" height="620">
          {Array.from({ length: 130 }).map((_, i) => {
            const t = i / 130;
            const a = t * 9.2 + frame * 0.008 + (i % 3) * 0.35;
            const r = 18 + t * 330;
            return (
              <circle
                key={i}
                cx={430 + Math.cos(a) * r}
                cy={310 + Math.sin(a) * r * 0.62}
                r={2 + (i % 4)}
                fill={i % 5 === 0 ? accent2 : accent}
                opacity={0.25 + t * 0.7}
              />
            );
          })}
          <circle cx="430" cy="310" r="30" fill="#fff" opacity="0.95" />
        </svg>
      </div>
    );
  }

  if (kind === "forest" || kind === "hunter") {
    return (
      <div style={common}>
        <svg viewBox="0 0 860 620" width="860" height="620">
          <circle cx="700" cy="105" r="58" fill="#e2e8f0" opacity="0.9" />
          <circle cx="678" cy="92" r="52" fill="#02120a" opacity="0.28" />
          {Array.from({ length: 11 }).map((_, i) => {
            const x = 20 + i * 78;
            const h = 300 + seeded(i, 190);
            const sway = Math.sin(frame / 30 + i) * 4;
            return (
              <path
                key={i}
                d={`M${x + sway} 620 L${x + 42} ${620 - h} L${x + 84} 620 Z`}
                fill={i % 2 ? "#052e1b" : "#064e2b"}
                opacity={0.75 + (i % 3) * 0.08}
              />
            );
          })}
          {kind === "hunter" && (
            <g opacity={0.55 + Math.sin(frame / 9) * 0.4}>
              <circle cx="392" cy="392" r="13" fill="#f43f5e" />
              <circle cx="468" cy="392" r="13" fill="#f43f5e" />
            </g>
          )}
        </svg>
      </div>
    );
  }

  if (kind === "silence") {
    return (
      <div style={common}>
        <svg viewBox="0 0 860 620" width="860" height="620">
          {[90, 160, 230].map((r, i) => (
            <circle
              key={r}
              cx="430"
              cy="310"
              r={r + Math.sin(frame / 16 + i) * 7}
              fill="none"
              stroke={accent}
              strokeWidth="7"
              opacity={0.65 - i * 0.17}
              strokeDasharray="26 20"
            />
          ))}
          <circle cx="430" cy="310" r="44" fill={accent} />
          <line x1="250" y1="130" x2="610" y2="490" stroke="#f43f5e" strokeWidth="20" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (kind === "brain") {
    return (
      <div style={common}>
        <svg viewBox="0 0 860 620" width="860" height="620">
          <path
            d="M430 70 C250 55 140 170 155 300 C110 390 190 520 310 505 C360 555 500 555 550 505 C670 520 750 390 705 300 C720 170 610 55 430 70 Z"
            fill="rgba(232,121,249,.10)"
            stroke={accent}
            strokeWidth="9"
          />
          {Array.from({ length: 16 }).map((_, i) => {
            const x = 230 + seeded(i, 400);
            const y = 140 + seeded(i + 90, 320);
            const on = Math.sin(frame / 7 + i * 1.7) > 0.25;
            return (
              <g key={i}>
                <line x1={x} y1={y} x2={430} y2={310} stroke={accent2} strokeWidth="3" opacity="0.30" />
                <circle cx={x} cy={y} r={on ? 15 : 8} fill={on ? "#fff" : accent} opacity={on ? 1 : 0.55} />
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (kind === "button") {
    const press = Math.max(0, Math.sin(frame / 22)) ** 3;
    return (
      <div style={common}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "46%",
            transform: `translate(-50%,-50%) translateY(${press * 16}px) scale(${1 - press * 0.05})`,
            width: 430,
            height: 190,
            borderRadius: 42,
            background: `linear-gradient(180deg, ${accent}, ${accent2})`,
            boxShadow: `0 ${26 - press * 12}px 0 #1e1b4b, 0 34px 70px rgba(0,0,0,.5)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 54,
            fontWeight: 900,
            fontFamily: "Arial, Helvetica, sans-serif",
            letterSpacing: 2,
          }}
        >
          ЖМИ
        </div>
      </div>
    );
  }

  if (kind === "commentator") {
    return (
      <div style={common}>
        <svg viewBox="0 0 860 620" width="860" height="620">
          <rect x="370" y="90" width="120" height="230" rx="60" fill={accent} />
          <path d="M285 285 C285 430 575 430 575 285" fill="none" stroke="#fff" strokeWidth="16" />
          <line x1="430" y1="445" x2="430" y2="545" stroke="#fff" strokeWidth="16" />
          <rect x="120" y="88" width="270" height="118" rx="28" fill="#fff" opacity="0.94" />
          <text x="152" y="162" fontFamily="Arial" fontWeight="900" fontSize="44" fill="#12071f">
            Я РЕШИЛ!
          </text>
          <text x="492" y="112" fontFamily="Arial" fontWeight="700" fontSize="30" fill={accent}>
            …на самом деле нет
          </text>
        </svg>
      </div>
    );
  }

  if (kind === "cta") {
    const bounce = 1 + Math.sin(frame / 10) * 0.035;
    return (
      <div
        style={{
          ...common,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
        }}
      >
        <div
          style={{
            transform: `scale(${bounce})`,
            background: "#f43f5e",
            color: "#fff",
            borderRadius: 999,
            padding: "30px 58px",
            fontSize: 52,
            fontWeight: 900,
            fontFamily: "Arial, Helvetica, sans-serif",
            boxShadow: "0 22px 60px rgba(244,63,94,.4)",
          }}
        >
          ПОДПИСАТЬСЯ
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 34,
            fontWeight: 700,
            fontFamily: "Arial, Helvetica, sans-serif",
            opacity: 0.9,
            textAlign: "center",
          }}
        >
          {CHANNEL_NAME}
          <br />
          <span style={{ fontSize: 28, opacity: 0.75 }}>
            космос • физика • мозг — простым языком
          </span>
        </div>
      </div>
    );
  }

  // star
  const tw = 0.75 + Math.sin(frame / 8) * 0.25;
  return (
    <div style={common}>
      <svg viewBox="0 0 860 620" width="860" height="620">
        <g transform={`translate(430 310) scale(${tw})`}>
          <path d="M0 -220 L34 -34 L220 0 L34 34 L0 220 L-34 34 L-220 0 L-34 -34 Z" fill={accent} />
          <circle r="42" fill="#fff" />
        </g>
        <line x1="90" y1="540" x2="365" y2="360" stroke={accent2} strokeWidth="6" strokeDasharray="16 14" />
        <circle cx="90" cy="540" r="22" fill={accent2} />
      </svg>
    </div>
  );
}

/* ---------------------------------- scene --------------------------------- */
/* Внутри <Sequence> useCurrentFrame() — локальный (0 = начало сцены),
   а useVideoConfig().durationInFrames — длительность всей композиции,
   поэтому длительность сцены передаём пропсом. */

function SceneView({
  scene,
  script,
  sceneDuration,
}: {
  scene: Scene;
  script: ShortScript;
  sceneDuration: number;
}) {
  const frame = useCurrentFrame();
  const words = scene.caption.split(" ");
  const active = Math.min(
    words.length,
    Math.floor((frame / Math.max(1, sceneDuration)) * words.length * 1.12),
  );
  const opacity = interpolate(
    frame,
    [0, 8, sceneDuration - 8, sceneDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ position: "absolute", top: 235, left: 0, right: 0 }}>
        <Visual kind={scene.visual} accent={script.accent} accent2={script.accent2} />
      </div>

      <div style={{ position: "absolute", top: scene.stat ? 800 : 875, left: 62, right: 62 }}>
        <div
          style={{
            textAlign: "center",
            color: script.accent,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 5,
            marginBottom: 22,
            textTransform: "uppercase",
          }}
        >
          {scene.eyebrow}
        </div>
        <Title text={scene.title} accent={script.accent} />
      </div>

      {scene.stat && (
        <div style={{ position: "absolute", top: 1310, left: 0, right: 0, textAlign: "center" }}>
          <span
            style={{
              background: script.accent,
              color: "#020617",
              borderRadius: 999,
              padding: "16px 30px",
              fontSize: 46,
              fontWeight: 900,
            }}
          >
            {scene.stat}
          </span>
          {scene.statLabel && (
            <div style={{ marginTop: 18, color: "#e2e8f0", fontSize: 29, fontWeight: 600 }}>
              {scene.statLabel}
            </div>
          )}
        </div>
      )}

      {/* караоке-субтитры: выше зоны интерфейса YouTube Shorts */}
      <div style={{ position: "absolute", left: 54, right: 54, bottom: 235 }}>
        <div
          style={{
            background: "rgba(2,6,23,.78)",
            border: `2px solid ${script.accent}55`,
            borderRadius: 28,
            padding: "26px 30px",
            textAlign: "center",
            fontSize: 43,
            lineHeight: 1.28,
            fontWeight: 700,
          }}
        >
          {words.map((w, i) => (
            <span
              key={i}
              style={{
                color: i < active ? "#fff" : "rgba(255,255,255,.38)",
                background: i === active - 1 ? `${script.accent}44` : "transparent",
                borderRadius: 8,
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* --------------------------------- главный -------------------------------- */

export type ShortVideoProps = {
  script: ShortScript;
  /** файл в public/, напр. voice/short01-voiceA.mp3. Нет файла — без звука (превью в Studio). */
  audioFile?: string | null;
};

/** Границы сцен пропорционально длине фраз озвучки */
export function sceneRanges(script: ShortScript, totalFrames: number) {
  const weights = script.scenes.map((s) => Math.max(18, s.voiceText.length));
  const sum = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return script.scenes.map((scene, i) => {
    const isLast = i === script.scenes.length - 1;
    const duration = isLast
      ? Math.max(45, totalFrames - acc)
      : Math.max(45, Math.round((weights[i] / sum) * totalFrames));
    const from = acc;
    acc += duration;
    return { scene, from, duration };
  });
}

export const ShortVideo: React.FC<ShortVideoProps> = ({ script, audioFile }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ranges = sceneRanges(script, durationInFrames);
  const activeIdx = Math.max(
    0,
    ranges.findIndex((r) => frame >= r.from && frame < r.from + r.duration),
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 1500px at 50% 18%, ${script.accent}22, transparent 60%), linear-gradient(180deg, ${script.bg}, #020617)`,
        overflow: "hidden",
      }}
    >
      <Stars accent={script.accent} />

      {/* шапка */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 56,
          right: 56,
          zIndex: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ color: "#fff", fontWeight: 900, fontSize: 31, letterSpacing: 1 }}>
          {CHANNEL_NAME}
        </div>
        <div
          style={{
            color: "#020617",
            background: script.accent,
            fontWeight: 800,
            fontSize: 26,
            borderRadius: 999,
            padding: "10px 20px",
          }}
        >
          {script.rubric}
        </div>
      </div>

      {/* прогресс по сценам */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 56,
          right: 56,
          display: "flex",
          gap: 8,
          zIndex: 5,
        }}
      >
        {ranges.map((r, i) => {
          const local = interpolate(frame, [r.from, r.from + r.duration], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 9,
                borderRadius: 99,
                background: "rgba(255,255,255,.18)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${i < activeIdx ? 100 : i > activeIdx ? 0 : local * 100}%`,
                  background: script.accent,
                }}
              />
            </div>
          );
        })}
      </div>

      {ranges.map((r, i) => (
        <Sequence key={i} from={r.from} durationInFrames={r.duration} name={r.scene.title}>
          <SceneView scene={r.scene} script={script} sceneDuration={r.duration} />
        </Sequence>
      ))}

      {audioFile ? <Audio src={staticFile(audioFile)} /> : null}
    </AbsoluteFill>
  );
};
