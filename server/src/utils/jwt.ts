import jwt from 'jsonwebtoken'

export interface TokenPayload {
  id: string
  email: string
  role: string
  name: string
}

export const generateToken = (payload: TokenPayload): string => {
  // Définir les variables séparément avec des assertions de type
  const secret: string = process.env.JWT_SECRET || 'default_secret_change_this_in_production'
  const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d'
  
  // Utiliser des variables directement
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any })
}

export const verifyToken = (token: string): TokenPayload => {
  const secret: string = process.env.JWT_SECRET || 'default_secret_change_this_in_production'
  return jwt.verify(token, secret) as TokenPayload
}