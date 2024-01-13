import { ConnectKitButton } from 'connectkit'
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

const variantsItems = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
}

export const PaymentPopup = () => (
  <motion.div className="background shadow-xl p-8" variants={sidebar}>
    <motion.ul variants={variants}>
      <PayHeadline label="Pay 129.159 GHO" key={0} />
      <QRCode code={'0x0'} key={1} />
      <div className="mt-6">
        <Text label="To pay, scan the code inside the app" key={2} />
      </div>
      <div className="mt-16">
        <Text label="or..." key={3} />
      </div>
      <div className="flex flex-col items-center mt-8 w-full">
        <motion.li variants={variantsItems}>
          <ConnectKitButton />
        </motion.li>
      </div>
    </motion.ul>
  </motion.div>
)

export const PayHeadline = ({ label }: { label: string }) => {
  return (
    <motion.li variants={variantsItems}>
      <h2 className="font-bold text-4xl text-center mt-8">{label}</h2>
    </motion.li>
  )
}

/* eslint-disable @next/next/no-img-element */
export const QRCode = ({ code }: { code: string }) => {
  return (
    <motion.li variants={variantsItems}>
      <div className="bg-white rounded-xl p-8 mt-8">
        <img
          src="/assets/qr-code-temp.png"
          width={300}
          height={300}
          alt="GHO QR code"
        />
      </div>
    </motion.li>
  )
}

export const Text = ({ label }: { label: string }) => {
  return (
    <motion.li variants={variantsItems}>
      <p className="font-semibold text-3xl text-center">{label}</p>
    </motion.li>
  )
}
