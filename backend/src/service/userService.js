import bcrypt from 'bcrypt';
import userRepository from '../repository/userRepository.js'

const createUserService = async ({ name, email, password, role, department_id }) => {
    if (!name || !email || !password || !role) {
        throw new Error("Todos os campos obrigatórios devem ser preenchidos.");
    }

    const existingUser = await userRepository.findbyEmail(email);
    if (existingUser) {
        throw new Error("Já existe um usuário com este e-mail.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.createUserRepo({
        name,
        email,
        password: hashedPassword,
        role,
        department_id: department_id || null,
    });

    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
}

const getAllUsersService = async () => {
    const users = await userRepository.getAllUsersRepo();
    return users;
}

export default { createUserService, getAllUsersService }
