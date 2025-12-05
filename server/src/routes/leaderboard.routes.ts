import { Router } from 'express'
import { LeaderboardController } from '../controllers/leaderboard.controller'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Classement en temps réel des équipes
 */

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Récupère le classement complet avec pagination
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre maximum d'équipes à retourner
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom d'équipe ou membre
 *     responses:
 *       200:
 *         description: Classement paginé des équipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       description:
 *                         type: string
 *                       members:
 *                         type: array
 *                         items:
 *                           type: string
 *                       color:
 *                         type: string
 *                       position:
 *                         type: integer
 *                       progress:
 *                         type: number
 *                       activitiesCount:
 *                         type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 */
router.get('/', LeaderboardController.getLeaderboard)

/**
 * @swagger
 * /api/leaderboard/top:
 *   get:
 *     summary: Récupère le podium (top 3)
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: Les trois premières équipes du classement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 first:
 *                   $ref: '#/components/schemas/Team'
 *                 second:
 *                   $ref: '#/components/schemas/Team'
 *                 third:
 *                   $ref: '#/components/schemas/Team'
 */
router.get('/top', LeaderboardController.getTopThree)

/**
 * @swagger
 * /api/leaderboard/stats:
 *   get:
 *     summary: Récupère les statistiques globales du concours
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: Statistiques détaillées du concours
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTeams:
 *                   type: integer
 *                 totalPoints:
 *                   type: integer
 *                 totalChallenges:
 *                   type: integer
 *                 totalActivities:
 *                   type: integer
 *                 averageScore:
 *                   type: number
 *                 highestScore:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     score:
 *                       type: integer
 *                     avatar:
 *                       type: string
 *                 recentActivities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       team:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                       challenge:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                       points:
 *                         type: integer
 *                       description:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/stats', LeaderboardController.getStats)

/**
 * @swagger
 * /api/leaderboard/team/{teamId}:
 *   get:
 *     summary: Récupère la position d'une équipe dans le classement
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'équipe
 *     responses:
 *       200:
 *         description: Position et informations de l'équipe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 score:
 *                   type: integer
 *                 description:
 *                   type: string
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                 color:
 *                   type: string
 *                 position:
 *                   type: integer
 *                 progress:
 *                   type: number
 *       404:
 *         description: Équipe non trouvée
 */
router.get('/team/:teamId', LeaderboardController.getTeamPosition)

/**
 * @swagger
 * /api/leaderboard/export:
 *   get:
 *     summary: Exporte le classement au format CSV
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: Fichier CSV du classement
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/export', LeaderboardController.exportLeaderboard)

export default router