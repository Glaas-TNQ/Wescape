import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { type NodeType } from './nodes';

interface NodeEditModalProps {
  nodeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const NodeEditModal: React.FC<NodeEditModalProps> = ({ nodeId, isOpen, onClose }) => {
  const { nodes, updateNode } = useCanvasStore();
  const [formData, setFormData] = useState<any>({});
  
  const node = nodeId ? nodes.find(n => n.id === nodeId) : null;

  useEffect(() => {
    if (node) {
      setFormData(node.data);
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSave = () => {
    updateNode(nodeId!, formData);
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const getFormFields = () => {
    switch (node.type as NodeType) {
      case 'destination':
        return (
          <>
            <FormField
              label="Titolo"
              value={formData.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Es. Roma, Parigi..."
            />
            <FormField
              label="Descrizione"
              value={formData.description || ''}
              onChange={(value) => handleChange('description', value)}
              placeholder="Descrizione della destinazione"
              multiline
            />
            <FormField
              label="Date"
              value={formData.date || ''}
              onChange={(value) => handleChange('date', value)}
              placeholder="15-18 Maggio 2024"
            />
            <FormField
              label="Località"
              value={formData.location || ''}
              onChange={(value) => handleChange('location', value)}
              placeholder="Roma, Italia"
            />
          </>
        );

      case 'activity':
        return (
          <>
            <FormField
              label="Titolo"
              value={formData.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Es. Colosseo, Tour guidato..."
            />
            <FormField
              label="Descrizione"
              value={formData.description || ''}
              onChange={(value) => handleChange('description', value)}
              placeholder="Dettagli dell'attività"
              multiline
            />
            <FormField
              label="Orario"
              value={formData.time || ''}
              onChange={(value) => handleChange('time', value)}
              placeholder="Giorno 1 • 09:00-12:00"
            />
            <FormField
              label="Durata"
              value={formData.duration || ''}
              onChange={(value) => handleChange('duration', value)}
              placeholder="3 ore"
            />
            <FormField
              label="Categoria"
              value={formData.category || ''}
              onChange={(value) => handleChange('category', value)}
              placeholder="Monumenti, Musei, Tour..."
            />
          </>
        );

      case 'restaurant':
        return (
          <>
            <FormField
              label="Nome Ristorante"
              value={formData.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Es. Trattoria Monti"
            />
            <FormField
              label="Descrizione"
              value={formData.description || ''}
              onChange={(value) => handleChange('description', value)}
              placeholder="Tipo di cucina e atmosfera"
              multiline
            />
            <FormField
              label="Orario"
              value={formData.time || ''}
              onChange={(value) => handleChange('time', value)}
              placeholder="Giorno 1 • 13:00"
            />
            <FormField
              label="Tipo Cucina"
              value={formData.cuisine || ''}
              onChange={(value) => handleChange('cuisine', value)}
              placeholder="Italiana, Romana, Fusion..."
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Fascia Prezzo"
                value={formData.priceRange || '€€'}
                onChange={(value) => handleChange('priceRange', value)}
                options={[
                  { value: '€', label: '€ - Economico' },
                  { value: '€€', label: '€€ - Medio' },
                  { value: '€€€', label: '€€€ - Caro' },
                  { value: '€€€€', label: '€€€€ - Lusso' },
                ]}
              />
              <FormField
                label="Rating"
                value={formData.rating || ''}
                onChange={(value) => handleChange('rating', parseFloat(value) || 0)}
                placeholder="4.5"
                type="number"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </>
        );

      case 'hotel':
        return (
          <>
            <FormField
              label="Nome Hotel"
              value={formData.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Es. Hotel Artemide"
            />
            <FormField
              label="Descrizione"
              value={formData.description || ''}
              onChange={(value) => handleChange('description', value)}
              placeholder="Servizi e posizione"
              multiline
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Check-in"
                value={formData.checkIn || ''}
                onChange={(value) => handleChange('checkIn', value)}
                placeholder="15 Maggio, 15:00"
              />
              <FormField
                label="Check-out"
                value={formData.checkOut || ''}
                onChange={(value) => handleChange('checkOut', value)}
                placeholder="18 Maggio, 11:00"
              />
            </div>
            <FormSelect
              label="Stelle"
              value={formData.stars || 3}
              onChange={(value) => handleChange('stars', parseInt(value))}
              options={[
                { value: 1, label: '⭐ 1 Stella' },
                { value: 2, label: '⭐⭐ 2 Stelle' },
                { value: 3, label: '⭐⭐⭐ 3 Stelle' },
                { value: 4, label: '⭐⭐⭐⭐ 4 Stelle' },
                { value: 5, label: '⭐⭐⭐⭐⭐ 5 Stelle' },
              ]}
            />
          </>
        );

      case 'transport':
        return (
          <>
            <FormField
              label="Nome Trasporto"
              value={formData.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Es. Metro Linea B"
            />
            <FormField
              label="Descrizione"
              value={formData.description || ''}
              onChange={(value) => handleChange('description', value)}
              placeholder="Dettagli del trasporto"
              multiline
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Partenza"
                value={formData.departure || ''}
                onChange={(value) => handleChange('departure', value)}
                placeholder="08:30 - Termini"
              />
              <FormField
                label="Arrivo"
                value={formData.arrival || ''}
                onChange={(value) => handleChange('arrival', value)}
                placeholder="08:35 - Colosseo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Tipo Trasporto"
                value={formData.type || 'car'}
                onChange={(value) => handleChange('type', value)}
                options={[
                  { value: 'car', label: '🚗 Auto' },
                  { value: 'train', label: '🚂 Treno' },
                  { value: 'plane', label: '✈️ Aereo' },
                  { value: 'bus', label: '🚌 Bus' },
                  { value: 'boat', label: '⛵ Nave' },
                  { value: 'other', label: '🚶 Altro' },
                ]}
              />
              <FormField
                label="Durata"
                value={formData.duration || ''}
                onChange={(value) => handleChange('duration', value)}
                placeholder="5 minuti"
              />
            </div>
          </>
        );

      case 'note':
        return (
          <>
            <FormField
              label="Titolo Nota"
              value={formData.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Es. Ricorda!"
            />
            <FormField
              label="Contenuto"
              value={formData.content || ''}
              onChange={(value) => handleChange('content', value)}
              placeholder="Scrivi le tue note qui..."
              multiline
              rows={4}
            />
            <FormSelect
              label="Colore"
              value={formData.color || 'yellow'}
              onChange={(value) => handleChange('color', value)}
              options={[
                { value: 'yellow', label: '🟡 Giallo' },
                { value: 'blue', label: '🔵 Blu' },
                { value: 'green', label: '🟢 Verde' },
                { value: 'pink', label: '🌸 Rosa' },
              ]}
            />
          </>
        );

      case 'dayDivider':
        return (
          <>
            <FormField
              label="Titolo Giorno"
              value={formData.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Es. Primo Giorno - Centro Storico"
            />
            <FormField
              label="Data"
              value={formData.date || ''}
              onChange={(value) => handleChange('date', value)}
              placeholder="15 Maggio 2024 • Mercoledì"
            />
            <FormField
              label="Numero Giorno"
              value={formData.day || 1}
              onChange={(value) => handleChange('day', parseInt(value) || 1)}
              type="number"
              min="1"
              max="30"
            />
          </>
        );

      default:
        return <div>Tipo nodo non supportato</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            Modifica {getNodeTypeLabel(node.type as NodeType)}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {getFormFields()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-4 border-t border-white/10 bg-gray-900/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors font-medium"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white font-medium transition-colors"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  type = 'text',
  ...props
}) => {
  const inputClassName = `w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition-all ${
    multiline ? 'resize-vertical min-h-[100px]' : ''
  }`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={inputClassName}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClassName}
          {...props}
        />
      )}
    </div>
  );
};

interface FormSelectProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
}

const FormSelect: React.FC<FormSelectProps> = ({ label, value, onChange, options }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition-all"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-gray-800">
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const getNodeTypeLabel = (type: NodeType): string => {
  const labels = {
    destination: 'Destinazione',
    activity: 'Attività',
    restaurant: 'Ristorante',
    hotel: 'Hotel',
    transport: 'Trasporto',
    note: 'Nota',
    dayDivider: 'Divisore Giorno',
  };
  return labels[type] || 'Nodo';
};

export default NodeEditModal;