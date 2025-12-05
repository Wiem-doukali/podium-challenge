import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Users, Plus, Edit2, Trash2, Trophy, Shield, Download, Bell, Wrench, ExternalLink, UserPlus, Target } from 'lucide-react'
import toast from 'react-hot-toast'

interface Team {
  id: number
  name: string
  score: number
  members: number
  description?: string
  avatar?: string
}

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth()
  const [teams, setTeams] = useState<Team[]>([
    { 
      id: 1, 
      name: 'Les Codeurs Masqués', 
      score: 450, 
      members: 3, 
      description: 'Équipe spécialisée en React et Node.js',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Codeurs'
    },
    { 
      id: 2, 
      name: 'FullStack Warriors', 
      score: 380, 
      members: 3, 
      description: 'Experts en développement full-stack',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Warriors'
    },
    { 
      id: 3, 
      name: 'React Masters', 
      score: 520, 
      members: 3, 
      description: 'Spécialistes React et TypeScript',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Masters'
    },
  ])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [showAddTeamForm, setShowAddTeamForm] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [pointsToAdd, setPointsToAdd] = useState('')

  // Fonction pour ajouter une nouvelle équipe
  const handleAddTeam = () => {
    if (!newTeamName.trim()) {
      toast.error('Veuillez entrer un nom d\'équipe')
      return
    }

    const newTeam: Team = {
      id: teams.length + 1,
      name: newTeamName,
      score: 0,
      members: 0,
      description: 'Description à compléter',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newTeamName)}`
    }
    setTeams([...teams, newTeam])
    setNewTeamName('')
    setShowAddTeamForm(false)
    toast.success(`Équipe "${newTeamName}" créée avec succès`)
  }

  // Fonction pour éditer une équipe
  const handleEditTeam = (teamId: number) => {
    const team = teams.find(t => t.id === teamId)
    if (team) {
      const newName = prompt('Nouveau nom de l\'équipe:', team.name)
      if (newName && newName.trim()) {
        setTeams(teams.map(t => 
          t.id === teamId ? { ...t, name: newName } : t
        ))
        toast.success('Nom modifié avec succès')
      }
    }
  }

  // Fonction pour supprimer une équipe
  const handleDeleteTeam = (teamId: number) => {
    const team = teams.find(t => t.id === teamId)
    if (team && window.confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${team.name}" ?`)) {
      setTeams(teams.filter(t => t.id !== teamId))
      toast.success('Équipe supprimée avec succès')
    }
  }

  // Fonction pour ajouter des points (modal)
  const handleAddPointsClick = (teamId: number) => {
    setSelectedTeamId(teamId)
    setShowPointsModal(true)
    setPointsToAdd('')
  }

  const confirmAddPoints = () => {
    if (!selectedTeamId || !pointsToAdd || isNaN(parseInt(pointsToAdd))) {
      toast.error('Veuillez entrer un nombre valide')
      return
    }

    const points = parseInt(pointsToAdd)
    if (points <= 0) {
      toast.error('Le nombre de points doit être positif')
      return
    }

    setTeams(teams.map(team => {
      if (team.id === selectedTeamId) {
        const newScore = team.score + points
        toast.success(`${points} points ajoutés à ${team.name}. Nouveau score: ${newScore}`)
        return { ...team, score: newScore }
      }
      return team
    }))

    setShowPointsModal(false)
    setPointsToAdd('')
    setSelectedTeamId(null)
  }

  // Fonction pour ajouter des points (bouton Actions Rapides)
  const handleAddPoints = () => {
    const teamIdStr = prompt("Entrez l'ID de l'équipe (1, 2, ou 3) :")
    if (teamIdStr && !isNaN(parseInt(teamIdStr))) {
      const teamId = parseInt(teamIdStr)
      const team = teams.find(t => t.id === teamId)
      if (team) {
        const pointsStr = prompt(`Combien de points ajouter à "${team.name}" ?`, "10")
        if (pointsStr && !isNaN(parseInt(pointsStr))) {
          const points = parseInt(pointsStr)
          if (points > 0) {
            setTeams(teams.map(t => {
              if (t.id === teamId) {
                const newScore = t.score + points
                toast.success(`${points} points ajoutés à ${t.name}. Nouveau score: ${newScore}`)
                return { ...t, score: newScore }
              }
              return t
            }))
          } else {
            toast.error('Le nombre de points doit être positif')
          }
        }
      } else {
        toast.error('Équipe non trouvée')
      }
    }
  }

  // Fonction pour créer un défi
  const handleCreateChallenge = () => {
    const challengeName = prompt('Nom du nouveau défi:')
    if (challengeName && challengeName.trim()) {
      const points = prompt('Points attribués:', '100')
      if (points && !isNaN(parseInt(points))) {
        toast.success(`Défi "${challengeName}" créé avec ${points} points`)
      }
    }
  }

  // Fonction pour exporter les données
  const handleExportData = () => {
    const dataStr = JSON.stringify({
      teams,
      exportDate: new Date().toISOString(),
      totalTeams: teams.length,
      totalPoints: teams.reduce((sum, team) => sum + team.score, 0)
    }, null, 2)
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `podium-challenge-export-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    document.body.appendChild(linkElement)
    linkElement.click()
    document.body.removeChild(linkElement)
    
    toast.success('Données exportées avec succès')
  }

  // Fonction pour basculer les notifications
  const toggleNotifications = () => {
    const newState = !notificationsEnabled
    setNotificationsEnabled(newState)
    toast.success(`Notifications ${newState ? 'activées ✓' : 'désactivées'}`)
  }

  // Fonction pour basculer le mode maintenance
  const toggleMaintenanceMode = () => {
    const newState = !maintenanceMode
    setMaintenanceMode(newState)
    toast.success(`Mode maintenance ${newState ? 'activé ⚠️' : 'désactivé ✓'}`)
  }

  // Fonction pour ajouter un membre
  const handleAddMember = (teamId: number) => {
    const team = teams.find(t => t.id === teamId)
    if (team) {
      const memberName = prompt(`Nom du nouveau membre pour ${team.name}:`)
      if (memberName && memberName.trim()) {
        toast.success(`Membre "${memberName}" ajouté à ${team.name}`)
        // Dans une vraie app, on mettrait à jour l'état
        setTeams(teams.map(t => 
          t.id === teamId ? { ...t, members: t.members + 1 } : t
        ))
      }
    }
  }

  // Fonction pour voir les détails
  const handleViewDetails = (teamId: number) => {
    const team = teams.find(t => t.id === teamId)
    if (team) {
      alert(`Détails de l'équipe:\n\nNom: ${team.name}\nScore: ${team.score}\nMembres: ${team.members}\nDescription: ${team.description}`)
    }
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Shield className="h-16 w-16 text-danger-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès Restreint
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Vous devez être administrateur pour accéder à cette page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête Admin */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="mr-2 text-primary-500" />
            Administration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez les équipes, les défis et le classement du concours.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Équipes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{teams.length}</p>
              </div>
              <Users className="h-10 w-10 text-primary-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Points totaux</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {teams.reduce((sum, team) => sum + team.score, 0).toLocaleString()}
                </p>
              </div>
              <Trophy className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Membres totaux</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {teams.reduce((sum, team) => sum + team.members, 0)}
                </p>
              </div>
              <div className="h-10 w-10 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Score moyen</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {teams.length > 0 
                    ? Math.round(teams.reduce((sum, team) => sum + team.score, 0) / teams.length)
                    : 0
                  }
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Gestion des équipes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Gestion des Équipes
            </h2>
            <button 
              onClick={() => setShowAddTeamForm(!showAddTeamForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle équipe</span>
            </button>
          </div>

          {/* Formulaire d'ajout d'équipe */}
          {showAddTeamForm && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Nom de la nouvelle équipe"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddTeam}
                  className="px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
                >
                  Créer
                </button>
                <button
                  onClick={() => {
                    setShowAddTeamForm(false)
                    setNewTeamName('')
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Équipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Membres</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={team.avatar}
                            alt={`Avatar de ${team.name}`}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-white">{team.name}</div>
                          {team.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{team.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="font-bold">{team.score}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">points</span>
                        <button
                          onClick={() => handleAddPointsClick(team.id)}
                          className="ml-3 px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded hover:bg-primary-200 dark:hover:bg-primary-800/50"
                        >
                          + Ajouter
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                          {team.members} membres
                        </span>
                        <button
                          onClick={() => handleAddMember(team.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                          title="Ajouter un membre"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewDetails(team.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                          title="Voir les détails"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditTeam(team.id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTeam(team.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal pour ajouter des points */}
        {showPointsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Ajouter des points
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Combien de points souhaitez-vous ajouter ?
              </p>
              <input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                placeholder="Nombre de points"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500"
                min="1"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPointsModal(false)
                    setPointsToAdd('')
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmAddPoints}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions rapides et paramètres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Actions rapides */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white flex items-center">
              <Wrench className="mr-2 text-primary-500" />
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button 
                onClick={handleAddPoints}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between group"
              >
                <span>Ajouter des points à une équipe</span>
                <Trophy className="h-4 w-4 text-yellow-500 group-hover:scale-110 transition-transform" />
              </button>
              
              <button 
                onClick={handleCreateChallenge}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between group"
              >
                <span>Créer un nouveau défi</span>
                <Target className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
              </button>
              
              <button 
                onClick={handleExportData}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between group"
              >
                <span>Exporter les données</span>
                <Download className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Paramètres */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white flex items-center">
              <Bell className="mr-2 text-primary-500" />
              Paramètres
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Notifications temps réel</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Recevoir les mises à jour instantanées
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleNotifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  role="switch"
                  aria-checked={notificationsEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Wrench className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Mode maintenance</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Restreindre l'accès public
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleMaintenanceMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  role="switch"
                  aria-checked={maintenanceMode}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
                      setTeams([])
                      toast.success('Toutes les données ont été réinitialisées')
                    }
                  }}
                  className="w-full px-4 py-2 text-red-600 border border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Réinitialiser toutes les données
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage