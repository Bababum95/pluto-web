import { motion, AnimatePresence } from 'motion/react'

import plutoImage from '@/assets/pluto.png'

type FullScreenLoaderProps = {
  isVisible: boolean
}

export function FullScreenLoader({ isVisible }: FullScreenLoaderProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="flex min-h-dvh items-center justify-center bg-background fixed inset-0 z-100"
          transition={{ duration: 0.5, ease: 'easeIn' }}
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            animate="jump"
            exit={{ y: 300 }}
            transition={{
              staggerChildren: -0.2,
              staggerDirection: -1,
              duration: 0.6,
              ease: 'easeIn',
            }}
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
