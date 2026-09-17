import {
  createTask,
  getTasksByUser,
  countTasksByUser,
  getTaskById,
  updateTask,
  deleteTask,
} from "../models/taskModel.js";

const allowedStatuses = [
  "pending",
  "completed",
  "cancelled",
];

const allowedPriorities = [
  "low",
  "medium",
  "high",
  "urgent",
];

const allowedSorts = [
  "newest",
  "oldest",
  "due_date",
  "priority",
];

export const addTask = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      title,
      description,
      priority,
      dueDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    const task = await createTask(
      userId,
      title.trim(),
      description || "",
      priority,
      dueDate || null
    );

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Add task error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      search = "",
      status = "",
      priority = "",
      sort = "newest",
    } = req.query;

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      100
    );

    const offset = (page - 1) * limit;

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    if (
      priority &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    if (!allowedSorts.includes(sort)) {
      return res.status(400).json({
        message: "Invalid sort option",
      });
    }

    const tasks = await getTasksByUser(
      userId,
      search,
      status,
      priority,
      sort,
      limit,
      offset
    );

    const total = await countTasksByUser(
      userId,
      search,
      status,
      priority
    );

    const totalPages = Math.ceil(total / limit);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getSingleTask = async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = req.params.id;

    const task = await getTaskById(
      taskId,
      userId
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({ task });
  } catch (error) {
    console.error("Get single task error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const editTask = async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = req.params.id;

    const {
      title,
      description,
      priority,
      dueDate,
      status,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const task = await updateTask(
      taskId,
      userId,
      title.trim(),
      description || "",
      priority,
      dueDate || null,
      status
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Edit task error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const removeTask = async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = req.params.id;

    const task = await deleteTask(
      taskId,
      userId
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};