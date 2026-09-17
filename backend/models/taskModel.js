import pool from "../config/db.js";

export const createTask = async (
  userId,
  title,
  description,
  priority,
  dueDate
) => {
  const result = await pool.query(
    `
      INSERT INTO tasks
        (user_id, title, description, priority, due_date)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        id,
        user_id,
        title,
        description,
        priority,
        due_date,
        status
    `,
    [userId, title, description, priority, dueDate]
  );

  return result.rows[0];
};

export const getTasksByUser = async (
  userId,
  search,
  status,
  priority,
  sort,
  limit,
  offset
) => {
  let query = `
    SELECT
      id,
      user_id,
      title,
      description,
      priority,
      due_date,
      status
    FROM tasks
    WHERE user_id = $1
  `;

  const values = [userId];
  let parameterIndex = 2;

  if (search) {
    query += `
      AND (
        title ILIKE $${parameterIndex}
        OR description ILIKE $${parameterIndex}
      )
    `;

    values.push(`%${search}%`);
    parameterIndex++;
  }

  if (status) {
    query += ` AND status = $${parameterIndex}`;
    values.push(status);
    parameterIndex++;
  }

  if (priority) {
    query += ` AND priority = $${parameterIndex}`;
    values.push(priority);
    parameterIndex++;
  }

  if (sort === "oldest") {
    query += ` ORDER BY id ASC`;
  } else if (sort === "due_date") {
    query += ` ORDER BY due_date ASC NULLS LAST`;
  } else if (sort === "priority") {
    query += `
      ORDER BY
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END ASC,
        id DESC
    `;
  } else {
    query += ` ORDER BY id DESC`;
  }

  query += `
    LIMIT $${parameterIndex}
    OFFSET $${parameterIndex + 1}
  `;

  values.push(limit, offset);

  const result = await pool.query(query, values);

  return result.rows;
};

export const countTasksByUser = async (
  userId,
  search,
  status,
  priority
) => {
  let query = `
    SELECT COUNT(*) AS total
    FROM tasks
    WHERE user_id = $1
  `;

  const values = [userId];
  let parameterIndex = 2;

  if (search) {
    query += `
      AND (
        title ILIKE $${parameterIndex}
        OR description ILIKE $${parameterIndex}
      )
    `;

    values.push(`%${search}%`);
    parameterIndex++;
  }

  if (status) {
    query += ` AND status = $${parameterIndex}`;
    values.push(status);
    parameterIndex++;
  }

  if (priority) {
    query += ` AND priority = $${parameterIndex}`;
    values.push(priority);
    parameterIndex++;
  }

  const result = await pool.query(query, values);

  return Number(result.rows[0].total);
};

export const getTaskById = async (taskId, userId) => {
  const result = await pool.query(
    `
      SELECT
        id,
        user_id,
        title,
        description,
        priority,
        due_date,
        status
      FROM tasks
      WHERE id = $1
        AND user_id = $2
    `,
    [taskId, userId]
  );

  return result.rows[0];
};

export const updateTask = async (
  taskId,
  userId,
  title,
  description,
  priority,
  dueDate,
  status
) => {
  const result = await pool.query(
    `
      UPDATE tasks
      SET
        title = $1,
        description = $2,
        priority = $3,
        due_date = $4,
        status = $5
      WHERE id = $6
        AND user_id = $7
      RETURNING
        id,
        user_id,
        title,
        description,
        priority,
        due_date,
        status
    `,
    [
      title,
      description,
      priority,
      dueDate,
      status,
      taskId,
      userId,
    ]
  );

  return result.rows[0];
};

export const deleteTask = async (taskId, userId) => {
  const result = await pool.query(
    `
      DELETE FROM tasks
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [taskId, userId]
  );

  return result.rows[0];
};