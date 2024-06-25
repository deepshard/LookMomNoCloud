import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect } from 'react'

interface AnimateModalProps {
    children: React.ReactNode
    show: boolean
    onClose?: () => void
}

const AnimateModal = ({children, show, onClose}: AnimateModalProps) => {
    useEffect(() => {
        const handleKeyUp = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            onClose && onClose();
          }
        };
        window.addEventListener("keyup", handleKeyUp);
        return () => window.removeEventListener("keyup", handleKeyUp);
      }, []);
  return (
    <AnimatePresence >
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='animate-modal '
        >
          <div className='flex absolute cursor-pointer h-[30px] w-[30px] bg-surface-main/5 rounded-full top-[20px] right-[20px] z-[9999] justify-center items-center text-surface-750'>
            {/* <h1>Esc</h1> */}
            <img src="/src/assets/icons/close.svg" alt="" className="h-3 fill-surface-500" onClick={onClose} />
          </div>
            {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimateModal