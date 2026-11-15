import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ShortScript } from "../data/scripts";
import { sceneRanges } from "./ShortVideo";

/**
 * Фото-стиль по видео-образцу:
 *  - полноэкранное фото, медленный наезд/отъезд (Ken Burns) + панч на склейке;
 *  - сверху крупный заголовок: белый + акцент, жирная тёмная обводка;
 *  - снизу тёмная плашка-субтитр, ключевые слова акцентным цветом;
 *  - без шапки и прогресс-бара — как в образце.
 */

type MarkedWord = { clean: string; isAccent: boolean };

function parseMarked(text: string): MarkedWord[] {
  let accentOn = false;
  return text.split(" ").map((raw) => {
    if (raw.startsWith("*")) accentOn = true;
    const isAccent = accentOn;
    if (raw.length > 1 && raw.endsWith("*")) accentOn = false;
    return { clean: raw.replaceAll("*", ""), isAccent };
  });
}

function BigTitle({ text, accent, sceneIndex }: { text: string; accent: string; sceneIndex: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = parseMarked(text);
  const plain = words.map((w) => w.clean).join(" ");
  const fontSize = plain.length <= 16 ? 158 : plain.length <= 26 ? 128 : 104;
  const pop = spring({ frame, fps, config: { damping: 13, stiffness: 210, mass: 0.65 } });

  return (
    <div
      style={{
        transform: `rotate(${sceneIndex % 2 === 0 ? -1.4 : 1.1}deg) scale(${interpolate(pop, [0, 1], [1.18, 1])})`,
        opacity: pop,
        textAlign: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontWeight: 900,
        fontSize,
        lineHeight: 1.02,
        letterSpacing: -1,
        textTransform: "uppercase",
      }}
    >
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span
            style={{
              color: w.isAccent ? accent : "#ffffff",
              // тонкий тёмный контур как в образце: буква остаётся жирной,
              // обводка не должна съедать заливку (поэтому ~1/22 размера шрифта)
              WebkitTextStroke: `${Math.max(3, Math.round(fontSize / 22))}px #0a1408`,
              textShadow:
                "3px 3px 0 #0a1408, -3px 3px 0 #0a1408, 3px -3px 0 #0a1408, -3px -3px 0 #0a1408, 0 14px 34px rgba(0,0,0,.55)",
            }}
          >
            {w.clean}
          </span>
          {i < words.length - 1 ? " " : ""}
        </React.Fragment>
      ))}
    </div>
  );
}

function CaptionPlate({ text, accent, isLast }: { text: string; accent: string; isLast: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 3, fps, config: { damping: 15, stiffness: 190, mass: 0.7 } });
  const words = parseMarked(text);

  return (
    <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.9, 1])})`, opacity: pop }}>
      <div
        style={{
          background: "rgba(4,18,7,.74)",
          borderRadius: 28,
          padding: "26px 34px",
          textAlign: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 47,
          lineHeight: 1.25,
          fontWeight: 800,
          color: "#fff",
          boxShadow: "0 18px 50px rgba(0,0,0,.45)",
        }}
      >
        {words.map((w, i) => (
          <span key={i} style={{ color: w.isAccent ? accent : "#fff" }}>
            {w.clean}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
      {isLast && (
        <div
          style={{
            margin: "26px auto 0",
            width: "fit-content",
            background: accent,
            color: "#0a1408",
            borderRadius: 999,
            padding: "18px 36px",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: 1,
            boxShadow: "0 16px 44px rgba(0,0,0,.5)",
          }}
        >
          ПОДПИШИСЬ • СОХРАНИ • НАПИШИ В КОММЕНТЫ
        </div>
      )}
    </div>
  );
}

function PhotoScene({
  image,
  title,
  caption,
  accent,
  sceneIndex,
  sceneDuration,
  isLast,
}: {
  image: string;
  title: string;
  caption: string;
  accent: string;
  sceneIndex: number;
  sceneDuration: number;
  isLast: boolean;
}) {
  const frame = useCurrentFrame();
  const zoomIn = sceneIndex % 2 === 0;
  const kenBurns = interpolate(frame, [0, sceneDuration], zoomIn ? [1.06, 1.2] : [1.2, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const punch = interpolate(frame, [0, 7], [1.05, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drift = interpolate(frame, [0, sceneDuration], zoomIn ? [0, -18] : [-18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img
        src={staticFile(image)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${kenBurns * punch}) translateY(${drift}px)`,
        }}
      />
      {/* затемнение под заголовок и субтитр */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,.52) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0) 58%, rgba(0,0,0,.55) 100%)",
        }}
      />
      <div style={{ position: "absolute", top: 165, left: 48, right: 48 }}>
        <BigTitle text={title} accent={accent} sceneIndex={sceneIndex} />
      </div>
      <div style={{ position: "absolute", left: 52, right: 52, bottom: 330 }}>
        <CaptionPlate text={caption} accent={accent} isLast={isLast} />
      </div>
    </AbsoluteFill>
  );
}

export type PhotoShortVideoProps = {
  script: ShortScript;
  images: string[];
  captions: string[];
  audioFile?: string | null;
};

export const PhotoShortVideo: React.FC<PhotoShortVideoProps> = ({
  script,
  images,
  captions,
  audioFile,
}) => {
  const { durationInFrames } = useVideoConfig();
  const ranges = sceneRanges(script, durationInFrames);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {ranges.map((r, i) => (
        <Sequence key={i} from={r.from} durationInFrames={r.duration} name={r.scene.title}>
          <PhotoScene
            image={images[i] ?? images[images.length - 1]}
            title={r.scene.title}
            caption={captions[i] ?? r.scene.caption}
            accent={script.accent}
            sceneIndex={i}
            sceneDuration={r.duration}
            isLast={i === ranges.length - 1}
          />
        </Sequence>
      ))}
      {audioFile ? <Audio src={staticFile(audioFile)} /> : null}
    </AbsoluteFill>
  );
};
