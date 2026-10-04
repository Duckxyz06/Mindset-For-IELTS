import React, { useState } from "react";
import { pages, references, asset } from "../lib/data";
import { useT } from "../lib/context";
export default function SourceReader({
  numbers = [],
  initial,
  reference = false,
}) {
  const t = useT();
  const [selected, setSelected] = useState(initial || numbers[0]);
  const n = numbers.includes(selected) ? selected : numbers[0];
  const p = (reference ? references : pages)[n];
  const [text, setText] = useState(false);
  if (!p) return null;
  return (
    <section className="source-reader">
      <div className="row">
        <label>
          {t("source.page")}{" "}
          <select
            aria-label={t("source.page")}
            value={n}
            onChange={(e) => setSelected(Number(e.target.value))}
          >
            {numbers.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <button onClick={() => setText(!text)} aria-pressed={text}>
          {t("source.text")}
        </button>
        <a target="_blank" rel="noreferrer" href={asset(p.file)}>
          {t("common.expand")} ↗
        </a>
      </div>
      {text ? (
        <pre className="source-text" lang="en">
          {p.text}
        </pre>
      ) : (
        <img
          className="book-page"
          src={asset(p.file)}
          alt={t("source.page") + " " + n}
          loading="lazy"
        />
      )}
    </section>
  );
}
