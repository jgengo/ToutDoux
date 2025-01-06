"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const AddTaskForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (data) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: data.text,
          date: data.date,
          position: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create task");
      }

      reset();
      fetchTasks(); // Refresh tasks after adding
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setDeleteLoading(taskId);
      const response = await fetch(`/api/task/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete task");
      }

      fetchTasks(); // Refresh tasks after deletion
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="grid h-screen place-items-center gap-3">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-primary">Add New Task</h2>

        {error && (
          <div
            className="mb-4 rounded-md bg-red-100 p-3 text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(handleAddTask)} className="space-y-4">
          <div>
            <label
              htmlFor="text"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Task Description
            </label>
            <input
              id="text"
              type="text"
              {...register("text", {
                required: "Task description is required",
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isLoading}
              aria-invalid={errors.text ? "true" : "false"}
            />
            {errors.text && (
              <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Due Date
            </label>
            <input
              id="date"
              type="date"
              {...register("date", { required: "Due date is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isLoading}
              min={new Date().toISOString().split("T")[0]}
              aria-invalid={errors.date ? "true" : "false"}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Add task"
          >
            {isLoading ? "Adding..." : "Add Task"}
          </button>
        </form>

        <div className="mt-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">My Tasks</h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="text-gray-800">{task.text}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(task.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  disabled={deleteLoading === task._id}
                  className="ml-4 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Delete task ${task.text}`}
                >
                  {deleteLoading === task._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-gray-500">No tasks found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskForm;