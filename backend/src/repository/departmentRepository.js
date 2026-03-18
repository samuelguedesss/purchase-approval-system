import db from '../model/index.js'

const { Department } = db;

const createDepartmentRepo = async ({ name }) => {
    const department = await Department.create({ name });
    return department;
}

const getAllDepartmentsRepo = async () => {
    const departments = await Department.findAll({ order: [['name', 'ASC']] });
    return departments;
}

export default { createDepartmentRepo, getAllDepartmentsRepo }
