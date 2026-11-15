/**
 * Готовит Chromium для рендера Remotion без скачивания с CDN Remotion:
 * бинарник и системные библиотеки берутся из npm-пакета @sparticuz/chromium
 * (всё приходит с registry.npmjs.org) и распаковываются в /tmp.
 *
 * Использование:
 *   node scripts/ensure-chromium.mjs            -> печатает путь к бинарнику
 *   LD_LIBRARY_PATH=/tmp/al2023/lib:/tmp npx remotion render <Comp> out.mp4 --browser-executable=/tmp/chromium
 */
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

if (!existsSync("/tmp/chromium")) {
  // executablePath() сам распакует chromium.br / swiftshader / fonts в /tmp.
  // AWS_EXECUTION_ENV заставляет пакет распаковать ещё и al2023-библиотеки (libnss и др.)
  process.env.AWS_EXECUTION_ENV = "AWS_Lambda_nodejs22.x";
  const chromium = (await import("@sparticuz/chromium")).default;
  chromium.setGraphicsMode = false;
  await chromium.executablePath();
}

// al2023.tar.br распаковывается пакетом при lambda-окружении, но на всякий случай — вручную через node:
if (!existsSync("/tmp/al2023/lib/libnspr4.so")) {
  execFileSync("node", [
    "-e",
    `const z=require('zlib'),fs=require('fs');fs.writeFileSync('/tmp/al2023.tar',z.brotliDecompressSync(fs.readFileSync('node_modules/@sparticuz/chromium/bin/al2023.tar.br')))`,
  ]);
  execFileSync("mkdir", ["-p", "/tmp/al2023"]);
  execFileSync("tar", ["xf", "/tmp/al2023.tar", "-C", "/tmp/al2023"]);
}

console.log("/tmp/chromium");
console.error("Не забудьте: LD_LIBRARY_PATH=/tmp/al2023/lib:/tmp FONTCONFIG_PATH=/tmp/fonts");
