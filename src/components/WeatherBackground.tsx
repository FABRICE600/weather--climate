import { useMemo } from "react";
import type { WeatherScene } from "@/lib/weatherScene";

interface WeatherBackgroundProps {
  scene: WeatherScene;
}

// Renders the full-page animated background that matches the current weather
// scene: gradient, decorative blobs, sun glow, star field, rain streaks, snow
// flakes, and lightning flashes. All purely decorative (aria-hidden).
export default function WeatherBackground({ scene }: WeatherBackgroundProps) {
  // Pre-generate stable random positions for stars / rain / snow so they
  // don't reshuffle on every render.
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 70,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
      })),
    [scene.id]
  );

  const raindrops = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.5 + Math.random() * 0.6,
        opacity: 0.3 + Math.random() * 0.4,
      })),
    [scene.id]
  );

  const snowflakes = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 4,
        size: 2 + Math.random() * 4,
      })),
    [scene.id]
  );

  return (
    <>
      {/* Base gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${scene.bgGradient} transition-all duration-1000`}
        aria-hidden="true"
      />

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className={`absolute -left-24 -top-24 h-96 w-96 rounded-full ${scene.blob1} blur-3xl`} />
        <div className={`absolute -right-24 top-1/3 h-96 w-96 rounded-full ${scene.blob2} blur-3xl`} />
        <div className={`absolute bottom-0 left-1/3 h-72 w-72 rounded-full ${scene.blob3} blur-3xl`} />
      </div>

      {/* Sun glow */}
      {scene.hasSun && (
        <div className="pointer-events-none absolute right-10 top-10 h-40 w-40" aria-hidden="true">
          <div className="absolute inset-0 animate-pulse rounded-full bg-amber-200/20 blur-2xl" />
          <div className="absolute inset-4 rounded-full bg-amber-100/15 blur-xl" />
        </div>
      )}

      {/* Star field */}
      {scene.hasStars && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {stars.map((s) => (
            <div
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: 0.4 + Math.random() * 0.5,
                animation: `twinkle 3s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Rain */}
      {scene.hasRain && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {raindrops.map((r) => (
            <div
              key={r.id}
              className="absolute top-0 w-0.5 bg-gradient-to-b from-sky-200/0 via-sky-200/50 to-sky-200/70"
              style={{
                left: `${r.left}%`,
                height: "50px",
                opacity: r.opacity,
                animation: `rainfall ${r.duration}s linear ${r.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Snow */}
      {scene.hasSnow && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {snowflakes.map((s) => (
            <div
              key={s.id}
              className="absolute top-0 rounded-full bg-white"
              style={{
                left: `${s.left}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: 0.6,
                animation: `snowfall ${s.duration}s linear ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Lightning flashes */}
      {scene.hasLightning && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 bg-white"
            style={{ animation: "lightning 7s ease-in-out 2s infinite", opacity: 0 }}
          />
        </div>
      )}
    </>
  );
}
