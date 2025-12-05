import { Request, Response } from 'express';

// Créer une instance Prisma sécurisée
let prisma: any;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error) {
  console.error('Error loading Prisma client:', error);
  prisma = null;
}

// ==================== FONCTIONS UTILITAIRES ====================

function getRankText(position: number): string {
  const frenchRanks: Record<number, string> = {
    1: '1er',
    2: '2ème',
    3: '3ème'
  };
  
  return frenchRanks[position] || `${position}ème`;
}

function getMedal(position: number): string {
  switch (position) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
}

// Vérifier que Prisma est disponible
const ensurePrisma = () => {
  if (!prisma) {
    throw new Error('Prisma client not available');
  }
  return prisma;
};

// ==================== FONCTIONS DE BASE ====================

export const getTeams = async (req: Request, res: Response) => {
  try {
    ensurePrisma();
    const { sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const validSortFields = ['name', 'createdAt', 'updatedAt'];
    const validSortOrders = ['asc', 'desc'];
    
    const sortField = validSortFields.includes(sortBy as string) 
      ? (sortBy as string) 
      : 'createdAt';
    
    const sortDirection = validSortOrders.includes(sortOrder as string)
      ? (sortOrder as string)
      : 'desc';

    // Récupérer les équipes
    const teams = await prisma.team.findMany({
      orderBy: {
        [sortField]: sortDirection
      }
    });

    // Pour chaque équipe, compter les scores et membres
    const teamsWithDetails = await Promise.all(
      teams.map(async (team: any) => {
        const scoresCount = await prisma.score.count({
          where: { teamId: team.id }
        });
        
        const membersCount = await prisma.teamMember.count({
          where: { teamId: team.id }
        });
        
        return {
          ...team,
          scoresCount,
          membersCount
        };
      })
    );

    // Trier par score si demandé
    let finalTeams = teamsWithDetails;
    if (sortBy === 'score') {
      finalTeams = [...teamsWithDetails].sort((a: any, b: any) => {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      });
    }

    return res.json({
      success: true,
      data: finalTeams,
      message: 'Teams fetched successfully',
      meta: {
        sortBy: sortField,
        sortOrder: sortDirection,
        count: finalTeams.length
      }
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching teams',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    ensurePrisma();
    const { id } = req.params;
    
    const team = await prisma.team.findUnique({
      where: { id }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Récupérer les scores
    const scores = await prisma.score.findMany({
      where: { teamId: id },
      take: 10,
      orderBy: { completedAt: 'desc' },
      include: {
        challenge: {
          select: {
            title: true,
            category: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Compter séparément
    const scoresCount = await prisma.score.count({
      where: { teamId: id }
    });
    
    const membersCount = await prisma.teamMember.count({
      where: { teamId: id }
    });

    const teamWithDetails = {
      ...team,
      scores,
      scoresCount,
      membersCount
    };

    return res.json({
      success: true,
      data: teamWithDetails,
      message: 'Team fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching team',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createTeam = async (req: Request, res: Response) => {
  try {
    ensurePrisma();
    const { name, description, avatar, initialScore = 0 } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required and must be at least 2 characters'
      });
    }

    const existingTeam = await prisma.team.findUnique({
      where: { name }
    });

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team name already exists'
      });
    }

    const team = await prisma.team.create({
      data: {
        name,
        description: description || null,
        avatar: avatar || null,
        score: Number(initialScore) || 0
      }
    });

    return res.status(201).json({
      success: true,
      data: team,
      message: 'Team created successfully'
    });
  } catch (error: any) {
    console.error('Error creating team:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Team name already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error creating team',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    ensurePrisma();
    const { id } = req.params;
    const { name, description, avatar, score } = req.body;

    const existingTeam = await prisma.team.findUnique({
      where: { id }
    });

    if (!existingTeam) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (name && name !== existingTeam.name) {
      const nameExists = await prisma.team.findUnique({
        where: { name }
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Team name already exists'
        });
      }
    }

    const updateData: any = {
      name: name || existingTeam.name,
      description: description !== undefined ? description : existingTeam.description,
      avatar: avatar !== undefined ? avatar : existingTeam.avatar
    };

    if (score !== undefined) {
      updateData.score = Number(score);
    }

    const team = await prisma.team.update({
      where: { id },
      data: updateData
    });

    return res.json({
      success: true,
      data: team,
      message: 'Team updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating team:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Team name already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error updating team',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    ensurePrisma();
    const { id } = req.params;

    const existingTeam = await prisma.team.findUnique({
      where: { id }
    });

    if (!existingTeam) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    await prisma.team.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting team',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ==================== FONCTIONS DE CLASSEMENT ====================

export const getLeaderboard = async (_req: Request, res: Response) => {
  try {
    ensurePrisma();
    const teams = await prisma.team.findMany({
      orderBy: {
        score: 'desc'
      }
    });

    const teamsWithDetails = await Promise.all(
      teams.map(async (team: any) => {
        const scoresCount = await prisma.score.count({
          where: { teamId: team.id }
        });
        
        const membersCount = await prisma.teamMember.count({
          where: { teamId: team.id }
        });
        
        return {
          ...team,
          scoresCount,
          membersCount
        };
      })
    );

    const rankedTeams = teamsWithDetails.map((team: any, index) => ({
      ...team,
      position: index + 1,
      rank: getRankText(index + 1),
      medal: getMedal(index + 1)
    }));

    const totalPoints = teamsWithDetails.reduce((sum: number, team: any) => sum + (team.score || 0), 0);
    const averageScore = teamsWithDetails.length > 0 ? Math.round(totalPoints / teamsWithDetails.length) : 0;
    const topScore = teamsWithDetails.length > 0 ? teamsWithDetails[0].score : 0;
    const lowestScore = teamsWithDetails.length > 0 ? teamsWithDetails[teamsWithDetails.length - 1].score : 0;

    return res.json({
      success: true,
      data: {
        teams: rankedTeams,
        stats: {
          totalTeams: teamsWithDetails.length,
          totalPoints,
          averageScore,
          topScore,
          lowestScore,
          scoreRange: topScore - lowestScore
        }
      },
      message: 'Leaderboard fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPodium = async (_req: Request, res: Response) => {
  try {
    ensurePrisma();
    const teams = await prisma.team.findMany({
      orderBy: {
        score: 'desc'
      },
      take: 3
    });

    const teamsWithDetails = await Promise.all(
      teams.map(async (team: any) => {
        const scoresCount = await prisma.score.count({
          where: { teamId: team.id }
        });
        
        return {
          ...team,
          scoresCount
        };
      })
    );

    const podium = teamsWithDetails.map((team: any, index) => ({
      ...team,
      position: index + 1,
      rank: getRankText(index + 1),
      medal: getMedal(index + 1)
    }));

    return res.json({
      success: true,
      data: podium,
      message: 'Podium fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching podium:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching podium',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateTeamScore = async (req: Request, res: Response) => {
  try {
    ensurePrisma();
    const { id } = req.params;
    const { points, operation = 'add' } = req.body;

    if (typeof points !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Points must be a number'
      });
    }

    const existingTeam = await prisma.team.findUnique({
      where: { id }
    });

    if (!existingTeam) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const currentScore = existingTeam.score || 0;
    let newScore;
    
    if (operation === 'add') {
      newScore = currentScore + points;
    } else if (operation === 'subtract') {
      newScore = Math.max(0, currentScore - points);
    } else if (operation === 'set') {
      newScore = points;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Operation must be "add", "subtract", or "set"'
      });
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: { score: newScore }
    });

    return res.json({
      success: true,
      data: updatedTeam,
      message: `Team score ${operation === 'add' ? 'increased' : operation === 'subtract' ? 'decreased' : 'set'} successfully`,
      changes: {
        oldScore: currentScore,
        newScore,
        difference: newScore - currentScore
      }
    });
  } catch (error) {
    console.error('Error updating team score:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating team score',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addScoreToTeam = async (req: Request, res: Response) => {
  try {
    ensurePrisma();
    const { teamId } = req.params;
    const { userId, challengeId, points } = req.body;

    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    const pointsToAdd = points || challenge.points;

    const score = await prisma.score.create({
      data: {
        userId,
        teamId,
        challengeId,
        points: pointsToAdd
      },
      include: {
        challenge: true,
        user: true,
        team: true
      }
    });

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { score: (team.score || 0) + pointsToAdd }
    });

    return res.status(201).json({
      success: true,
      data: {
        score,
        team: updatedTeam
      },
      message: 'Score added to team successfully'
    });
  } catch (error: any) {
    console.error('Error adding score:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'User has already completed this challenge'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error adding score',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTeamScores = async (req: Request, res: Response) => {
  try {
    ensurePrisma();
    const { teamId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    const pageSize = parseInt(limit as string);
    const pageNumber = parseInt(page as string);
    const skip = (pageNumber - 1) * pageSize;

    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const [scores, total] = await Promise.all([
      prisma.score.findMany({
        where: { teamId },
        include: {
          challenge: {
            select: {
              title: true,
              category: true,
              points: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.score.count({
        where: { teamId }
      })
    ]);

    return res.json({
      success: true,
      data: {
        scores,
        team,
        pagination: {
          total,
          page: pageNumber,
          totalPages: Math.ceil(total / pageSize),
          hasMore: pageNumber < Math.ceil(total / pageSize)
        }
      },
      message: 'Team scores fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching team scores:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching team scores',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const resetAllScores = async (_req: Request, res: Response) => {
  try {
    ensurePrisma();
    const teams = await prisma.team.findMany();
    
    const updatePromises = teams.map((team: { id: any; }) => 
      prisma.team.update({
        where: { id: team.id },
        data: { score: 0 }
      })
    );
    
    await Promise.all(updatePromises);

    await prisma.score.deleteMany({});

    const updatedTeams = await prisma.team.findMany({
      orderBy: { name: 'asc' }
    });

    return res.json({
      success: true,
      data: updatedTeams,
      message: 'All scores reset to 0'
    });
  } catch (error) {
    console.error('Error resetting scores:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resetting scores',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTeamRank = async (req: Request, res: Response) => {
  try {
    ensurePrisma();
    const { id } = req.params;
    
    const team = await prisma.team.findUnique({
      where: { id }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const allTeams = await prisma.team.findMany({
      orderBy: { score: 'desc' }
    });

    const position = allTeams.findIndex((t: any) => t.id === id) + 1;
    
    const contextSize = 2;
    const start = Math.max(0, position - 1 - contextSize);
    const end = Math.min(allTeams.length, position + contextSize);
    const contextTeams = allTeams.slice(start, end).map((t: any, index: number) => ({
      ...t,
      position: start + index + 1,
      rank: getRankText(start + index + 1),
      isCurrentTeam: t.id === id
    }));

    return res.json({
      success: true,
      data: {
        team: {
          ...team,
          position,
          rank: getRankText(position),
          medal: getMedal(position)
        },
        context: contextTeams,
        totalTeams: allTeams.length,
        scoreDifferenceToNext: position > 1 ? allTeams[position - 2].score - team.score : null,
        scoreDifferenceToPrevious: position < allTeams.length ? team.score - allTeams[position].score : null
      },
      message: 'Team rank fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching team rank:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching team rank',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const exportTeams = async (_req: Request, res: Response) => {
  try {
    ensurePrisma();
    const teams = await prisma.team.findMany({
      orderBy: { score: 'desc' }
    });

    const teamsWithDetails = await Promise.all(
      teams.map(async (team: any) => {
        const scoresCount = await prisma.score.count({
          where: { teamId: team.id }
        });
        
        const membersCount = await prisma.teamMember.count({
          where: { teamId: team.id }
        });
        
        return {
          ...team,
          scoresCount,
          membersCount
        };
      })
    );

    const exportData = {
      teams: teamsWithDetails,
      exportDate: new Date().toISOString(),
      totalTeams: teamsWithDetails.length,
      totalPoints: teamsWithDetails.reduce((sum: number, team: any) => sum + (team.score || 0), 0)
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="teams-export-${Date.now()}.json"`);

    return res.json({
      success: true,
      data: exportData,
      message: 'Teams exported successfully'
    });
  } catch (error) {
    console.error('Error exporting teams:', error);
    return res.status(500).json({
      success: false,
      message: 'Error exporting teams',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const searchTeams = async (req: Request, res: Response) => {
  try {
    ensurePrisma();
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const teams = await prisma.team.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query
            }
          },
          {
            description: {
              contains: query
            }
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: teams,
      message: 'Teams search completed'
    });
  } catch (error) {
    console.error('Error searching teams:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching teams',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTeamsStats = async (_req: Request, res: Response) => {
  try {
    ensurePrisma();
    const totalTeams = await prisma.team.count();
    
    const recentTeams = await prisma.team.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const teams = await prisma.team.findMany();
    const totalPoints = teams.reduce((sum: number, team: any) => sum + (team.score || 0), 0);
    const averageScore = totalTeams > 0 ? Math.round(totalPoints / totalTeams) : 0;

    const stats = {
      totalTeams,
      totalPoints,
      averageScore,
      recentTeams: recentTeams.map((team: any) => ({
        id: team.id,
        name: team.name,
        score: team.score || 0,
        createdAt: team.createdAt
      }))
    };

    return res.json({
      success: true,
      data: stats,
      message: 'Teams statistics fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching teams stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching teams statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const testPrismaConnection = async (_req: Request, res: Response) => {
  try {
    ensurePrisma();
    const teamCount = await prisma.team.count();
    
    const prismaAny = prisma as any;
    const availableModels = Object.keys(prismaAny).filter(key => 
      !key.startsWith('$') && !key.startsWith('_') && 
      typeof prismaAny[key] === 'object'
    );

    return res.json({
      success: true,
      data: {
        connection: 'OK',
        teamCount,
        availableModels,
        prismaVersion: prismaAny._clientVersion || 'Unknown'
      },
      message: 'Prisma connection test successful'
    });
  } catch (error) {
    console.error('Error testing Prisma connection:', error);
    return res.status(500).json({
      success: false,
      message: 'Error testing Prisma connection',
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Make sure your database is running and migrations are applied'
    });
  }
};