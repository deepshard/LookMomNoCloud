import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect } from 'react'
//@ts-ignore
import closeIcon from '../../assets/icons/close.svg'

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
          className='animate-modal'
        >
            <img src={closeIcon} alt="" className="absolute cursor-pointer p-[10px] top-[20px] right-[20px] z-[9999]" onClick={onClose} />
            {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimateModal