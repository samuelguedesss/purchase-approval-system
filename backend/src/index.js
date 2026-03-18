import dotenv from "dotenv";
import app from "./app.js";
import db from "./model/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("🟢 Conectado ao banco de dados");

    await db.sequelize.sync(); // cria tabelas automaticamente
    console.log("📦 Tabelas sincronizadas");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("🔴 Erro ao iniciar servidor:", error);
    process.exit(1);
  }
};

startServer();
