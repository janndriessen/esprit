import { motion } from 'framer-motion'
import Image from 'next/image'

import { PrimaryButton } from '@/components/ui/button'

type GhoButtonProps = {
  onClick: () => void
}

export function GhoButton({ onClick }: GhoButtonProps) {
  return (
    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
      <PrimaryButton
        size={'lg'}
        onClick={onClick}
        className="w-[346px] h-[65px]"
      >
        <div className="flex items-center gap-2">
          <Image
            src="/assets/icon-light.svg"
            width={36}
            height={36}
            alt="GHO icon"
          />
          <p>Pay with GHO</p>
        </div>
      </PrimaryButton>
    </motion.button>
  )
}
