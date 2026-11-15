import React from "react";
import { Composition } from "remotion";
import { PhotoShortVideo } from "./components/PhotoShortVideo";
import { ShortVideo } from "./components/ShortVideo";
import { PHOTO_SHORTS } from "./data/photoScripts";
import { FPS, SHORTS } from "./data/scripts";

/**
 * Длительности голосовых версий = реальная длительность MP3 + 1 сек хвоста
 * (замерено по файлам в public/voice/):
 *   short01: VoiceA 47.18s / VoiceB 36.15s
 *   short02: VoiceA 51.41s / VoiceB 37.88s
 *   short03: VoiceA 38.90s / VoiceB 32.39s
 * Сцены внутри ролика делятся пропорционально длине фраз (см. sceneRanges),
 * поэтому субтитры подстраиваются под каждый голос автоматически.
 */
const VOICE_COMPS = [
  { id: "Short01-PastLight-VoiceA", script: 0, audio: "voice/short01-voiceA.mp3", frames: 1446 },
  { id: "Short01-PastLight-VoiceB", script: 0, audio: "voice/short01-voiceB.mp3", frames: 1115 },
  { id: "Short02-DarkForest-VoiceA", script: 1, audio: "voice/short02-voiceA.mp3", frames: 1573 },
  { id: "Short02-DarkForest-VoiceB", script: 1, audio: "voice/short02-voiceB.mp3", frames: 1167 },
  { id: "Short03-Libet-VoiceA", script: 2, audio: "voice/short03-voiceA.mp3", frames: 1197 },
  { id: "Short03-Libet-VoiceB", script: 2, audio: "voice/short03-voiceB.mp3", frames: 1002 },
] as const;

/** Фото-версии в стиле видео-образца (полноэкранные картинки + обводка + плашка) */
const PHOTO_COMPS = [
  { id: "Photo01-PastLight-VoiceA", photo: 0, audio: "voice/short01-voiceA.mp3", frames: 1446 },
  { id: "Photo01-PastLight-VoiceB", photo: 0, audio: "voice/short01-voiceB.mp3", frames: 1115 },
  { id: "Photo02-DarkForest-VoiceA", photo: 1, audio: "voice/short02-voiceA.mp3", frames: 1573 },
  { id: "Photo03-Libet-VoiceA", photo: 2, audio: "voice/short03-voiceA.mp3", frames: 1197 },
] as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Фото-версии по образцу — актуальный стиль */}
      {PHOTO_COMPS.map((c) => (
        <Composition
          key={c.id}
          id={c.id}
          component={PhotoShortVideo}
          durationInFrames={c.frames}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{
            script: PHOTO_SHORTS[c.photo].script,
            images: PHOTO_SHORTS[c.photo].images,
            captions: PHOTO_SHORTS[c.photo].captions,
            audioFile: c.audio,
          }}
        />
      ))}

      {/* Голосовые версии — готовые к рендеру */}
      {VOICE_COMPS.map((c) => (
        <Composition
          key={c.id}
          id={c.id}
          component={ShortVideo}
          durationInFrames={c.frames}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{ script: SHORTS[c.script], audioFile: c.audio }}
        />
      ))}

      {/* Шаблоны без звука — быстрый предпросмотр анимаций */}
      <Composition
        id="Short01-PastLight"
        component={ShortVideo}
        durationInFrames={40 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ script: SHORTS[0], audioFile: null }}
      />
      <Composition
        id="Short02-DarkForest"
        component={ShortVideo}
        durationInFrames={40 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ script: SHORTS[1], audioFile: null }}
      />
      <Composition
        id="Short03-Libet"
        component={ShortVideo}
        durationInFrames={40 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ script: SHORTS[2], audioFile: null }}
      />
    </>
  );
};
