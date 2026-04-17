import { motion, AnimatePresence, type Variants } from 'motion/react'
import type { FC } from 'react'

import type { Category } from '../types'

import { CategoryCard } from './CategoryCard'

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
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
  categories: Category[]
  selectedCategoryId?: string
  onCategryCkick: (categoryId: string) => void
  children?: React.ReactNode
}

export const CategoriesList: FC<Props> = ({
  categories,
  onCategryCkick,
  selectedCategoryId,
  children,
}) => (
  <motion.div
    className="grid grid-cols-4 gap-2 pb-safe"
    initial="hidden"
    animate="show"
    variants={containerVariants}
  >
    <AnimatePresence>
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
