import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { z } from 'zod'

// Schémas de validation
const createChallengeSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères'),
  description: z.string().optional().default(''), 
  points: z.number().int().positive('Le nombre de points doit être positif'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  category: z.string().min(1, 'La catégorie est requise'),
  isActive: z.boolean().optional().default(true),
  startDate: z.string().datetime('Date de début invalide'),
  endDate: z.string().datetime('Date de fin invalide').optional().nullable()
})

const updateChallengeSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères').optional(),
  description: z.string().optional().default(''), 
  points: z.number().int().positive('Le nombre de points doit être positif').optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  category: z.string().min(1, 'La catégorie est requise').optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().datetime('Date de début invalide').optional(),
  endDate: z.string().datetime('Date de fin invalide').optional().nullable()
})

const completeChallengeSchema = z.object({
  teamId: z.string().min(1, 'L\'ID de l\'équipe est requis'),
  description: z.string().optional().default('') 
})

export const ChallengeController = {
  async getAllChallenges(req: Request, res: Response) {
    try {
      const challenges = await prisma.challenge.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          activities: {
            take: 5,
            include: {
              team: {
                select: {
                  name: true,
                  avatar: true
                }
              }
            }
          }
        }
      })
      res.json(challenges)
    } catch (error) {
      console.error('Erreur lors de la récupération des défis:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },

  async getActiveChallenges(req: Request, res: Response) {
    try {
      const challenges = await prisma.challenge.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })
      res.json(challenges)
    } catch (error) {
      console.error('Erreur lors de la récupération des défis actifs:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },

  async getChallengeById(req: Request, res: Response) {
    try {
      const challenge = await prisma.challenge.findUnique({
        where: { id: req.params.id },
        include: {
          activities: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  score: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      
      if (!challenge) {
        return res.status(404).json({ error: 'Défi non trouvé' })
      }
      
      res.json(challenge)
    } catch (error) {
      console.error('Erreur lors de la récupération du défi:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },

  async createChallenge(req: Request, res: Response) {
    try {
      const validatedData = createChallengeSchema.parse(req.body)
      const {
        title,
        description,
        points,
        difficulty,
        category,
        isActive,
        startDate,
        endDate
      } = validatedData

      const challenge = await prisma.challenge.create({
        data: {
          title,
          description: description || '',
          points,
          difficulty,
          category,
          isActive,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null
        }
      })

      // Notifier les clients du nouveau défi
      const io = (req as any).app.get('io') 
      if (io) {
        io.emit('challengeCreated', challenge)
      }

      res.status(201).json({
        message: 'Défi créé avec succès',
        challenge
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Données invalides', 
          details: error.errors 
        })
      }
      console.error('Erreur lors de la création du défi:', error)
      res.status(400).json({ error: 'Erreur lors de la création' })
    }
  },

  async updateChallenge(req: Request, res: Response) {
    try {
      const validatedData = updateChallengeSchema.parse(req.body)
      
      // Vérifier si le défi existe
      const existingChallenge = await prisma.challenge.findUnique({
        where: { id: req.params.id }
      })

      if (!existingChallenge) {
        return res.status(404).json({ error: 'Défi non trouvé' })
      }

      // Préparer les données de mise à jour
      const updateData: any = {}
      
      if (validatedData.title !== undefined) updateData.title = validatedData.title
      if (validatedData.description !== undefined) updateData.description = validatedData.description || ''
      if (validatedData.points !== undefined) updateData.points = validatedData.points
      if (validatedData.difficulty !== undefined) updateData.difficulty = validatedData.difficulty
      if (validatedData.category !== undefined) updateData.category = validatedData.category
      if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive
      if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate)
      if (validatedData.endDate !== undefined) {
        updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null
      }

      const challenge = await prisma.challenge.update({
        where: { id: req.params.id },
        data: updateData
      })

      // Notifier les clients
      const io = (req as any).app.get('io')
      if (io) {
        io.emit('challengeUpdated', challenge)
      }

      res.json({
        message: 'Défi mis à jour avec succès',
        challenge
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Données invalides', 
          details: error.errors 
        })
      }
      console.error('Erreur lors de la mise à jour du défi:', error)
      res.status(400).json({ error: 'Erreur lors de la mise à jour' })
    }
  },

  async deleteChallenge(req: Request, res: Response) {
    try {
      // Vérifier si le défi existe
      const existingChallenge = await prisma.challenge.findUnique({
        where: { id: req.params.id }
      })

      if (!existingChallenge) {
        return res.status(404).json({ error: 'Défi non trouvé' })
      }

      await prisma.challenge.delete({
        where: { id: req.params.id }
      })

      // Notifier les clients
      const io = (req as any).app.get('io')
      if (io) {
        io.emit('challengeDeleted', req.params.id)
      }

      res.json({ message: 'Défi supprimé avec succès' })
    } catch (error) {
      console.error('Erreur lors de la suppression du défi:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },

  async completeChallenge(req: Request, res: Response) {
    try {
      const validatedData = completeChallengeSchema.parse(req.body)
      const { teamId, description } = validatedData

      // Vérifier si le défi existe
      const challenge = await prisma.challenge.findUnique({
        where: { id: req.params.id }
      })

      if (!challenge) {
        return res.status(404).json({ error: 'Défi non trouvé' })
      }

      // Vérifier si l'équipe existe
      const team = await prisma.team.findUnique({
        where: { id: teamId }
      })

      if (!team) {
        return res.status(404).json({ error: 'Équipe non trouvée' })
      }

      // Mettre à jour le score de l'équipe
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          score: { increment: challenge.points }
        }
      })

      // Créer l'activité
      const activity = await prisma.activity.create({
        data: {
          teamId,
          challengeId: challenge.id,
          points: challenge.points,
          description: description || `Challenge "${challenge.title}" complété`,
          type: 'CHALLENGE_COMPLETED'
        },
        include: {
          team: {
            select: {
              name: true,
              avatar: true
            }
          },
          challenge: {
            select: {
              title: true
            }
          }
        }
      })

      // Notifier via WebSocket
      const io = (req as any).app.get('io')
      if (io) {
        io.to('leaderboard').emit('teamUpdated', updatedTeam)
        io.to('leaderboard').emit('leaderboardUpdated')
        io.emit('challengeCompleted', {
          teamId,
          challengeId: challenge.id,
          points: challenge.points,
          activity
        })
      }

      res.json({
        message: 'Challenge complété avec succès',
        team: updatedTeam,
        activity
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Données invalides', 
          details: error.errors 
        })
      }
      console.error('Erreur lors de la complétion du challenge:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },

  async getChallengeStats(req: Request, res: Response) {
    try {
      const challenge = await prisma.challenge.findUnique({
        where: { id: req.params.id },
        include: {
          activities: {
            include: {
              team: {
                select: {
                  name: true,
                  avatar: true
                }
              }
            }
          }
        }
      })

      if (!challenge) {
        return res.status(404).json({ error: 'Défi non trouvé' })
      }

      const stats = {
        totalCompletions: challenge.activities.length,
        totalPointsAwarded: challenge.activities.reduce((sum: number, activity: { points: number }) => 
          sum + activity.points, 0),
        teamsCompleted: Array.from(new Set(challenge.activities.map((a: { teamId: string }) => a.teamId))).length,
        recentCompletions: challenge.activities.slice(0, 10)
      }

      res.json({
        challenge,
        stats
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des stats du défi:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }
}