import { gsap } from "gsap";

export function createTweenScrubber(
  tween: gsap.core.Tween | gsap.core.Timeline,
  seekSpeed = 0.001
) {
  let mouseDown = false;
  let _cx = 0;

  function stop() {
    gsap.to(tween, { timeScale: 0, duration: 1 });
  }

  function resume() {
    gsap.to(tween, { timeScale: 1, duration: 1 });
  }

  function seek(dx: number) {
    const progress = tween.progress();
    const p = gsap.utils.clamp(0, 1, progress + dx * seekSpeed);
    tween.progress(p);
  }

  window.addEventListener("mousedown", (e) => {
    mouseDown = true;
    document.body.style.cursor = "ew-resize";
    _cx = e.clientX;
    stop();
  });

  window.addEventListener("mouseup", () => {
    mouseDown = false;
    document.body.style.cursor = "pointer";
    resume();
  });

  window.addEventListener("mousemove", (e) => {
    if (mouseDown) {
      const cx = e.clientX;
      const dx = cx - _cx;
      _cx = cx;
      seek(dx);
    }
  });

  window.addEventListener("touchstart", (e) => {
    _cx = e.touches[0].clientX;
    stop();
    e.preventDefault();
  });

  window.addEventListener("touchend", (e) => {
    resume();
    e.preventDefault();
  });

  window.addEventListener("touchmove", (e) => {
    const cx = e.touches[0].clientX;
    const dx = cx - _cx;
    _cx = cx;
    seek(dx);
    e.preventDefault();
  });
}
