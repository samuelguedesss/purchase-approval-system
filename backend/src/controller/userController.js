import userService from '../service/userService.js'

const createUser = async (req, res) => {
    try {
        const { name, email, password, role, department_id } = req.body;
        const user = await userService.createUserService({ name, email, password, role, department_id });
        return res.status(201).json(user);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsersService();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export default { createUser, getUsers }
