/* eslint-disable @typescript-eslint/no-misused-promises */

import { enterMainMenu, MainMenuMode, setMainMenuMode } from "./Scenes/MainMenu";
import { globalJukebox } from "./Sounds/global-jukebox";
import menuThemeUrl from "./assets/menu.mp3";
import failThemeUrl from "./assets/fail.mp3";
import ambientThemeUrl from "./assets/ambient.mp3";
import learningThemeUrl from "./assets/learning.mp3";
import chaseThemeUrl from "./assets/chase.mp3";
import focusThemeUrl from "./assets/focus.mp3";
import cruisingThemeUrl from "./assets/cruising.mp3";
import { Store } from "./Store";

function unlockOnFirstGesture() {
  const handler = async () => {
    try {
      await globalJukebox.unlock();

      if (Store.retrieve("playMusic") === "false") {
        globalJukebox.mute();
      }
      else {
        globalJukebox.restoreVolume();
      }

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
    jb.add("fail", failThemeUrl),
    jb.add("ambient", ambientThemeUrl),
    jb.add("learning", learningThemeUrl),
    jb.add("chase", chaseThemeUrl),
    jb.add("focus", focusThemeUrl),
    jb.add("cruising", cruisingThemeUrl)
  ]);
}

enterMainMenu();

await preloadMusic();

setMainMenuMode(MainMenuMode.WaitingForGesture);
unlockOnFirstGesture();
