"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Props = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "default" | "danger" | "warning";
  disabled?: boolean;
};

export default function ActionButton({
  icon,
  label,
  onClick,
  variant = "default",
  disabled = false,
}: Props) {
  const [show, setShow] = useState(false);

  const colors = {
    default: "border-gray-300 hover:bg-gray-100",
    warning: "border-yellow-500 hover:bg-yellow-100",
    danger: "border-red-500 hover:bg-red-100 text-red-600",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {/* BUTTON */}
      <button
        onClick={onClick}
        disabled={disabled}
        tabIndex={0}
        className={`
          p-2 rounded-lg border transition
          ${colors[variant]}
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {icon}
      </button>

      {/* TOOLTIP */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 
              bg-black text-white text-xs px-2 py-1 rounded-md 
              whitespace-nowrap flex items-center gap-1 shadow-lg"
          >
            {icon}
            <span>{label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}