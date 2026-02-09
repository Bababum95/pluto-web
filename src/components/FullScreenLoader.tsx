import { motion, AnimatePresence } from 'motion/react'

import plutoImage from '@/assets/pluto.png'
import type { FC } from 'react'

type Props = {
  isVisible: boolean
}

export const FullScreenLoader: FC<Props> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="flex min-h-dvh items-center justify-center bg-background"
          animate="jump"
          transition={{
            staggerChildren: -0.2,
            staggerDirection: -1,
            duration: 0.6,
            ease: 'easeInOut',
          }}
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 200 }}
        >
          <motion.img
            src={plutoImage}
            alt="Pluto"
            variants={{
              jump: {
                transform: 'translateY(-30px)',
                transition: {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                },
              },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
