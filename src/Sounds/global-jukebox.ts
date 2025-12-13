import { Store } from "@/Store";
import { Jukebox } from "./jukebox";

const VOLUME_KEY = "musicVol";

class GlobalJukebox {
  private _jb: Jukebox | null = null;

  public get jb(): Jukebox {
    if (!this._jb) {
      this._jb = new Jukebox({ crossfadeSec: 2.0, fadeOutSec: 0.6 });
      const v = Store.retrieve(VOLUME_KEY);
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

  public getVolume(): number {
    return this.jb.getVolume();
  }

  public setVolume(v: number) {
    this.jb.setVolume(v);
    Store.persist(VOLUME_KEY, String(Math.max(0, Math.min(1, v))));
  }

  public restoreVolume() {
    const v = Store.retrieve(VOLUME_KEY) || "1.0";
    this.jb.setVolume(parseFloat(v));
  }

  public mute() {
    this.jb.setVolume(0);
  }
}

export const globalJukebox = new GlobalJukebox();
