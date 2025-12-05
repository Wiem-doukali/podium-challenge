import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seed...')

  // Nettoyer la base de données
  await prisma.activity.deleteMany()
  await prisma.challenge.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()
  await prisma.config.deleteMany()

  // Créer l'utilisateur admin
  const hashedPassword = await bcrypt.hash('Admin123!', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@miage.fr',
      password: hashedPassword,
      name: 'Administrateur',
      role: 'ADMIN',
    },
  })

  // Créer un utilisateur test
  const userPassword = await bcrypt.hash('User123!', 10)
  await prisma.user.create({
    data: {
      email: 'user@miage.fr',
      password: userPassword,
      name: 'Utilisateur Test',
      role: 'USER',
    },
  })

  // Créer des équipes
  const team1 = await prisma.team.create({
    data: {
      name: 'Les Codeurs Masqués',
      description: 'Équipe spécialisée en React et Node.js',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Codeurs',
      members: ['Alice Dupont', 'Bob Martin', 'Charlie Wilson'],
      color: '#3b82f6',
      score: 450,
    },
  })

  const team2 = await prisma.team.create({
    data: {
      name: 'FullStack Warriors',
      description: 'Experts en développement full-stack',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Warriors',
      members: ['David Lee', 'Emma Garcia', 'Frank Miller'],
      color: '#10b981',
      score: 380,
    },
  })

  const team3 = await prisma.team.create({
    data: {
      name: 'React Masters',
      description: 'Spécialistes React et TypeScript',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Masters',
      members: ['Grace Hopper', 'Henry Ford', 'Irene Joliot'],
      color: '#8b5cf6',
      score: 520,
    },
  })

  const team4 = await prisma.team.create({
    data: {
      name: 'Backend Ninjas',
      description: 'Experts en architecture backend',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ninjas',
      members: ['Jack Sparrow', 'Karen Smith', 'Leo Messi'],
      color: '#ef4444',
      score: 290,
    },
  })

  // Créer des défis
  const challenge1 = await prisma.challenge.create({
    data: {
      title: 'Développement Frontend Accessible',
      description: 'Créer une interface conforme aux normes WCAG 2.1 niveau AA',
      points: 100,
      difficulty: 'MEDIUM',
      category: 'Frontend',
      startDate: new Date('2024-01-15'),
      isActive: true,
    },
  })

  const challenge2 = await prisma.challenge.create({
    data: {
      title: 'API REST Sécurisée',
      description: 'Développer une API avec authentification JWT et validation',
      points: 150,
      difficulty: 'HARD',
      category: 'Backend',
      startDate: new Date('2024-01-15'),
      isActive: true,
    },
  })

  const challenge3 = await prisma.challenge.create({
    data: {
      title: 'Tests Unitaires',
      description: 'Créer une suite de tests avec 90% de couverture',
      points: 80,
      difficulty: 'MEDIUM',
      category: 'Qualité',
      startDate: new Date('2024-01-15'),
      isActive: true,
    },
  })

  const challenge4 = await prisma.challenge.create({
    data: {
      title: 'Déploiement Docker',
      description: 'Conteneuriser l\'application avec Docker Compose',
      points: 120,
      difficulty: 'HARD',
      category: 'DevOps',
      startDate: new Date('2024-01-15'),
      isActive: true,
    },
  })

  // Créer des activités
  const activities = [
    // Équipe 1
    {
      teamId: team1.id,
      challengeId: challenge1.id,
      points: 100,
      description: 'Challenge Frontend Accessible complété',
      type: 'CHALLENGE_COMPLETED' as const,
    },
    {
      teamId: team1.id,
      challengeId: challenge2.id,
      points: 150,
      description: 'API REST Sécurisée implémentée',
      type: 'CHALLENGE_COMPLETED' as const,
    },
    {
      teamId: team1.id,
      points: 50,
      description: 'Bonus pour qualité du code',
      type: 'BONUS_POINTS' as const,
    },
    // Équipe 2
    {
      teamId: team2.id,
      challengeId: challenge2.id,
      points: 150,
      description: 'API REST Sécurisée complétée',
      type: 'CHALLENGE_COMPLETED' as const,
    },
    {
      teamId: team2.id,
      challengeId: challenge3.id,
      points: 80,
      description: 'Tests Unitaires réussis',
      type: 'CHALLENGE_COMPLETED' as const,
    },
    // Équipe 3
    {
      teamId: team3.id,
      challengeId: challenge1.id,
      points: 100,
      description: 'Challenge Frontend Accessible complété',
      type: 'CHALLENGE_COMPLETED' as const,
    },
    {
      teamId: team3.id,
      challengeId: challenge2.id,
      points: 150,
      description: 'API REST Sécurisée implémentée',
      type: 'CHALLENGE_COMPLETED' as const,
    },
    {
      teamId: team3.id,
      challengeId: challenge4.id,
      points: 120,
      description: 'Déploiement Docker réussi',
      type: 'CHALLENGE_COMPLETED' as const,
    },
    {
      teamId: team3.id,
      points: 50,
      description: 'Bonus pour documentation complète',
      type: 'BONUS_POINTS' as const,
    },
    // Équipe 4
    {
      teamId: team4.id,
      challengeId: challenge3.id,
      points: 80,
      description: 'Tests Unitaires réussis',
      type: 'CHALLENGE_COMPLETED' as const,
    },
    {
      teamId: team4.id,
      challengeId: challenge4.id,
      points: 120,
      description: 'Déploiement Docker réussi',
      type: 'CHALLENGE_COMPLETED' as const,
    },
  ]

  await prisma.activity.createMany({
    data: activities,
  })

  // Créer des configurations
  const configs = [
    {
      key: 'COMPETITION_NAME',
      value: 'Podium Challenge BDE MIAGE Paris Cité',
      description: 'Nom de la compétition',
    },
    {
      key: 'COMPETITION_DESCRIPTION',
      value: 'Concours de développement web full-stack avec focus sur l\'accessibilité',
      description: 'Description de la compétition',
    },
    {
      key: 'COMPETITION_START_DATE',
      value: '2024-01-15T00:00:00.000Z',
      description: 'Date de début de la compétition',
    },
    {
      key: 'COMPETITION_END_DATE',
      value: '2024-02-15T23:59:59.999Z',
      description: 'Date de fin de la compétition',
    },
    {
      key: 'MAX_TEAM_MEMBERS',
      value: '5',
      description: 'Nombre maximum de membres par équipe',
    },
    {
      key: 'POINTS_PER_CHALLENGE',
      value: '100',
      description: 'Points de base par challenge',
    },
    {
      key: 'LEADERBOARD_REFRESH_INTERVAL',
      value: '5000',
      description: 'Intervalle de rafraîchissement du classement (ms)',
    },
    {
      key: 'MAINTENANCE_MODE',
      value: 'false',
      description: 'Mode maintenance activé/désactivé',
    },
  ]

  await prisma.config.createMany({
    data: configs,
  })

  console.log('✅ Seed terminé avec succès !')
  console.log('👤 Utilisateurs créés:')
  console.log(`   - Admin: admin@miage.fr / Admin123!`)
  console.log(`   - User: user@miage.fr / User123!`)
  console.log('🏆 Équipes créées: 4')
  console.log('🎯 Challenges créés: 4')
  console.log('📊 Activités créées: 11')
  console.log('⚙️ Configurations créées: 8')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })