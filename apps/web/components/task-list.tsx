"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthClient } from "@convex-dev/better-auth/react";
import { useState } from "react";
import { Button, Card, Input } from "@jn789t0cfcgadt5aq7yyv69ab17skn1r/components";
import { Plus, CheckCircle2, Circle, Trash2, LogOut } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export function TaskList() {
  const { data: session } = useAuthClient();
  const tasks = useQuery(api.endpoints.tasks.list);
  const stats = useQuery(api.endpoints.dashboard.taskStats);
  const createTask = useMutation(api.endpoints.tasks.create);
  const completeTask = useMutation(api.endpoints.tasks.complete);
  const deleteTask = useMutation(api.endpoints.tasks.remove);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showNewTask, setShowNewTask] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await createTask({ title: newTaskTitle });
      setNewTaskTitle("");
      setShowNewTask(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleToggleComplete = async (taskId: Id<"tasks">) => {
    try {
      await completeTask({ id: taskId });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    try {
      await deleteTask({ id: taskId });
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Task Manager</h1>
          <p className="text-gray-600 mb-6">Please sign in to manage your tasks.</p>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
            <p className="text-gray-600 mt-1">Welcome back!</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600">In Progress</div>
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </Card>
          </div>
        )}

        <Button onClick={() => setShowNewTask(!showNewTask)} className="mb-6">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>

        {showNewTask && (
          <Card className="p-4 mb-6">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                required
              />
              <div className="flex gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowNewTask(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="space-y-3">
          {!tasks && <Card className="p-8 text-center"><p>Loading...</p></Card>}
          {tasks && tasks.length === 0 && (
            <Card className="p-8 text-center"><p>No tasks yet. Create one to get started!</p></Card>
          )}
          {tasks?.map((task) => (
            <Card key={task._id} className="p-4">
              <div className="flex items-start gap-4">
                <button onClick={() => handleToggleComplete(task._id)} className="mt-1">
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className={task.status === "completed" ? "line-through text-gray-500" : "text-gray-900"}>
                    {task.title}
                  </h3>
                </div>
                <Button onClick={() => handleDeleteTask(task._id)} variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
