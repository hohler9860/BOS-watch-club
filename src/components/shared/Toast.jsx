import { useState, useEffect, useCallback } from 'react'
import s from './Toast.module.css'

let showToastFn = null

export function toast(message) {
  if (showToastFn) showToastFn(message)
}

export default function ToastContainer() {
  const [items, setItems] = useState([])

  const show = useCallback((message) => {
    const id = Date.now()
    setItems((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    showToastFn = show
    return () => { showToastFn = null }
  }, [show])

  if (items.length === 0) return null

  return (
    <div className={s.container}>
      {items.map((item) => (
        <div key={item.id} className={s.toast}>
          {item.message}
        </div>
      ))}
    </div>
  )
}
