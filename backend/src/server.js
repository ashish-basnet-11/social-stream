import express from 'express'
import { config } from 'dotenv'
import { connectDB, disconnectDB } from './config/db.js';


//import routes
import postsRoutes from './routes/postsRoutes.js'

config();
connectDB();

const app = express();


// API Routes

app.use("/posts", postsRoutes)

const PORT = 5001

const server = app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
})

process.on("unhandledRejection", (err) => {
    console.error("unhandledRejection: ", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1)
    })
})

process.on("uncaughtException", async (err) => {
    console.error("uncaughtException: ", err);
    await disconnectDB();
    process.exit(1)
})

process.on("SIGTERM", (err) => {
    console.error("SIGTERM: ", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(0)
    })
})


