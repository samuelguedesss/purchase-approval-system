import db from '../model/index.js'

const { User, Department } = db;

const findbyEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

const createUserRepo = async ({ name, email, password, role, department_id }) => {
  const user = await User.create({ name, email, password, role, department_id });
  return user;
};

const getAllUsersRepo = async () => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
    order: [['name', 'ASC']],
  });
  return users;
};

export default { findbyEmail, createUserRepo, getAllUsersRepo }
