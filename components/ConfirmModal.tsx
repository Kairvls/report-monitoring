"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
};

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  onCancel,
  onConfirm,
  confirmText = "Delete",
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white w-[420px] rounded-2xl shadow-2xl p-6"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* ICON */}
            <div className="flex justify-center mb-3">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-red-600" size={28} />
              </div>
            </div>

            {/* TITLE */}
            <h2 className="text-center text-lg font-bold text-gray-900">
              {title}
            </h2>

            {/* MESSAGE */}
            <p className="text-center text-sm text-gray-600 mt-2">
              {message}
            </p>

            {/* BUTTONS */}
            <div className="flex justify-center gap-3 mt-6">

              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                {confirmText}
              </button>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}