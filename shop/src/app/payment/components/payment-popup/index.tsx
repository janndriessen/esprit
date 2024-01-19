import { ConnectKitButton } from 'connectkit'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

import { useCreatePayment, useTrackPayment } from './providers'

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

export const PaymentPopup = () => {
  const { amount, amountUsd, data, paymentId } = useCreatePayment()
  const { isWaiting, transactionHash } = useTrackPayment(paymentId)

  const txText = isWaiting
    ? 'Receiving payment. Waiting for transaction to complete.'
    : 'The payment was successful. 👻'

  return (
    <motion.div className="background shadow-xl p-8" variants={sidebar}>
      {!isWaiting && !transactionHash && (
        <motion.ul variants={variants}>
          <PayHeadline
            label={`Pay ${amount.toFixed(3)} GHO`}
            subtitle={`$${amountUsd}`}
            key={0}
          />
          <QRCode url={data ?? ''} key={1} />
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
      )}
      {(isWaiting || transactionHash !== null) && (
        <div>
          <TextTransaction label={txText} hash={transactionHash} />
        </div>
      )}
    </motion.div>
  )
}

/* Components */

export const PayHeadline = ({
  label,
  subtitle,
}: {
  label: string
  subtitle: string
}) => {
  return (
    <motion.li variants={variantsItems}>
      <div className="mt-8">
        {/* <p className="font-semibold text-xl text-left">{subtitle}</p> */}
        <h2 className="font-bold text-4xl text-center">{label}</h2>
      </div>
    </motion.li>
  )
}

/* eslint-disable @next/next/no-img-element */
export const QRCode = ({ url }: { url: string }) => {
  return (
    <motion.li variants={variantsItems}>
      <div className="bg-white rounded-xl p-8 mt-8">
        <img src={url} width={300} height={300} alt="GHO QR code" />
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

export function shortenAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4,
): string {
  if (address.length < startLength + endLength) {
    throw new Error('Address is too short to be shortened.')
  }
  const shortenedStart = address.substring(0, startLength)
  const shortenedEnd = address.substring(address.length - endLength)
  return `${shortenedStart}...${shortenedEnd}`
}

export const TextTransaction = ({
  label,
  hash,
}: {
  label: string
  hash: string | null
}) => {
  return (
    <div className="flex flex-col mt-20 items-center">
      <p className="font-semibold text-3xl text-center">{label}</p>
      {!hash && <LoadingSpinner size={48} className="mt-8" />}
      {hash && (
        <div className="grid place-items-center w-full mt-8">
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            className="underline"
          >
            {shortenAddress(hash)}
          </a>
        </div>
      )}
    </div>
  )
}

// Copied from: https://github.com/shadcn-ui/ui/discussions/1694#discussioncomment-7851248
export interface ISVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

export const LoadingSpinner = ({
  size = 24,
  className,
  ...props
}: ISVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
