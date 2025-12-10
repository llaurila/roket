/* eslint-disable @typescript-eslint/no-misused-promises */

import { enterMainMenu, MainMenuMode, setMainMenuMode } from "./Scenes/MainMenu";
import { globalJukebox } from "./Sounds/global-jukebox";
import menuThemeUrl from "./assets/menu.mp3";
import ambientThemeUrl from "./assets/ambient.mp3";
import chaseThemeUrl from "./assets/chase.mp3";
import focusThemeUrl from "./assets/focus.mp3";

function unlockOnFirstGesture() {
  const handler = async () => {
    try {
      await globalJukebox.unlock();
      globalJukebox.jb.select("menu");
      await globalJukebox.jb.play();
    } finally {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("touchstart", handler);
      setTimeout(() => {
        setMainMenuMode(MainMenuMode.Ready);
      }, 100);
    }
  };

  window.addEventListener("pointerdown", handler, { once: true });
  window.addEventListener("keydown", handler, { once: true });
  window.addEventListener("touchstart", handler, { once: true });
}

async function preloadMusic() {
  const { jb } = globalJukebox;

  jb.loop = true;

  await Promise.all([
    jb.add("menu", menuThemeUrl),
    jb.add("ambient", ambientThemeUrl),
    jb.add("chase", chaseThemeUrl),
    jb.add("focus", focusThemeUrl),
  ]);
}

enterMainMenu();

await preloadMusic();

setMainMenuMode(MainMenuMode.WaitingForGesture);
unlockOnFirstGesture();
