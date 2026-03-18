import userRepository from '../repository/userRepository.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';

const login = async (email, password) => {

    try {
        const user = await userRepository.findbyEmail(email);

        if (!user) {
            throw new Error("usuario não encontrado");
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
            throw new Error("credenciais invalidas");
        }

        const token = generateToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department_id,
        });

        const userJson = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department_id,
            token
        };

        return userJson

    } catch (error) {
        console.error('Erro no service ao fazer login: ', error);
        throw error;
    }
}

export default {
    login
}