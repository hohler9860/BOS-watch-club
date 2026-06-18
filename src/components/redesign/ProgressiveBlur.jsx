/**
 * ProgressiveBlur — ported from MagicUI (no Tailwind / registry deps).
 *
 * Stacks several backdrop-filter blur layers, each masked to a band, so the
 * blur ramps smoothly from 0 at the inner edge to max at the outer edge.
 * Used as a fixed overlay at the bottom of the viewport on /redesign so each
 * watch rises out of a soft blur into focus as you scroll.
 *
 * Note: backdrop-filter is GPU-heavy — keep `height` modest and blur subtle.
 */
export default function ProgressiveBlur({
  position = 'bottom',
  height = '26%',
  blurLevels = [0.5, 1, 2, 4, 8, 16],
  zIndex = 400,
  style = {},
}) {
  const dir = position === 'bottom' ? 'to top' : 'to bottom'
  const n = blurLevels.length

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        [position]: 0,
        height,
        pointerEvents: 'none',
        zIndex,
        ...style,
      }}
    >
      {blurLevels.map((blur, i) => {
        // each layer reveals a moving band so the blur strength ramps
        const s0 = (i / n) * 100
        const s1 = ((i + 1) / n) * 100
        const s2 = Math.min(100, ((i + 2) / n) * 100)
        const mask = `linear-gradient(${dir}, rgba(0,0,0,0) ${s0}%, rgba(0,0,0,1) ${s1}%, rgba(0,0,0,1) ${s2}%, rgba(0,0,0,0) 100%)`
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
    </div>
  )
}
