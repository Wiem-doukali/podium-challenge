import express from 'express';
import cors from 'cors';
import teamRoutes from './routes/team.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/teams', teamRoutes);

// Health check
app.get('/api/health', async (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Podium Challenge API',
    version: '1.0.0'
  });
});

// API Stats
app.get('/api/stats', async (_req, res) => {
  try {
    res.json({
      success: true,
      data: {
        service: 'Podium Challenge API',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        endpoints: [
          { method: 'GET', path: '/api/health', description: 'Health check' },
          { method: 'GET', path: '/api/stats', description: 'API statistics' },
          { method: 'GET', path: '/api/teams', description: 'Get all teams' },
          { method: 'GET', path: '/api/teams/:id', description: 'Get team by ID' },
          { method: 'POST', path: '/api/teams', description: 'Create new team' },
          { method: 'PUT', path: '/api/teams/:id', description: 'Update team' },
          { method: 'DELETE', path: '/api/teams/:id', description: 'Delete team' },
          { method: 'GET', path: '/api/teams/search', description: 'Search teams' },
          { method: 'GET', path: '/api/teams/stats', description: 'Teams statistics' },
          { method: 'GET', path: '/api/teams/test', description: 'Test Prisma connection' },
          { method: 'GET', path: '/api/teams/schema', description: 'Check Prisma schema' }
        ]
      },
      message: 'API statistics fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching API stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Welcome route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Podium Challenge API',
    documentation: 'Available endpoints:',
    endpoints: {
      health: 'GET /api/health',
      stats: 'GET /api/stats',
      teams: {
        getAll: 'GET /api/teams',
        getById: 'GET /api/teams/:id',
        create: 'POST /api/teams',
        update: 'PUT /api/teams/:id',
        delete: 'DELETE /api/teams/:id',
        search: 'GET /api/teams/search?query=...',
        stats: 'GET /api/teams/stats',
        test: 'GET /api/teams/test',
        schema: 'GET /api/teams/schema'
      }
    },
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    suggestion: 'Check the documentation at GET /'
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Documentation: http://localhost:${PORT}/`);
  console.log(`Teams API: http://localhost:${PORT}/api/teams`);
});