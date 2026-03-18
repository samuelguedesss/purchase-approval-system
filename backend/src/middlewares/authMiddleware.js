import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica se o header está presente e começa com "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ✅ decoded é criado AQUI
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ padroniza: controller usa req.user
    req.user = {
      id: decoded.id,
      role: decoded.role,
      department_id: decoded.department,
    };

    next();
  } catch (err) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
};

export default authMiddleware;
