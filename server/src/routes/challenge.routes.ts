import { Router } from 'express'
import { ChallengeController } from '../controllers/challenge.controller'
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Challenges
 *   description: Gestion des défis du concours
 */

/**
 * @swagger
 * /api/challenges:
 *   get:
 *     summary: Récupère tous les défis
 *     tags: [Challenges]
 *     responses:
 *       200:
 *         description: Liste de tous les défis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Challenge'
 */
router.get('/', ChallengeController.getAllChallenges)

/**
 * @swagger
 * /api/challenges/active:
 *   get:
 *     summary: Récupère les défis actifs
 *     tags: [Challenges]
 *     responses:
 *       200:
 *         description: Liste des défis actifs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Challenge'
 */
router.get('/active', ChallengeController.getActiveChallenges)

/**
 * @swagger
 * /api/challenges/{id}:
 *   get:
 *     summary: Récupère un défi par son ID
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi
 *     responses:
 *       200:
 *         description: Détails du défi avec ses activités
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 *       404:
 *         description: Défi non trouvé
 */
router.get('/:id', ChallengeController.getChallengeById)

/**
 * @swagger
 * /api/challenges/{id}/stats:
 *   get:
 *     summary: Récupère les statistiques d'un défi
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi
 *     responses:
 *       200:
 *         description: Statistiques du défi
 */
router.get('/:id/stats', ChallengeController.getChallengeStats)

/**
 * @swagger
 * /api/challenges:
 *   post:
 *     summary: Crée un nouveau défi
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - points
 *               - difficulty
 *               - category
 *               - startDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Développement Frontend Accessible"
 *               description:
 *                 type: string
 *                 example: "Créer une interface conforme aux normes WCAG 2.1"
 *               points:
 *                 type: integer
 *                 minimum: 1
 *                 example: 100
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD, EXPERT]
 *                 example: "MEDIUM"
 *               category:
 *                 type: string
 *                 example: "Frontend"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-02-15T23:59:59.999Z"
 *     responses:
 *       201:
 *         description: Défi créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', authMiddleware, adminMiddleware, ChallengeController.createChallenge)

/**
 * @swagger
 * /api/challenges/{id}:
 *   put:
 *     summary: Met à jour un défi
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               points:
 *                 type: integer
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD, EXPERT]
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Défi mis à jour
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Défi non trouvé
 */
router.put('/:id', authMiddleware, adminMiddleware, ChallengeController.updateChallenge)

/**
 * @swagger
 * /api/challenges/{id}:
 *   delete:
 *     summary: Supprime un défi
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi
 *     responses:
 *       200:
 *         description: Défi supprimé
 *       404:
 *         description: Défi non trouvé
 */
router.delete('/:id', authMiddleware, adminMiddleware, ChallengeController.deleteChallenge)

/**
 * @swagger
 * /api/challenges/{id}/complete:
 *   post:
 *     summary: Marque un défi comme complété par une équipe
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *                 example: "clhx6q9qg0000..."
 *               description:
 *                 type: string
 *                 example: "Challenge complété avec succès"
 *     responses:
 *       200:
 *         description: Défi complété, points ajoutés à l'équipe
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Défi ou équipe non trouvé
 */
router.post('/:id/complete', authMiddleware, adminMiddleware, ChallengeController.completeChallenge)

export default router