db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    {
      role: 'readWrite',
      db: 'podium_challenge'
    }
  ]
});

db = db.getSiblingDB('podium_challenge');

// Créer des collections
db.createCollection('users');
db.createCollection('teams');
db.createCollection('challenges');
db.createCollection('activities');
db.createCollection('configs');

// Créer des index
db.teams.createIndex({ name: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.configs.createIndex({ key: 1 }, { unique: true });
db.activities.createIndex({ teamId: 1 });
db.activities.createIndex({ createdAt: -1 });

print('Base de données MongoDB initialisée');