'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141417] border border-[#242429] w-full max-w-md rounded-3xl p-6 relative shadow-2xl overflow-hidden">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Badge Icon */}
        <div className="flex items-center space-x-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isDanger ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-[#ff9f1c] border border-amber-500/20'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base text-white">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#242429] mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-[#18181b] text-xs font-bold transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded-full text-xs font-black transition-all shadow-md active:scale-95 ${
              isDanger
                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                : 'bg-[#ff9f1c] hover:bg-amber-400 text-black shadow-orange-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
