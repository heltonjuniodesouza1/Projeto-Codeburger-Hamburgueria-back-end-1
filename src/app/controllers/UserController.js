import { v4 } from 'uuid'
import * as Yup from 'yup'
import User from '../models//User'

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
      admin: Yup.boolean(),
    })

    try {
      await schema.validateSync(req.body, { abortEarly: false }) // mostra o primeiro erro
    } catch (err) {
      return res.status(400).json({ error: err.errors }) // retorna todos os erros
    }

    const { name, email, password, admin } = req.body

    const userExists = await User.findOne({
      where: { email },
    }) // verificando se esse usuário já existe no banco de dados
    if (userExists) {
      return res.status(409).json({ error: 'User already exists' }) // 409  conflito com a requisição
    }

    const user = await User.create({
      id: v4(),
      name,
      email,
      password,
      admin,
    })

    return res.status(201).json({
      id: user.id,
      name,
      email,
      admin,
    })
  }
}

export default new UserController()
