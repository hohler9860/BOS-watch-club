/**
 * CineButton — the site's standard button on content pages.
 *
 * A clean hairline rectangle: 1px border, uppercase letterspaced label,
 * inverts to a solid fill on hover. (The angled-octagon frame this component
 * used to render read as game-UI, so it was retired everywhere except the
 * home page's own .kk-discover sections.)
 *
 * Props:
 *   children / label  — button text (children takes priority)
 *   to                — if set, renders as a react-router <Link>
 *   onClick           — if set (and no `to`), renders as a <button>
 *   type              — "button" | "submit" | "reset" (default: "button")
 *   tone              — "dark" (default, black on white pages) | "light" (white on dark)
 *   fullWidth         — boolean; centers the button in its container
 *   disabled          — boolean; pass-through
 *   className         — additional class(es) appended to the root element
 *   style             — inline style override
 *   aria-*            — any aria-* props are forwarded
 */

import { Link } from 'react-router'
import s from './CineButton.module.css'

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

  if (to) {
    return (
      <Link to={to} className={classes} style={style} {...rest}>
        {text}
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
      {text}
    </button>
  )
}
