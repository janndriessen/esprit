import * as React from 'react'
import { motion } from 'framer-motion'

import './styles.css'

const sidebar = {
  open: () => ({
    right: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
      restDelta: 2,
    },
  }),
  closed: {
    right: '-400px',
    transition: {
      delay: 0.5,
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
}

const variants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
}

export const PaymentPopup = () => (
  <motion.div className="background shadow-xl" variants={sidebar}>
    <motion.ul variants={variants}>
      {itemIds.map((i) => (
        <div />
      ))}
    </motion.ul>
  </motion.div>
)

const itemIds = [0, 1, 2, 3, 4]
