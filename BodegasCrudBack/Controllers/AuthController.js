import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../Models/User.Model.js";

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "Datos Incorrectos" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Datos Incorrectos" });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, username : user.username },
      "65941f391decca7db1f2fa708f4efb5f74bd1576c6f836898e209ead253c1447",
      { expiresIn: "1h" }
    );

    res.json({ 
      token, 
      username: user.username, // Asumiendo que tienes este campo en tu modelo User
      role: user.role 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { login };
