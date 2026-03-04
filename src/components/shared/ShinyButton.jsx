import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useMotionTemplate, animate } from 'framer-motion'
import styles from './ShinyButton.module.css'

const componentCache = new Map()

function getMotionComponent(component) {
  if (typeof component === 'string') return motion[component] || motion.button
  if (!componentCache.has(component)) {
    componentCache.set(component, motion.create(component))
  }
  return componentCache.get(component)
}

export default function ShinyButton({ children, className = '', component, as = 'button', ...props }) {
  const Component = component ? getMotionComponent(component) : getMotionComponent(as)
  const combinedClassName = `${styles.shinyButton} ${className}`.trim()

  const xValue = useMotionValue(100)
  const x = useMotionTemplate`${xValue}%`
  const controlsRef = useRef(null)

  useEffect(() => {
    function runAnimation() {
      controlsRef.current = animate(xValue, -100, {
        type: 'spring',
        stiffness: 20,
        damping: 15,
        mass: 2,
        onComplete: () => {
          xValue.set(100)
          setTimeout(runAnimation, 1000)
        },
      })
    }
    runAnimation()
    return () => {
      if (controlsRef.current) controlsRef.current.stop()
    }
  }, [xValue])

  return (
    <Component
      className={combinedClassName}
      style={{ '--x': x }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <span className={styles.text}>
        {children}
      </span>
      <span className={styles.shimmer} />
    </Component>
  )
}
