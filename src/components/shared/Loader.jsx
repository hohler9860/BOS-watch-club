// Centered BWC moonphase loading screen. APNG = true per-frame transparency
// (no box, no GIF ghosting) and animates in Safari. Fresh filename avoids the
// immutable-cache trap.
export default function Loader({ fading = false }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: '#ffffff',
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: 'opacity .45s ease',
      }}
    >
      <img src="/assets/bwc-loader-v10.png" alt="" aria-label="Loading" style={{ width: 120, height: 'auto' }} />
    </div>
  )
}
