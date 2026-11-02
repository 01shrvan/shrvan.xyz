import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { drawing, readPng } from "ascii.rest/kit";

const COLS = 120;
const ROWS = 38;
const SHOTS = ["parchi", "align-network", "packdaddy", "bagdaddy"];
const LIGHT_PAGES = new Set(["parchi", "packdaddy"]);

const inverted = (data) => {
  const out = Uint8ClampedArray.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const level = (255 - (out[i] * 0.3 + out[i + 1] * 0.59 + out[i + 2] * 0.11) - 62) * 1.45;
    out[i] = out[i + 1] = out[i + 2] = level;
  }
  return out;
};

const fit = (lines) =>
  Array.from({ length: ROWS }, (_, i) => (lines[i] ?? "").padEnd(COLS).slice(0, COLS));

const plates = {};
for (const name of SHOTS) {
  const png = readFileSync(resolve(`src/assets/works/${name}.png`));
  const { data, width, height } = await readPng(png);
  const pixels = LIGHT_PAGES.has(name) ? inverted(data) : data;
  plates[name] = fit(drawing(pixels, width, height, { width: COLS, style: "shade" }).art);
}

writeFileSync(resolve("src/lib/plates.json"), `${JSON.stringify(plates, null, 2)}\n`);
