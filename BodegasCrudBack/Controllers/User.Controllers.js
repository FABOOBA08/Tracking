import Usermodel from "../Models/User.Model.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import User from "../Models/User.Model.js";

const userController = {
  //NOTA Función para crear un nuevo usuario
  async createUser(req, res) {
    try {
      const { username, name, lastname, role, password } = req.body; //NOTA Extrae los datos del cuerpo de la solicitud

      //NOTA Verificar si el usuario ya existe en la base de datos
      const existingUser = await Usermodel.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      //NOTA Generar un hash de la contraseña utilizando bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      //NOTA Crear un nuevo usuario en la base de datos
      const newUser = await Usermodel.create({
        username,
        name,
        lastname,
        role,
        password: hashedPassword,
      });

      //NOTA Envía una respuesta con el nuevo usuario creado
      res.status(201).json(newUser);
    } catch (error) {
      //NOTA Manejar cualquier error y enviar una respuesta de error al cliente
      console.error("Error al crear un nuevo usuario:", error);
      res.status(500).json({ message: "Error al crear un nuevo usuario" });
    }
  },

  //NOTA Obtener todos los Usuarios
  async getAllUsers(req, res) {
    try {
      const { query } = req.query; 

      
      const whereCondition = query
      ? { name: { [Op.like]: `%${query}%` } } 
        : {};
      const users = await User.findAll({ where: whereCondition }); 
      res.json(users); 
    } catch (error) {
      console.error("Error al obtener todos los usuarios:", error);
      res.status(500).json({ message: "Error al obtener todos los usuarios" });
    }
  },

  //NOTA Función obtener info por ID de Usuario
  async getUserById(req, res) {
    try {
      //NOTA Obtener el ID del usuario de los parámetros de la solicitud
      const userId = req.params.id;

      //NOTA Buscar el usuario por su ID en la Base de datos
      const user = await Usermodel.findByPk(userId);

      //NOTA Si el usuario no se encuentra, enviar una respuesta de error
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      //NOTA Enviar una respuesta con la información del usuario
      res.json(user);
    } catch (error) {
      //NOTA Manejar cualquier error y enviar una respuesta de error al cliente
      console.error("Error al obtener información del usuario:", error);
      res
        .status(500)
        .json({ message: "Error al obtener información del usuario" });
    }
  },

  //NOTA Función para actualizar la información de un usuario por su ID
  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const { username, name, lastname, role, password } = req.body;

      const user = await Usermodel.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await user.update({
          username,
          name,
          lastname,
          role,
          password: passwordHash,
        });
      } else {
        await user.update({
          username,
          name,
          lastname,
          role,
        });
      }

      res.json(user);
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ message: "Error al actualizar el usuario" });
    }
  },

  //NOTA Función para eliminar un usuario por su ID
  async deleteUser(req, res) {
    try {
      const userId = req.params.id;

      const user = await Usermodel.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      await user.destroy();

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  },
};

export default userController;
