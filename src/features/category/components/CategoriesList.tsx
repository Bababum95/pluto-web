import { motion, AnimatePresence, type Variants } from 'motion/react'
import { useState, type FC } from 'react'

import type { CategoryDto } from '../types'

import { CategoryCard } from './CategoryCard'

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
}

type Props = {
  categories: CategoryDto[]
  selectedCategoryId?: string
  onCategryCkick: (categoryId: string) => void
  children?: React.ReactNode
  /** When true, render at `animate` state without entrance motion (motion.dev: initial={false}). */
  skipEntranceAnimation?: boolean
}

export const CategoriesList: FC<Props> = ({
  categories,
  onCategryCkick,
  selectedCategoryId,
  children,
  skipEntranceAnimation = false,
}) => {
  const [skipEntranceOnThisInstance] = useState(() => skipEntranceAnimation)

  return (
    <motion.div
      className="grid grid-cols-4 gap-2"
      initial={skipEntranceOnThisInstance ? false : 'hidden'}
      animate="show"
      variants={containerVariants}
    >
      <AnimatePresence initial={!skipEntranceOnThisInstance}>
        {categories.map((category) => (
          <motion.div
            key={category.id}
            variants={itemVariants}
            onClick={() => onCategryCkick(category.id)}
          >
            <CategoryCard
              category={category}
              style={{
                backgroundColor:
                  category.id === selectedCategoryId
                    ? category.color
                    : 'transparent',
              }}
            />
          </motion.div>
        ))}
        {children && (
          <motion.div variants={itemVariants} className="w-full flex">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
