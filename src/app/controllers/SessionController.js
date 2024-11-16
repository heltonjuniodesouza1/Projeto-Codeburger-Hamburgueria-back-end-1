import * as Yup from 'yup'
import jwt from 'jsonwebtoken'
import authConfig from '../../config/auth'

import User from '../models/User'

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    })

    const userEmailOrPasswordIncorrect = () => {
      return res
        .status(401)
        .json({ error: 'Make sure your password or email are correct' })
    }

    try {
      if (!(await schema.isValid(req.body)))
        return userEmailOrPasswordIncorrect()
      const { email, password } = req.body

      const user = await User.findOne({ where: { email } })

      if (!user) return userEmailOrPasswordIncorrect()

      if (!(await user.checkPassword(password)))
        return userEmailOrPasswordIncorrect()

      const token = jwt.sign(
        { id: user.id, name: user.name },
        authConfig.secret,
        {
          expiresIn: authConfig.expiresIn,
        },
      )

      return res.json({
        id: user.id,
        email,
        name: user.name,
        admin: user.admin,
        token,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export default new SessionController()
