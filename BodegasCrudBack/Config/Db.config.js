const dbConfig = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "root",
    DB: "Proyect_Icee",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

export default dbConfig;