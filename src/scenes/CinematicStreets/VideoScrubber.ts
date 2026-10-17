/** A latest-target queue: never start another seek while the decoder is busy. */
export class VideoScrubber {
  target = 0;
  settled = 0;
  ready = false;
  seeks = 0;
  maxSeekMs = 0;
  totalSeekMs = 0;
  private started = 0;
  private disposed = false;
  private video: HTMLVideoElement;
  private present: () => void;
  constructor(video: HTMLVideoElement, present: () => void) {
    this.video = video;
    this.present = present;
    video.addEventListener("loadeddata", this.loaded);
    video.addEventListener("seeked", this.done);
    if (video.readyState >= 2) this.loaded();
  }
  private loaded = () => {
    if (this.disposed) return;
    this.ready = true;
    this.settled = this.video.currentTime;
    this.present();
  };
  private done = () => {
    if (this.disposed) return;
    const elapsed = this.started ? performance.now() - this.started : 0;
    if (this.started) {
      this.seeks++;
      this.totalSeekMs += elapsed;
      this.maxSeekMs = Math.max(this.maxSeekMs, elapsed);
    }
    this.started = 0;
    this.settled = this.video.currentTime;
    this.ready = this.video.readyState >= 2;
    this.present();
  };
  request(time: number) {
    this.target = Number.isFinite(time) ? Math.max(0, time) : 0;
  }
  tick() {
    const v = this.video;
    if (
      this.disposed ||
      v.seeking ||
      v.readyState < 2 ||
      !Number.isFinite(v.duration) ||
      !v.seekable.length
    )
      return;
    const target = Math.max(
      v.seekable.start(0),
      Math.min(
        this.target,
        v.duration - 0.05,
        v.seekable.end(v.seekable.length - 1) - 0.01,
      ),
    );
    if (Math.abs(v.currentTime - target) < 1 / 48) return;
    this.started = performance.now();
    try {
      v.currentTime = target;
    } catch {
      this.started = 0;
    }
  }
  dispose() {
    this.disposed = true;
    this.video.removeEventListener("loadeddata", this.loaded);
    this.video.removeEventListener("seeked", this.done);
  }
}
