// Centered BWC moonphase loading screen with a spinning steel ring.
// Used as the route-transition overlay (RouteLoader) and the Suspense fallback.
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
      <div style={{ position: 'relative', width: 116, height: 116, display: 'grid', placeItems: 'center' }}>
        <img src="/assets/bwc-loader.png" alt="" style={{ width: 78, height: 'auto' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(184,196,212,0.14)',
            borderTopColor: '#B8C4D4',
            animation: 'bwcspin 1s linear infinite',
          }}
        />
      </div>
      <style>{`@keyframes bwcspin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
