import { Jukebox } from "./jukebox";

class GlobalJukebox {
  private _jb: Jukebox | null = null;

  public get jb(): Jukebox {
    if (!this._jb) {
      this._jb = new Jukebox({ crossfadeSec: 2.0, fadeOutSec: 0.6 });
      const v = localStorage.getItem("musicVol");
      if (v) this._jb.setVolume(parseFloat(v));
    }
    return this._jb;
  }

  public get loop(): boolean {
    return this.jb.loop;
  }

  public set loop(value: boolean) {
    this.jb.loop = value;
  }

  /** call once from a user gesture (click/tap/keydown) */
  public async unlock() {
    await this.jb.resumeContext();
  }

  public setVolume(v: number) {
    this.jb.setVolume(v);
    localStorage.setItem("musicVol", String(Math.max(0, Math.min(1, v))));
  }
}

export const globalJukebox = new GlobalJukebox();
