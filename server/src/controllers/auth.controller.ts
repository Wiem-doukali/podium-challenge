
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../utils/prisma'
import { z } from 'zod'
import { generateToken, verifyToken, TokenPayload } from '../utils/jwt'

// Définir AuthRequest localement
interface AuthRequest extends Request {
  user?: TokenPayload
}

// Schémas de validation
const registerSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(1, 'Email requis')
    .max(255, 'Email trop long'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Nom trop long'),
  role: z.string()
    .refine(val => ['USER', 'ADMIN', 'MODERATOR'].includes(val), {
      message: 'Rôle invalide. Doit être USER, ADMIN ou MODERATOR'
    })
    .optional()
    .default('USER')
})

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
})

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body)
      const { email, password, name, role = 'USER' } = validatedData

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      })

      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          error: 'Cet email est déjà utilisé',
          code: 'EMAIL_EXISTS'
        })
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12)

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role as any
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      })

      // Générer le token JWT
      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }

      const token = generateToken(tokenPayload)

      // Cookie sécurisé
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        user,
        token
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }
      
      console.error('Erreur lors de l\'inscription:', error)
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        code: 'REGISTRATION_ERROR'
      })
    }
  },

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body)
      const { email, password } = validatedData

      // Trouver l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
          createdAt: true
        }
      })

      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: 'Email ou mot de passe incorrect',
          code: 'INVALID_CREDENTIALS'
        })
      }

      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password)
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          error: 'Email ou mot de passe incorrect',
          code: 'INVALID_CREDENTIALS'
        })
      }

      // Générer le token JWT
      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }

      const token = generateToken(tokenPayload)

      // Cookie sécurisé
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })

      // Retirer le mot de passe de la réponse
      const { password: _, ...userWithoutPassword } = user

      res.json({
        success: true,
        message: 'Connexion réussie',
        user: userWithoutPassword,
        token
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          error: 'Validation failed',
          details: error.errors
        })
      }
      console.error('Erreur lors de la connexion:', error)
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        code: 'LOGIN_ERROR'
      })
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Non authentifié',
          code: 'UNAUTHORIZED'
        })
      }

      const token = authHeader.split(' ')[1]
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token manquant',
          code: 'TOKEN_MISSING'
        })
      }

      try {
        const decoded = verifyToken(token)

        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        })

        if (!user) {
          return res.status(404).json({ 
            success: false,
            error: 'Utilisateur non trouvé',
            code: 'USER_NOT_FOUND'
          })
        }

        res.json({
          success: true,
          user
        })
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          error: 'Token invalide ou expiré',
          code: 'INVALID_TOKEN'
        })
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        code: 'PROFILE_ERROR'
      })
    }
  },

  async logout(req: Request, res: Response) {
    try {
      // Effacer le cookie
      res.clearCookie('token')
      
      res.json({ 
        success: true,
        message: 'Déconnexion réussie' 
      })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la déconnexion' 
      })
    }
  },

  async refreshToken(req: AuthRequest, res: Response) {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Non authentifié'
        })
      }

      const token = authHeader.split(' ')[1]
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token manquant'
        })
      }

      try {
        const decoded = verifyToken(token)

        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        })

        if (!user) {
          return res.status(404).json({ 
            success: false,
            error: 'Utilisateur non trouvé' 
          })
        }

        // Générer un nouveau token
        const tokenPayload: TokenPayload = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }

        const newToken = generateToken(tokenPayload)

        // Mettre à jour le cookie
        res.cookie('token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.json({
          success: true,
          message: 'Token rafraîchi',
          token: newToken
        })
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          error: 'Token invalide ou expiré'
        })
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error)
      res.status(500).json({ 
        success: false,
        error: 'Erreur serveur' 
      })
    }
  },

  async verify(req: AuthRequest, res: Response) {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          authenticated: false,
          message: 'Token manquant'
        })
      }

      const token = authHeader.split(' ')[1]
      if (!token) {
        return res.status(401).json({
          success: false,
          authenticated: false,
          message: 'Format de token invalide'
        })
      }

      try {
        const decoded = verifyToken(token)

        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        })

        if (!user) {
          return res.status(404).json({
            success: false,
            authenticated: false,
            error: 'User not found'
          })
        }

        res.json({
          success: true,
          authenticated: true,
          user
        })
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          authenticated: false,
          error: 'Token invalide ou expiré'
        })
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      res.status(500).json({
        success: false,
        authenticated: false,
        error: 'Internal server error'
      })
    }
  }
}