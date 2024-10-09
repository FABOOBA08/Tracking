import express from "express";
import cors from "cors";
import db from "./Database/db.js";
import bodegaRoutes from "./routes/Bodegas.routes.js";
import userRoutes from "./Routes/Users.routes.js";
import piezaRoutes from "./Routes/Piezas.routes.js";
import cajaRoutes from "./Routes/Cajas.routes.js";
import solicitudesRoutes from "./Routes/Solicitudes.routes.js";
import authRoutes from "./Routes/Auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/usuarios", userRoutes);
app.use("/bodegas", bodegaRoutes);
app.use("/piezas", piezaRoutes);
app.use("/cajas", cajaRoutes);
app.use("/solicitudes", solicitudesRoutes);
app.use("/login", authRoutes);

db.sequelize
  .sync()
  .then(() => {
    console.log("Conexión exitosa");
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error durante la conexión a la base de datos:", error);
  });
