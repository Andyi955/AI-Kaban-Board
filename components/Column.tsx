import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnType, Task } from '../types';
import TaskCard from './TaskCard';
import { clsx } from 'clsx';

interface ColumnProps {
  id: ColumnType;
  title: string;
  tasks: Task[];
  color: string;
  headerColor: string;
  onDelete: (id: string) => void;
  onBreakdown: (id: string) => void;
  generatingId: string | null;
  onToggleStep: (taskId: string, stepId: string) => void;
}

const Column: React.FC<ColumnProps> = ({ 
    id, 
    title, 
    tasks, 
    color, 
    headerColor,
    onDelete, 
    onBreakdown, 
    generatingId,
    onToggleStep
}) => {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      type: 'Column',
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex flex-col w-80 bg-slate-800/50 rounded-xl border-t-4 shadow-lg backdrop-blur-sm",
        color,
        "border-slate-800"
      )}
    >
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
        <h2 className={clsx("font-bold text-sm uppercase tracking-wider", headerColor)}>
          {title}
        </h2>
        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full font-mono">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto min-h-[150px] space-y-3">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
                key={task.id} 
                task={task} 
                onDelete={onDelete}
                onBreakdown={onBreakdown}
                isGenerating={generatingId === task.id}
                onToggleStep={onToggleStep}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg p-4 opacity-50">
                <span className="text-sm text-slate-500">Drop tasks here</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default Column;