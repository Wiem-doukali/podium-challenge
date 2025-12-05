import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
  errorFormat: 'pretty'
})

export const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('Base SQLite connectée')
    
    try {
      const userCount = await prisma.user.count()
      console.log(`${userCount} utilisateur(s) dans la base`)
    } catch {
      console.log('Base vierge - Exécutez les migrations: npx prisma migrate dev')
    }
    
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error)
    process.exit(1)
  }
}

export const checkDBHealth = async () => {
  try {
    // Forcer le type avec 'as any'
    await (prisma as any).$queryRaw`SELECT 1`
    
    return { 
      healthy: true, 
      message: 'SQLite connecté et opérationnel'
    }
  } catch (error) {
    return { 
      healthy: false, 
      message: 'Erreur de connexion SQLite',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Arrêt gracieux
const gracefulShutdown = async () => {
  await prisma.$disconnect()
  console.log('Connexion SQLite fermée')
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

export default prisma