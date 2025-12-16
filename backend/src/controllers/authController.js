import { prisma } from "../config/db.js";
import bcrypt from 'bcryptjs';

const register = async (req, res) => {
    const {name, email, password} = req.body;

    const userExists = await prisma.user.findUnique({
        where: {email: email}
    })

    if(userExists) {
        return res.status(400)
        .json({error: "User already exists"})
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    })

    res.status(200).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }
    })
}

const login = async(req, res) => {
    res.json({message: "It works as well"})
}
export {register, login};