import "dotenv/config";
import { createApp } from "./app.js";
import { disconnectDb } from "./config/db.js";

const PORT = process.env.PORT || 4000;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log("\n💈  Manhattan Barbershop — API de Caja");
  console.log(`🚀  Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🩺  Health check:        http://localhost:${PORT}/api/health\n`);
});

// Cierre limpio (Ctrl+C, kill, etc.)
async function apagar(senal) {
  console.log(`\n${senal} recibido. Cerrando servidor...`);
  server.close(async () => {
    await disconnectDb();
    console.log("✅ Conexiones cerradas. Hasta luego.");
    process.exit(0);
  });
}

process.on("SIGINT", () => apagar("SIGINT"));
process.on("SIGTERM", () => apagar("SIGTERM"));
