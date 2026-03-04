import { motion } from 'framer-motion'
import styles from './ShinyButton.module.css'

const animationProps = {
  initial: { '--x': '100%', scale: 0.8 },
  animate: { '--x': '-100%', scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: 'loop',
    repeatDelay: 1,
    type: 'spring',
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: 'spring',
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
}

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

  return (
    <Component
      {...animationProps}
      className={combinedClassName}
      {...props}
    >
      <span className={styles.text}>
        {children}
      </span>
      <span className={styles.shimmer} />
    </Component>
  )
}
