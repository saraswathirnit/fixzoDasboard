import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ArrowUpDown } from 'lucide-react';
import { Column, Workshop } from '../types';

interface DraggableHeaderProps {
  column: Column;
  index: number;
  onSort: (key: keyof Workshop) => void;
}

export const DraggableHeader: React.FC<DraggableHeaderProps> = ({ column, index, onSort }) => (
  <Draggable draggableId={column.id} index={index}>
    {(provided) => (
      <th
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-move hover:bg-gray-100"
        onClick={() => onSort(column.id)}
      >
        <div className="flex items-center space-x-1">
          <span>{column.label}</span>
          <ArrowUpDown className="h-4 w-4" />
        </div>
      </th>
    )}
  </Draggable>
);