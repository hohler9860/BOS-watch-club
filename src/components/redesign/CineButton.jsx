/**
 * CineButton — reusable angled-octagon frame button
 *
 * Matches the .kk-discover button from redesign-kettlekids.css exactly:
 *   SVG path: M 12,1 L 208,1 L 219,12 L 219,36 L 208,47 L 12,47 L 1,36 L 1,12 Z
 *   viewBox:  0 0 220 48
 *   stroke:   currentColor, 1.5px, non-scaling-stroke, miter joins
 *   label:    ABC Marist, uppercase, letter-spacing 0.18em, 0.62rem
 *   hover:    label opacity 0.75
 *
 * Props:
 *   children / label  — button text (children takes priority)
 *   to                — if set, renders as a react-router <Link>
 *   onClick           — if set (and no `to`), renders as a <button>
 *   type              — "button" | "submit" | "reset" (default: "button")
 *   tone              — "dark" (default, black frame on white) | "light" (white frame on dark)
 *   fullWidth         — boolean; stretches button to 100% width
 *   disabled          — boolean; pass-through
 *   className         — additional class(es) appended to the root element
 *   style             — inline style override (e.g. { width: 260px, height: 52px })
 *   aria-*            — any aria-* props are forwarded
 */

import { Link } from 'react-router'
import s from './CineButton.module.css'

const FRAME_PATH = 'M 12,1 L 208,1 L 219,12 L 219,36 L 208,47 L 12,47 L 1,36 L 1,12 Z'

export default function CineButton({
  children,
  label,
  to,
  onClick,
  type = 'button',
  tone = 'dark',
  fullWidth = false,
  disabled = false,
  className = '',
  style,
  ...rest
}) {
  const text = children ?? label

  const classes = [
    s.btn,
    tone === 'light' ? s.light : s.dark,
    fullWidth ? s.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      <svg
        className={s.frame}
        viewBox="0 0 220 48"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={FRAME_PATH}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className={s.label}>{text}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} style={style} {...rest}>
        {inner}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      style={style}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {inner}
    </button>
  )
}
