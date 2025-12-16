import React, { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
import { Plus, Layout, Sparkles, AlertCircle } from 'lucide-react';

import { Task, ColumnType, SubStep } from './types';
import { StorageService } from './services/storageService';
import { GeminiService } from './services/geminiService';
import Column from './components/Column';
import TaskCard from './components/TaskCard';
import NewTaskModal from './components/NewTaskModal';

// Initial Mock Data (if empty)
const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Set up project repository',
    description: 'Initialize Git, setup Vite and Tailwind',
    status: ColumnType.TODO,
    substeps: [],
    createdAt: Date.now()
  },
  {
    id: 't2',
    title: 'Design database schema',
    status: ColumnType.IN_PROGRESS,
    substeps: [
        { id: 's1', text: 'Define User table', completed: true },
        { id: 's2', text: 'Define Task table', completed: false }
    ],
    createdAt: Date.now() - 10000
  }
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatingTaskId, setGeneratingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load tasks on mount
  useEffect(() => {
    const loaded = StorageService.getTasks();
    if (loaded.length === 0) {
      setTasks(INITIAL_TASKS);
      StorageService.saveTasks(INITIAL_TASKS);
    } else {
      setTasks(loaded);
    }
  }, []);

  // Persist tasks whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      StorageService.saveTasks(tasks);
    }
  }, [tasks]);

  const handleAddTask = (title: string, description: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      status: ColumnType.TODO,
      substeps: [],
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleSubstep = (taskId: string, stepId: string) => {
    setTasks(prev => prev.map(task => {
        if (task.id !== taskId) return task;
        return {
            ...task,
            substeps: task.substeps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
        };
    }));
  };

  const handleAIBreakdown = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setGeneratingTaskId(taskId);
    setError(null);

    try {
      const steps = await GeminiService.generateSubsteps(task.title, task.description);
      
      const newSubsteps: SubStep[] = steps.map(text => ({
        id: crypto.randomUUID(),
        text,
        completed: false
      }));

      setTasks(prev => prev.map(t => {
        if (t.id !== taskId) return t;
        return {
            ...t,
            substeps: [...t.substeps, ...newSubsteps]
        };
      }));
    } catch (e) {
      console.error(e);
      setError("Failed to generate breakdown. Check API Key or try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setGeneratingTaskId(null);
    }
  };

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Dragging over another task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        
        // If different status, update active task status
        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          tasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(tasks, activeIndex, overIndex - 1); 
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Dragging over a column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newStatus = overId as ColumnType;

        if (tasks[activeIndex].status !== newStatus) {
            tasks[activeIndex].status = newStatus;
            return [...tasks]; // Trigger re-render to move to new list
        }
        return tasks;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              AI Kanban
            </h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 overflow-x-auto p-6">
        <div className="max-w-7xl mx-auto h-full">
            {error && (
                <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2 text-red-200">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 h-full min-w-[1024px]">
              <Column 
                id={ColumnType.TODO} 
                title="To Do" 
                tasks={tasks.filter(t => t.status === ColumnType.TODO)} 
                color="border-pink-500/50"
                headerColor="text-pink-400"
                onDelete={handleDeleteTask}
                onBreakdown={handleAIBreakdown}
                generatingId={generatingTaskId}
                onToggleStep={handleToggleSubstep}
              />
              <Column 
                id={ColumnType.IN_PROGRESS} 
                title="In Progress" 
                tasks={tasks.filter(t => t.status === ColumnType.IN_PROGRESS)} 
                color="border-blue-500/50"
                headerColor="text-blue-400"
                onDelete={handleDeleteTask}
                onBreakdown={handleAIBreakdown}
                generatingId={generatingTaskId}
                onToggleStep={handleToggleSubstep}
              />
              <Column 
                id={ColumnType.DONE} 
                title="Done" 
                tasks={tasks.filter(t => t.status === ColumnType.DONE)} 
                color="border-emerald-500/50"
                headerColor="text-emerald-400"
                onDelete={handleDeleteTask}
                onBreakdown={handleAIBreakdown}
                generatingId={generatingTaskId}
                onToggleStep={handleToggleSubstep}
              />
            </div>

            <DragOverlay>
              {activeId ? (
                <TaskCard 
                    task={tasks.find(t => t.id === activeId)!} 
                    isOverlay 
                    onDelete={() => {}} 
                    onBreakdown={() => {}}
                    isGenerating={false}
                    onToggleStep={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-slate-500 text-sm border-t border-slate-800">
        <p>Powered by Google Gemini 2.5 Flash</p>
      </footer>

      {isModalOpen && (
        <NewTaskModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddTask} 
        />
      )}
    </div>
  );
}