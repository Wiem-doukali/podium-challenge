import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { Parser } from 'json2csv'

export const LeaderboardController = {
  async getLeaderboard(req: Request, res: Response) {
    try {
      const { limit, page = 1, search } = req.query
      const pageSize = limit ? parseInt(limit as string) : 10
      const pageNumber = parseInt(page as string) || 1
      const skip = (pageNumber - 1) * pageSize

      // Construire la requête
      const where: any = { isActive: true }
      
      if (search) {
        where.name = {
          contains: search as string,
          mode: 'insensitive'
        }
      }

      // Récupérer le total
      const total = await prisma.team.count({ where })

      // Récupérer les équipes avec pagination
      const teams = await prisma.team.findMany({
        where,
        orderBy: { score: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          avatar: true,
          score: true,
          description: true,
          members: true,
          color: true,
          createdAt: true,
          _count: {
            select: {
              activities: true,
            },
          },
        },
      })

      // Ajouter la position dans le classement
      const teamsWithPosition = teams.map((team, index) => ({
        ...team,
        position: skip + index + 1,
        progress: Math.random() * 100 // À remplacer par une logique réelle
      }))

      res.json({
        teams: teamsWithPosition,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / pageSize),
        hasMore: pageNumber < Math.ceil(total / pageSize)
      })
    } catch (error) {
      console.error('Erreur lors de la récupération du classement:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },

  async getTopThree(req: Request, res: Response) {
    try {
      const teams = await prisma.team.findMany({
        where: { isActive: true },
        orderBy: { score: 'desc' },
        take: 3,
        select: {
          id: true,
          name: true,
          avatar: true,
          score: true,
          description: true,
          members: true,
          color: true,
        },
      })

      const podium = {
        first: teams[0] || null,
        second: teams[1] || null,
        third: teams[2] || null,
      }

      res.json(podium)
    } catch (error) {
      console.error('Erreur lors de la récupération du podium:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const totalTeams = await prisma.team.count({
        where: { isActive: true }
      })
      
      const totalPoints = await prisma.team.aggregate({
        where: { isActive: true },
        _sum: { score: true },
      })
      
      const totalChallenges = await prisma.challenge.count({
        where: { isActive: true }
      })
      
      const totalActivities = await prisma.activity.count()

      const averageScore = totalTeams > 0 ? (totalPoints._sum.score || 0) / totalTeams : 0

      const teamWithHighestScore = await prisma.team.findFirst({
        where: { isActive: true },
        orderBy: { score: 'desc' },
        select: {
          id: true,
          name: true,
          score: true,
          avatar: true,
        },
      })

      const recentActivities = await prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          team: {
            select: {
              name: true,
              avatar: true,
            }
          },
          challenge: {
            select: {
              title: true,
            }
          }
        }
      })

      // Statistiques par catégorie
      const categoryStats = await prisma.challenge.groupBy({
        by: ['category'],
        where: { isActive: true },
        _sum: {
          points: true,
        },
        _count: {
          id: true,
        },
      })

      const stats = {
        totalTeams,
        totalPoints: totalPoints._sum.score || 0,
        totalChallenges,
        totalActivities,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: teamWithHighestScore,
        recentActivities,
        categoryStats,
      }

      res.json(stats)
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },

  async getTeamPosition(req: Request, res: Response) {
    try {
      const { teamId } = req.params

      // Vérifier si l'équipe existe
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
          id: true,
          name: true,
          avatar: true,
          score: true,
          description: true,
          members: true,
          color: true,
        }
      })

      if (!team) {
        return res.status(404).json({ error: 'Équipe non trouvée' })
      }

      // Calculer la position dans le classement
      const teamsWithHigherScore = await prisma.team.count({
        where: {
          isActive: true,
          score: { gt: team.score }
        }
      })

      const position = teamsWithHigherScore + 1

      // Récupérer les activités récentes
      const recentActivities = await prisma.activity.findMany({
        where: { teamId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          challenge: {
            select: {
              title: true,
              points: true,
            }
          }
        }
      })

      res.json({
        ...team,
        position,
        recentActivities,
        // Statistiques additionnelles
        pointsThisWeek: team.score * 0.3, // Exemple
        rankChange: '+2', // Exemple
      })
    } catch (error) {
      console.error('Erreur lors de la récupération de la position:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },

  async exportLeaderboard(req: Request, res: Response) {
    try {
      const teams = await prisma.team.findMany({
        where: { isActive: true },
        orderBy: { score: 'desc' },
        select: {
          id: true,
          name: true,
          score: true,
          members: true,
          createdAt: true,
          _count: {
            select: {
              activities: true,
            },
          },
        },
      })

      // Ajouter la position
      const teamsWithPosition = teams.map((team, index) => ({
        position: index + 1,
        name: team.name,
        score: team.score,
        members: team.members.join(', '),
        activitiesCount: team._count.activities,
        createdAt: team.createdAt.toISOString().split('T')[0],
      }))

      // Convertir en CSV
      const fields = ['position', 'name', 'score', 'members', 'activitiesCount', 'createdAt']
      const json2csvParser = new Parser({ fields })
      const csv = json2csvParser.parse(teamsWithPosition)

      // Définir les headers pour le téléchargement
      res.header('Content-Type', 'text/csv')
      res.attachment(`podium-leaderboard-${new Date().toISOString().split('T')[0]}.csv`)
      res.send(csv)
    } catch (error) {
      console.error('Erreur lors de l\'export du classement:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }
}