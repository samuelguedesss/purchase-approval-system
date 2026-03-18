// models/index.js
import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import sequelize from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};

// Carrega todos os arquivos .js (models)
const files = readdirSync(__dirname).filter(
  (file) => file !== "index.js" && file.endsWith(".js")
);

for (const file of files) {
  const modelPath = pathToFileURL(path.join(__dirname, file)).href;
  const ModelClass = (await import(modelPath)).default;

  // Inicializa o model
  const modelInstance = ModelClass.init(sequelize);

  // Salva o model já inicializado no objeto db
  db[ModelClass.name] = modelInstance;
}

// Criar Associações
Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

// Exportar Sequelize + Models
db.sequelize = sequelize;

export default db;
