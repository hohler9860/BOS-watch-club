// Centered BWC moonphase loading screen. The moonphase MP4 animates on its
// own; mix-blend-mode "lighten" drops its black background into the dark page
// so it reads as a seamless floating moonphase (no box, no ring).
export default function Loader({ fading = false }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: '#07090F',
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: 'opacity .45s ease',
      }}
    >
      <video
        src="/assets/bwc-loader.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Loading"
        style={{ width: 96, height: 'auto', mixBlendMode: 'lighten' }}
      />
    </div>
  )
}
