import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  className = '',
  placeholder = 'Click to edit',
  maxLength = 100,
  isEditing: controlledEditing,
  onEditingChange,
}) => {
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark);
  
  const isEditing = controlledEditing !== undefined ? controlledEditing : isEditingLocal;

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (controlledEditing === undefined) {
      setIsEditingLocal(true);
    } else {
      onEditingChange?.(true);
    }
  };

  const handleSave = () => {
    if (tempValue.trim() !== value.trim() && tempValue.trim()) {
      onSave(tempValue.trim());
    }
    if (controlledEditing === undefined) {
      setIsEditingLocal(false);
    } else {
      onEditingChange?.(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    if (controlledEditing === undefined) {
      setIsEditingLocal(false);
    } else {
      onEditingChange?.(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        maxLength={maxLength}
        className={`bg-transparent border rounded px-2 py-1 outline-none ${className}`}
        style={{
          borderColor: themeColors.border.secondary,
          color: themeColors.text.primary,
        }}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={handleStartEdit}
      className={`cursor-pointer hover:opacity-75 transition-opacity ${className}`}
      style={{ color: themeColors.text.primary }}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  );
};

export default EditableText;