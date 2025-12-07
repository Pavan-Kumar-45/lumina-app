import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className = '', noHover = false, onClick, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
      className={twMerge(
        clsx(
          "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-sm",
          !noHover && "hover:shadow-lg hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300",
          className
        )
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;