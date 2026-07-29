"use client";

import { useEffect, useRef, useState } from "react";

import { formatTimer, getTimerDurationSeconds } from "@/lib/recipe/timer";

type TimerStatus = "idle" | "running" | "paused" | "done";

export function CookingTimer() {
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const endTime = useRef<number | null>(null);
  const originalTitle = useRef<string | null>(null);

  useEffect(() => {
    originalTitle.current = document.title;

    return () => {
      if (originalTitle.current !== null) {
        document.title = originalTitle.current;
      }
    };
  }, []);

  useEffect(() => {
    if (originalTitle.current === null) {
      return;
    }

    if (status === "running" || status === "paused") {
      document.title = `${formatTimer(remainingSeconds)} · ${originalTitle.current}`;
    } else if (status === "done") {
      document.title = `Timer done! · ${originalTitle.current}`;
    } else {
      document.title = originalTitle.current;
    }
  }, [remainingSeconds, status]);

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const interval = window.setInterval(() => {
      if (endTime.current === null) {
        return;
      }

      const nextRemaining = Math.max(
        0,
        Math.ceil((endTime.current - Date.now()) / 1000),
      );

      setRemainingSeconds(nextRemaining);

      if (nextRemaining === 0) {
        endTime.current = null;
        setStatus("done");
        navigator.vibrate?.([200, 100, 200]);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [status]);

  const configuredSeconds = getTimerDurationSeconds(minutes, seconds);
  const isActive = status !== "idle";

  function startTimer(duration: number) {
    if (duration <= 0) {
      return;
    }

    setRemainingSeconds(duration);
    endTime.current = Date.now() + duration * 1000;
    setStatus("running");
  }

  function addMinute() {
    if (status === "idle") {
      const nextDuration = configuredSeconds + 60;
      setMinutes(String(Math.floor(nextDuration / 60)));
      setSeconds(String(nextDuration % 60));
      return;
    }

    if (status === "done") {
      startTimer(60);
      return;
    }

    setRemainingSeconds((current) => current + 60);

    if (status === "running" && endTime.current !== null) {
      endTime.current += 60_000;
    }
  }

  return (
    <section
      className={`cooking-timer${status === "done" ? " is-done" : ""}`}
      aria-labelledby="cooking-timer-heading"
    >
      <div className="cooking-timer-heading">
        <div>
          <p>Kitchen timer</p>
          <h3 id="cooking-timer-heading">
            {status === "done" ? "Timer done!" : "Timer"}
          </h3>
        </div>

        {isActive && (
          <strong className="timer-countdown" aria-live="off">
            {formatTimer(remainingSeconds)}
          </strong>
        )}
      </div>

      <p className="sr-only" aria-live="assertive">
        {status === "done" ? "Timer done." : ""}
      </p>

      {status === "idle" ? (
        <div className="timer-setup">
          <label>
            <span>Minutes</span>
            <input
              type="number"
              min="0"
              max="999"
              inputMode="numeric"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </label>
          <span aria-hidden="true">:</span>
          <label>
            <span>Seconds</span>
            <input
              type="number"
              min="0"
              max="59"
              inputMode="numeric"
              value={seconds}
              onChange={(event) => setSeconds(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="button compact-button"
            disabled={configuredSeconds <= 0}
            onClick={() => startTimer(configuredSeconds)}
          >
            Start timer
          </button>
        </div>
      ) : (
        <div className="timer-actions">
          {status === "running" ? (
            <button
              type="button"
              className="timer-secondary-button"
              onClick={() => {
                if (endTime.current !== null) {
                  setRemainingSeconds(
                    Math.max(
                      0,
                      Math.ceil((endTime.current - Date.now()) / 1000),
                    ),
                  );
                }
                endTime.current = null;
                setStatus("paused");
              }}
            >
              Pause
            </button>
          ) : status === "paused" ? (
            <button
              type="button"
              className="button compact-button"
              onClick={() => startTimer(remainingSeconds)}
            >
              Resume
            </button>
          ) : null}

          <button
            type="button"
            className="timer-secondary-button"
            onClick={addMinute}
          >
            +1 minute
          </button>
          <button
            type="button"
            className="timer-secondary-button"
            onClick={() => {
              endTime.current = null;
              setRemainingSeconds(0);
              setStatus("idle");
            }}
          >
            Reset
          </button>
        </div>
      )}
    </section>
  );
}
