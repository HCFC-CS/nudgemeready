import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { scheduleTaskReminder } from "../services/notifications";
import type { TaskClassification, TaskItem, TaskType } from "../types/models";

const TASKS_KEY = "do-enough-done:tasks";

const starterTasks: TaskItem[] = [
  {
    id: "starter-keys",
    title: "Check keys, wallet, phone",
    notes: "Location reminder concept for leaving home.",
    dueDate: "When leaving home",
    reminderAt: undefined,
    classification: "home",
    taskType: "reminder",
    durationMinutes: 2,
    usesTaskBuddy: false,
    workMinutes: 2,
    breakMinutes: 1,
    repeatRule: "daily",
    encouragementStyle: "calm",
    isCompleted: false,
    createdAt: new Date().toISOString()
  }
];

type TasksContextValue = ReturnType<typeof useProvideTasks>;

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

function useProvideTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TASKS_KEY)
      .then((raw) => {
        setTasks(raw ? JSON.parse(raw).map(normalizeTask) : starterTasks);
      })
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  }, [isReady, tasks]);

  const addTask = useCallback(async (task: Omit<TaskItem, "id" | "createdAt" | "isCompleted">) => {
    const newTask: TaskItem = {
      ...task,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      isCompleted: false
    };
    setTasks((current) => [newTask, ...current]);
    await scheduleTaskReminder(newTask);
    return newTask;
  }, []);

  const updateTask = useCallback(async (task: TaskItem) => {
    setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
    await scheduleTaskReminder(task);
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setTasks((current) =>
      current.map((item) => (item.id === taskId ? { ...item, isCompleted: true } : item))
    );
  }, []);

  const activeTasks = useMemo(() => tasks.filter((task) => !task.isCompleted), [tasks]);

  return {
    tasks,
    activeTasks,
    isReady,
    addTask,
    updateTask,
    completeTask
  };
}

function normalizeTask(task: TaskItem & { classification?: string; taskType?: string }): TaskItem {
  return {
    ...task,
    classification: normalizeClassification(task.classification, task.taskType),
    taskType: normalizeTaskType(task.taskType)
  };
}

function normalizeTaskType(taskType?: string): TaskType {
  if (
    taskType === "taskJob" ||
    taskType === "project" ||
    taskType === "reminder" ||
    taskType === "appointment" ||
    taskType === "event" ||
    taskType === "list" ||
    taskType === "alert" ||
    taskType === "occasion" ||
    taskType === "chore"
  ) {
    return taskType;
  }
  if (taskType === "task") {
    return "taskJob";
  }
  if (taskType === "shoppingList") {
    return "list";
  }
  return "taskJob";
}

function normalizeClassification(classification?: string, legacyTaskType?: string): TaskClassification {
  if (
    classification === "home" ||
    classification === "health" ||
    classification === "school" ||
    classification === "work" ||
    classification === "clubs"
  ) {
    return classification;
  }
  if (classification === "house" || classification === "family" || classification === "shopping") {
    return "home";
  }
  if (classification === "other") {
    return "clubs";
  }
  if (legacyTaskType === "health") {
    return "health";
  }
  if (legacyTaskType === "schoolWork") {
    return "school";
  }
  if (legacyTaskType === "workTask") {
    return "work";
  }
  if (legacyTaskType === "houseTask" || legacyTaskType === "housekeeping" || legacyTaskType === "chore") {
    return "home";
  }
  if (legacyTaskType === "shoppingList") {
    return "home";
  }
  return "clubs";
}

export function TasksProvider({ children }: PropsWithChildren) {
  return <TasksContext.Provider value={useProvideTasks()}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used inside TasksProvider");
  }
  return context;
}
