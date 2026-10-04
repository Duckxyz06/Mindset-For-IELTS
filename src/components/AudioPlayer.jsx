import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { audio, asset } from "../lib/data";
import { useT, clock, useApp } from "../lib/context";
const C = createContext();
export const useAudio = () => useContext(C);
export function AudioProvider({ children }) {
  const ref = useRef(null),
    t = useT(),
    { setToast } = useApp();
  const [track, setTrack] = useState(null),
    [playing, setPlaying] = useState(false),
    [time, setTime] = useState(0),
    [speed, setSpeed] = useState(1),
    [a, setA] = useState(null),
    [b, setB] = useState(null);
  const locked = useRef(new Set());
  const [examKey, setExamKey] = useState(null);
  const choose = (id, exam = null) => {
    if (exam && locked.current.has(exam)) return;
    const found = audio.find((x) => x.track === id || x.id === id);
    if (!found) {
      setToast(t("audio.missing"));
      return;
    }
    if (exam) {
      locked.current.add(exam);
      setExamKey(exam);
    } else setExamKey(null);
    setTrack(found);
    setA(null);
    setB(null);
    setTime(0);
    if (ref.current) {
      ref.current.src = asset(found.file);
      ref.current.playbackRate = speed;
      ref.current.play().catch(() => setToast(t("audio.failed")));
    }
  };
  const toggle = () => {
    const el = ref.current;
    if (!el || !track) return;
    if (examKey && el.paused) return;
    el.paused ? el.play().catch(() => setToast(t("audio.failed"))) : el.pause();
  };
  const seek = (v) => {
    if (!examKey && ref.current)
      ref.current.currentTime = Math.max(
        0,
        Math.min(ref.current.duration || Infinity, v),
      );
  };
  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed;
  }, [speed]);
  return (
    <C.Provider value={{ choose, track, locked }}>
      {children}
      <audio
        ref={ref}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => track && setToast(t("audio.failed"))}
        onTimeUpdate={() => {
          const x = ref.current;
          setTime(x.currentTime);
          if (!examKey && a !== null && b !== null && x.currentTime >= b)
            x.currentTime = a;
        }}
      />
      {track && (
        <section
          className="player"
          tabIndex={0}
          aria-label={t("audio.track") + " " + track.track}
          onKeyDown={(e) => {
            if (
              ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
                e.target.tagName,
              )
            )
              return;
            if (e.code === "Space") {
              e.preventDefault();
              toggle();
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              seek(time - 5);
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              seek(time + 5);
            }
          }}
        >
          <div>
            <strong>
              {t("audio.track")} {track.track}
            </strong>
            <small>
              {clock(time)} / {clock(track.durationSec)}
              {examKey && " · " + t("audio.onePlay")}
            </small>
          </div>
          <button
            aria-label={t(playing ? "audio.pause" : "audio.play")}
            onClick={toggle}
            disabled={!!examKey}
          >
            {playing ? "Ⅱ" : "▶"}
          </button>
          <button disabled={!!examKey} onClick={() => seek(time - 5)}>
            {t("audio.back")}
          </button>
          <input
            type="range"
            aria-label={t("audio.duration")}
            min="0"
            max={track.durationSec}
            step="0.1"
            value={time}
            disabled={!!examKey}
            onChange={(e) => seek(+e.target.value)}
          />
          <button disabled={!!examKey} onClick={() => seek(time + 5)}>
            {t("audio.forward")}
          </button>
          <select
            disabled={!!examKey}
            aria-label={t("audio.speed")}
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
          >
            {[0.75, 1, 1.25].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button disabled={!!examKey} onClick={() => setA(time)}>
            {t("audio.setA")}
            {a !== null && " " + clock(a)}
          </button>
          <button
            disabled={!!examKey}
            onClick={() => {
              if (a !== null && time > a) setB(time);
              else setToast(t("audio.loopInvalid"));
            }}
          >
            {t("audio.setB")}
            {b !== null && " " + clock(b)}
          </button>
          <button
            onClick={() => {
              setA(null);
              setB(null);
            }}
          >
            {t("audio.clearLoop")}
          </button>
        </section>
      )}
    </C.Provider>
  );
}
