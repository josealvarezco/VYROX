import { LazyMotion, MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const features = () => import('./motionFeatures').then((module) => module.default)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* With "reduce motion" on, movement is skipped and only fades stay. */}
    <MotionConfig reducedMotion="user">
      <LazyMotion features={features} strict>
        <App />
      </LazyMotion>
    </MotionConfig>
  </StrictMode>,
)
