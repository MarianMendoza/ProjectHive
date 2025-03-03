import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  buttonText: string;
  buttonStyles: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  isDisabled,
  buttonText,
  buttonStyles,
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg ${buttonStyles}`}
      disabled={isDisabled}
    >
      {buttonText}
    </button>
  );
};

export default ActionButton;
