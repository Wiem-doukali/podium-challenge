import express from 'express';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getLeaderboard,
  getPodium,
  updateTeamScore,
  addScoreToTeam,
  getTeamScores,
  resetAllScores,
  getTeamRank,
  exportTeams,
  searchTeams,
  getTeamsStats,
  testPrismaConnection
} from '../controllers/team.controller';

const router = express.Router();

// Routes de base
router.get('/', getTeams);
router.get('/leaderboard', getLeaderboard);
router.get('/podium', getPodium);
router.get('/search', searchTeams);
router.get('/stats', getTeamsStats);
router.get('/export', exportTeams);
router.get('/debug/connection', testPrismaConnection);

// Routes par ID
router.get('/:id', getTeamById);
router.get('/:id/scores', getTeamScores);
router.get('/:id/rank', getTeamRank);

// Opérations CRUD
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

// Gestion des scores
router.patch('/:id/score', updateTeamScore);
router.post('/:id/scores', addScoreToTeam);
router.post('/scores/reset', resetAllScores);

export default router;