import authService from '../service/authService.js'

const login = async (req, res) => {

    const { email, password } = req.body

    try {
        const token = await authService.login(email, password);
        res.status(201).json( token );

    } catch (error) {
        const status = error.message.includes('senha') || error.message.includes('Usuário') ? 401 : 500;
        res.status(status).json({ message: error.message });
    }
}

export default { login }