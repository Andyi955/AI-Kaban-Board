import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Sparkles, Loader2, GripVertical, CheckSquare, Square } from 'lucide-react';
import { Task } from '../types';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onDelete: (id: string) => void;
  onBreakdown: (id: string) => void;
  isGenerating: boolean;
  onToggleStep: (taskId: string, stepId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
    task, 
    isOverlay, 
    onDelete, 
    onBreakdown, 
    isGenerating,
    onToggleStep
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-slate-800 p-4 rounded-lg border border-slate-600 h-[100px]"
      />
    );
  }

  const completedSteps = task.substeps.filter(s => s.completed).length;
  const totalSteps = task.substeps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group relative bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm hover:border-slate-500 transition-colors cursor-default",
        isOverlay ? "rotate-2 scale-105 cursor-grabbing shadow-2xl z-50 border-indigo-500" : ""
      )}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 right-2 p-1 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Header */}
      <div className="pr-6 mb-2">
        <h3 className="font-medium text-slate-100">{task.title}</h3>
      </div>
      
      {task.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Substeps Area */}
      {task.substeps.length > 0 && (
          <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{completedSteps}/{totalSteps}</span>
              </div>
              <ul className="space-y-1">
                  {task.substeps.map(step => (
                      <li key={step.id} 
                          className="flex items-start gap-2 text-xs group/item cursor-pointer hover:bg-slate-700/50 p-1 rounded transition-colors"
                          onClick={(e) => {
                              e.stopPropagation();
                              onToggleStep(task.id, step.id);
                          }}
                      >
                          {step.completed ? 
                            <CheckSquare className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> : 
                            <Square className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
                          }
                          <span className={clsx("transition-all", step.completed ? "text-slate-500 line-through" : "text-slate-300")}>
                            {step.text}
                          </span>
                      </li>
                  ))}
              </ul>
          </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
        <button
            onClick={(e) => {
                e.preventDefault();
                // Prevent drag click interference
                onBreakdown(task.id);
            }}
            disabled={isGenerating}
            className={clsx(
                "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-all border",
                task.substeps.length > 0 
                    ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-indigo-400 hover:border-indigo-400"
                    : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20",
                isGenerating && "opacity-70 cursor-wait"
            )}
        >
            {isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <Sparkles className="w-3 h-3" />
            )}
            {isGenerating ? 'Thinking...' : task.substeps.length > 0 ? 'Regenerate' : 'AI Breakdown'}
        </button>

        <button 
            onClick={() => onDelete(task.id)}
            className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-400/10 transition-colors"
        >
            <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;