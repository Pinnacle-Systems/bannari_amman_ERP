import React from "react";
import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, children, widthClass }) => {
  if (!isOpen) return null;

  const modalElement = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className={`relative bg-white rounded-lg p-7 ${widthClass || ""}`}>
        {onClose && (
          <button
            type="button"
            className="absolute top-0 right-0 m-1 text-gray-600 hover:bg-red-500 hover:text-white rounded focus:outline-none z-10"
            onClick={onClose}
          >
            <svg
              className="h-6 w-6 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Close</title>
              <path
                d="M14.348 5.652a.999.999 0 00-1.414 0L10 8.586l-2.93-2.93a.999.999 0 10-1.414 1.414L8.586 10l-2.93 2.93a.999.999 0 101.414 1.414L10 11.414l2.93 2.93a.999.999 0 101.414-1.414L11.414 10l2.93-2.93a.999.999 0 000-1.414z"
                fillRule="evenodd"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalElement, document.body);
  }

  return modalElement;
};

export default Modal;
