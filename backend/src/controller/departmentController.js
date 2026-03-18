import departmentService from '../service/departmentService.js'

const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        const department = await departmentService.createDepartmentService({ name });
        return res.status(201).json(department);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

const getDepartments = async (req, res) => {
    try {
        const departments = await departmentService.getAllDepartmentsService();
        return res.status(200).json(departments);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export default { createDepartment, getDepartments }
