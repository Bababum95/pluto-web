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
          className="flex min-h-dvh items-center justify-center bg-background fixed inset-0 z-100"
          animate="jump"
          transition={{
            staggerChildren: -0.2,
            staggerDirection: -1,
            duration: 0.6,
            delay: 0.3,
            ease: 'easeInOut',
          }}
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            exit={{ y: 300 }}
            transition={{ duration: 0.8, delay: 0.1 }}
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
