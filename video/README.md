# Shorts на Remotion

Вертикальные шортсы (1080×1920, 30 fps) для канала: наука / космос / мозг.
Всё рисуется кодом (без стоковых видео): звёзды, галактика, тёмный лес, мозг, кинетическая типографика и караоке-субтитры. Сценарии — из `../shorts.md`.

## Что внутри

| Файл | Что это |
|---|---|
| `src/data/scripts.ts` | 3 сценария: сцены, текст озвучки (`voiceFull`), заголовки, акцентные цвета. Название канала — константа `CHANNEL_NAME` в этом же файле |
| `src/components/ShortVideo.tsx` | Универсальный шаблон ролика: шапка, прогресс по сценам, визуалы, субтитры |
| `src/Root.tsx` | Композиции Remotion (по одной на ролик × варианты голоса) |
| `public/voice/` | Сгенерированные MP3 озвучки (`shortNN-voiceA.mp3` / `shortNN-voiceB.mp3`) |
| `out/` | Готовые MP4 после рендера |

## Ролики

1. **Short01-PastLight** — «Ты смотришь в прошлое» (Солнце — 8 минут назад, небо — машина времени)
2. **Short02-DarkForest** — «Тёмный лес: почему космос молчит»
3. **Short03-Libet** — «Мозг решил до тебя» (эксперимент Либета)

Каждый ролик собирается в двух вариантах озвучки (VoiceA / VoiceB), пока не выбран постоянный голос канала.

## Фото-версии в стиле видео-образца (актуальные)

Образец разобран по кадрам: полноэкранное фото на фразу + медленный наезд (Ken Burns) и панч на склейке, крупный заголовок с тёмной обводкой сверху, субтитр в тёмной плашке с акцентной подсветкой ключевых слов, финальный CTA. Реализация — `src/components/PhotoShortVideo.tsx`, сцены и картинки — `src/data/photoScripts.ts` + `public/images/`.

| Файл | Ролик | Голос | Длительность |
|---|---|---|---|
| `photo01-voiceA.mp4` | «Ты смотришь в прошлое» | VoiceA | 48 сек |
| `photo01-voiceB.mp4` | «Ты смотришь в прошлое» | VoiceB | 37 сек |
| `photo02-voiceA.mp4` | «Тёмный лес: почему космос молчит» | VoiceA | 52 сек |

`Photo03-Libet-VoiceA` («Мозг решил до тебя») собран в коде, картинки `public/images/s3-*.jpg` догенерируются следующим шагом (лимит генерации изображений на ход — 10 шт.), после чего рендерится той же командой.

Рендер фото-версий идёт обычным `remotion render ... --crf 18` (тяжёлые 50–70 МБ), затем файлы пережимаются до ~15–20 МБ без видимой потери качества:

```bash
ffmpeg -i out/photo01-voiceA.mp4 -c:v libx264 -crf 24 -preset medium -c:a aac -b:a 160k -movflags +faststart out/photo01-voiceA-web.mp4
```

## Готовые ролики, первая (SVG) версия (out/)

| Файл | Ролик | Голос | Длительность |
|---|---|---|---|
| `short01-voiceA.mp4` | «Ты смотришь в прошлое» | VoiceA — выбран на пробе | 48 сек |
| `short01-voiceB.mp4` | «Ты смотришь в прошлое» | VoiceB — второй, для сравнения | 37 сек |
| `short02-voiceA.mp4` | «Тёмный лес: почему космос молчит» | VoiceA | 52 сек |
| `short03-voiceA.mp4` | «Мозг решил до тебя» (Либет) | VoiceA | 40 сек |

Озвучка Short02/Short03 голосом B тоже записана (`public/voice/short02-voiceB.mp3`, `short03-voiceB.mp3`) и композиции `Short02-DarkForest-VoiceB` / `Short03-Libet-VoiceB` готовы — рендер занимает ~3 минуты на ролик (команды ниже, поменять суффикс на VoiceB). После выбора постоянного голоса канала оставить только его вариант.

## Команды

```bash
cd video
npm install
npm run studio        # Remotion Studio: предпросмотр в браузере
npx tsc --noEmit      # проверка типов
```

### Рендер MP4

Remotion по умолчанию скачивает Chrome Headless Shell со своего CDN. Если CDN недоступен, браузер берётся из npm-пакета `@sparticuz/chromium` (уже в devDependencies):

```bash
node scripts/ensure-chromium.mjs   # распакует Chromium и библиотеки в /tmp
export LD_LIBRARY_PATH=/tmp/al2023/lib:/tmp FONTCONFIG_PATH=/tmp/fonts
npx remotion render Short01-PastLight-VoiceA out/short01-voiceA.mp4 --browser-executable=/tmp/chromium --concurrency=2
npx remotion render Short01-PastLight-VoiceB out/short01-voiceB.mp4 --browser-executable=/tmp/chromium --concurrency=2
npx remotion render Short02-DarkForest-VoiceA out/short02-voiceA.mp4 --browser-executable=/tmp/chromium --concurrency=2
npx remotion render Short03-Libet-VoiceA out/short03-voiceA.mp4 --browser-executable=/tmp/chromium --concurrency=2
```

На машине с обычным доступом в интернет достаточно `npx remotion browser ensure` и рендера без `--browser-executable`.

## Как это устроено

- Длительность сцен считается автоматически — пропорционально длине фразы озвучки, поэтому субтитры и картинки сами подстраиваются под реальную длительность MP3 (длительность композиции задаётся в `Root.tsx` при добавлении аудиофайла).
- Текст на экране поддерживает акценты: `*слово*` в поле `title` красится акцентным цветом.
- Безопасные зоны Shorts: субтитры подняты на 235 px от низа, чтобы их не перекрывал интерфейс YouTube.
- Шрифт — системный Arial/Helvetica (кириллица из коробки, без внешних загрузок).

## Публикация

Заголовки для YouTube лежат в поле `youtubeTitle` каждого сценария в `scripts.ts`.
Формат файла для загрузки: MP4, 1080×1920, до 60 секунд.
