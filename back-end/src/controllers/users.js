import prisma from '../database/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const controller = {}   // Objeto vazio

controller.create = async function(req, res) {
    try {
      // Se a senha foi informada, criptografa
      if(req.body.password) {
          req.body.password = await bcrypt.hash(req.body.password, 12);
      }

      await prisma.user.create({data: req.body});
        
      // HTTP 201 Created
      res.status(201).end();
    }
    catch (error) {
        console.error(error);
        
        // HTTP 500 Internal Server Error
        res.status(500).end();
    }
}

controller.retriveAll = async function(req, res) {
    try {
      const result = await prisma.user.findMany({
        omit: { password: true }, // Não retorna a senha 
      })

      // HTTP 200 OK
      res.send(result);
    }
    catch (error) {
        console.error(error);
        
        // HTTP 500 Internal Server Error
        res.status(500).end();
    }
}

controller.retrieveOne = async function(req, res) {
    try {
      const result = await prisma.user.findUnique({
        omit: { password: true }, // Não retorna a senha 
        where: { id: Number(req.params.id) }
      })
  
      // Encontrou ~> retorna HTTP 200: OK (implícito)
      if(result) res.send(result)
      // Não encontrou ~> retorna HTTP 404: Not Found
      else res.status(404).end()
    }
    catch(error) {
      console.error(error)
  
      // HTTP 500: Internal Server Error
      res.status(500).end()
    }
  }
  
  controller.update = async function(req, res) {
    try {
      // Se a senha foi informada, criptografa
      if(req.body.password) {
          req.body.password = await bcrypt.hash(req.body.password, 12);
      }

      const result = await prisma.user.update({
        where: { id: Number(req.params.id) },
        data: req.body
      })
  
      // Encontrou e atualizou ~> HTTP 204: No Content
      if(result) res.status(204).end()
      // Não encontrou (e não atualizou) ~> HTTP 404: Not Found
      else res.status(404).end()
    }
    catch(error) {
      console.error(error)
  
      // HTTP 500: Internal Server Error
      res.status(500).end()
    }
  }
  
  controller.delete = async function(req, res) {
    try {
      await prisma.user.delete({
        where: { id: Number(req.params.id) }
      })
  
      // Encontrou e excluiu ~> HTTP 204: No Content
      res.status(204).end()
    }
    catch(error) {
      if(error?.code === 'P2025') {
        // Não encontrou e não excluiu ~> HTTP 404: Not Found
        res.status(404).end()
      }
      else {
        // Outros tipos de erro
        console.error(error)
  
        // HTTP 500: Internal Server Error
        res.status(500).end()
      }
    }
  }

  controller.login = async function(req, res) {
    try{
      // Busca o usuário no banco de dados
      // Username ou e-mail
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: req.body?.username },
            { email: req.body?.email }
          ]
        }
      });

      // Se não encontrou o usuário
      // Retorna HTTP 401 Unauthorized
      if(!user) {
        res.status(401).end();
        return;
      }

      // Usuario encontrado ~> compara a senha
      const passwordIsValid = await bcrypt.compare(req.body.password, user.password);

      // Se a senha não é válida
      // Retorna HTTP 401 Unauthorized
      if(!passwordIsValid) {
        res.status(401).end();
        return;
      }

      // Usuario e senha válidos ~> gera o token
      const token = jwt.sign(
        user,
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Retorna o token
      res.send({ token, user });
    }
    catch(error) {
      console.error(error)
  
      // HTTP 500: Internal Server Error
      res.status(500).end()
    }
  }
  
export default controller; // Exporta o objeto vazio