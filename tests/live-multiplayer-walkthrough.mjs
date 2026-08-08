import playwright from "/home/claude/kriskringle/node_modules/playwright/index.js";
import { mkdir } from "node:fs/promises";

const { chromium } = playwright;
const base = "https://games.xmasgoat.com";
const out = "/home/claude/gamegoat/artifacts/multiplayer-walkthrough";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const contexts = [];

async function phone(name) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  contexts.push(context);
  const page = await context.newPage();
  page.on("pageerror", (error) => process.stdout.write(`[${name}:pageerror] ${error.message}\n`));
  page.on("console", (msg) => { if (msg.type() === "error") process.stdout.write(`[${name}:console] ${msg.text()}\n`); });
  return page;
}

async function shot(page, name) {
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
}

async function whiteElephant() {
  const host = await phone("white-host");
  await host.goto(`${base}/kris-kringle`, { waitUntil: "networkidle" });
  await host.getByPlaceholder("Your name (e.g. Sarah)").fill("Holly Host");
  await host.getByRole("button", { name: /me — next/ }).click();
  await host.getByRole("button", { name: /Lock it in/ }).click();
  await host.getByRole("button", { name: /Create room & invite players/ }).click();
  await host.waitForURL(/\/kris-kringle\/room\//, { timeout: 20000 });
  const roomUrl = host.url();
  await shot(host, "white-01-lobby-host");

  const players = [];
  for (const name of ["Nick Noel", "Ginger Bell"]) {
    const page = await phone(`white-${name}`);
    players.push(page);
    await page.goto(roomUrl, { waitUntil: "networkidle" });
    await page.getByPlaceholder("Your name").fill(name);
    await page.getByRole("button", { name: "Join game" }).click();
    await page.waitForTimeout(1500);
  }
  await host.waitForTimeout(2000);
  await shot(host, "white-02-three-player-roster");
  await host.getByRole("button", { name: /Start game/ }).click();
  await host.waitForTimeout(2500);
  await shot(host, "white-03-game-started-host");
  for (let i = 0; i < players.length; i++) await shot(players[i], `white-04-game-started-player-${i + 1}`);
  const phones = [host, ...players];
  let stoleGift = false;
  let actions = 0;
  for (; actions < 15; actions++) {
    if (await host.getByText(/Game over!/).count()) break;
    let acted = false;
    for (const page of phones) {
      const steal = page.getByRole("button", { name: /Steal Gift #/ });
      const open = page.getByRole("button", { name: /Open Gift #/ });
      const keep = page.getByRole("button", { name: /Keep my gift/ });
      if (!stoleGift && await steal.count() && await steal.first().isEnabled()) {
        await steal.first().click();
        stoleGift = true;
        acted = true;
      } else if (await open.count() && await open.first().isEnabled()) {
        await open.first().click();
        acted = true;
      } else if (await keep.count() && await keep.first().isEnabled()) {
        await keep.first().click();
        acted = true;
      }
      if (acted) break;
    }
    if (!acted) throw new Error("White Elephant round deadlocked: no player has an enabled turn action");
    await host.waitForTimeout(1800);
  }
  await host.getByText(/Game over!/).waitFor({ timeout: 10000 });
  await shot(host, "white-05-game-complete");
  return { roomUrl, actions, stoleGift };
}

async function secretSanta() {
  const host = await phone("secret-host");
  await host.goto(`${base}/secret-santa`, { waitUntil: "networkidle" });
  await host.getByRole("button", { name: /Create an invite room/ }).click();
  await host.getByPlaceholder("Your name").fill("Sally Santa");
  await host.getByRole("button", { name: /Create room & invite people/ }).click();
  await host.waitForURL(/\/secret-santa\/room\//, { timeout: 20000 });
  const roomUrl = host.url();
  await shot(host, "secret-01-lobby-host");

  const players = [];
  for (const name of ["Rudy Red", "Carol Candle"]) {
    const page = await phone(`secret-${name}`);
    players.push(page);
    await page.goto(roomUrl, { waitUntil: "networkidle" });
    await page.getByPlaceholder("Your name").fill(name);
    await page.getByRole("button", { name: "Join" }).click();
    await page.waitForTimeout(1200);
  }
  await host.waitForTimeout(1800);
  await host.getByPlaceholder("Add someone without a phone").fill("Manny Manual");
  await host.getByRole("button", { name: "+ Add" }).click();
  await host.waitForTimeout(1800);
  await shot(host, "secret-02-roster-ready");
  await host.getByRole("button", { name: /Draw names/ }).click();
  await host.waitForTimeout(2200);
  await shot(host, "secret-03-draw-complete-host");

  const reveals = [];
  for (const [index, page] of [host, ...players].entries()) {
    await page.getByRole("button", { name: "Reveal my match" }).click();
    const modal = page.getByText(/is buying for/).locator("..");
    await modal.waitFor();
    reveals.push((await modal.innerText()).replace(/\s+/g, " ").trim());
    await shot(page, `secret-04-reveal-${index + 1}`);
    await page.getByRole("button", { name: "Hide assignment" }).click();
  }
  await host.getByRole("button", { name: "Reveal for Manny Manual" }).click();
  const manual = (await host.getByText(/is buying for/).locator("..").innerText()).replace(/\s+/g, " ").trim();
  await shot(host, "secret-05-manual-reveal");
  return { roomUrl, reveals, manual };
}

try {
  const white = await whiteElephant();
  const secret = await secretSanta();
  if (secret.reveals.some((value) => !value.includes("is buying for")) || !secret.manual.includes("is buying for")) {
    throw new Error("Secret Santa did not reveal every private assignment");
  }
  process.stdout.write(JSON.stringify({ white, secret }, null, 2));
} finally {
  await Promise.all(contexts.map((context) => context.close()));
  await browser.close();
}
