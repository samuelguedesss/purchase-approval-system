import departmentRepository from '../repository/departmentRepository.js'

const createDepartmentService = async ({ name }) => {
    if (!name || !name.trim()) {
        throw new Error("Nome do departamento é obrigatório.");
    }

    const department = await departmentRepository.createDepartmentRepo({ name: name.trim() });
    return department;
}

const getAllDepartmentsService = async () => {
    const departments = await departmentRepository.getAllDepartmentsRepo();
    return departments;
}

export default { createDepartmentService, getAllDepartmentsService }
