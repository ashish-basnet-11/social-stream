import express, { urlencoded } from 'express'
import { config } from 'dotenv'
import { connectDB, disconnectDB } from './config/db.js';
import cookieParser from 'cookie-parser';


//import routes
import postsRoutes from './routes/postsRoutes.js'
import authRoutes from './routes/authRoutes.js'

config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


// API Routes

app.use("/posts", postsRoutes)
app.use("/auth", authRoutes)


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


