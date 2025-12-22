import React from 'react';
import { Column as ColumnType } from '../types';
import ContactCard from './ContactCard';
import { Search, MoreHorizontal } from 'lucide-react';

interface ColumnProps {
  column: ColumnType;
  onDragStart: (cardId: string, sourceColId: string) => void;
  onContactClick: (contact: any) => void;
}

const Column: React.FC<ColumnProps> = ({ column, onDragStart, onContactClick }) => {
  const isFixa = column.id === 'fixa';

  const headerColor = isFixa ? 'bg-emerald-500' :
    column.id === 'leads' ? 'bg-[#00a884]' :
      column.id === 'negociando' ? 'bg-[#008f6f]' : 'bg-[#007f60]';

  return (
    <div className="min-w-[280px] w-[280px] flex flex-col h-full bg-[#EAEAEA] border-r border-gray-300/50 rounded-lg overflow-hidden shadow-sm">

      {/* Header */}
      <div className={`h-12 flex items-center justify-between px-3 text-white ${headerColor} shadow-sm flex-shrink-0`}>
        <div className="flex items-center space-x-2 overflow-hidden">
          {isFixa ? (
            <div className="flex items-center bg-white/20 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <span className="mr-1 font-bold">FIXA</span>
              <span className="bg-white text-emerald-600 px-1.5 rounded-full text-[10px] font-bold h-4 flex items-center justify-center">
                {column.count}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {column.count}
              </div>
              <span className="font-medium text-sm truncate uppercase tracking-wide">{column.title}</span>
            </div>
          )}

          {isFixa && <span className="text-sm font-medium ml-1">Conversas</span>}
        </div>

        <div className="flex items-center space-x-1 opacity-80 hover:opacity-100 transition-opacity">
          <Search size={16} className="cursor-pointer" />
          {!isFixa && <MoreHorizontal size={16} className="cursor-pointer" />}
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-[#EAEAEA]">
        {column.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic">
            <span>Nenhum contato</span>
          </div>
        ) : (
          column.items.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDragStart={() => onDragStart(contact.id, column.id)}
              onClick={onContactClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Column;