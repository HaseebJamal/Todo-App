import pool from "../config/db.js";

export const createUser = async (name, email, password) => {
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, profile_image, created_at
    `,
    [name, email, password],
  );

  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
      SELECT *
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    `
      SELECT id, name, email, profile_image, created_at, password
      FROM users
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

export const updateUserProfile = async (
  userId,
  name,
  email,
  profileImage = undefined,
) => {
  // const result = await pool.query(
  //   `
  //     UPDATE users
  //     SET name = $1,
  //         email = $2,
  //         profile_image = $3
  //     WHERE id = $4
  //     RETURNING id, name, email, profile_image, created_at
  //   `,
  //   [name, email, profileImage, userId],
  // );
  let query = `UPDATE users SET name=$1,email=$2`;
  const params = [name, email];
  let paramIndex = 3;
  if (profileImage !== undefined) {
    query += `,profile_image = $${paramIndex}`;
    params.push(profileImage);
    paramIndex++;
  }
  query += ` WHERE id = $${paramIndex} RETURNING id,name,email,profile_image,created_at`;
  params.push(userId);
  const result = await pool.query(query, params);
  // return result.rows[0]
  return result.rows[0] || null;
};

export const updateUserPassword = async (userId, password) => {
  const result = await pool.query(
    `
      UPDATE users
      SET password = $1
      WHERE id = $2
      RETURNING id
    `,
    [password, userId],
  );

  return result.rows[0];
};

export const deleteUserById = async (userId) => {
  const result = await pool.query(
    `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `,
    [userId],
  );

  return result.rows[0];
};
