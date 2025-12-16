import { prisma } from "../config/db.js";
import bcrypt from 'bcryptjs';
import generateToken from "../utils/generateToken.js";

const register = async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({
        where: { email: email }
    })

    if (userExists) {
        return res.status(400)
            .json({ error: "User already exists" })
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

    const token = generateToken(user.id, res);


    res.status(201).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                name: name,
                email: email
            },
            token,
        }
    })
}

const login = async (req, res) => {
    const { email, password } = req.body;

    // check if the user email exists
    const user = await prisma.user.findUnique({
        where: { email: email }
    })

    if (!user) {
        return res.status(400)
            .json({ error: "Incorrect email or password" })
    }

    // verify password

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400)
            .json({ error: "Incorrect email or password" })
    }

    const token = generateToken(user.id, res);

    res.status(201).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                email: email
            },
            token,
        }
    })

}

const logout = async(req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    })
    res.status(200).json({
        status: "success",
        message: "Logout successfull"
    })
}
export { register, login, logout };