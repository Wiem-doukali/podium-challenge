import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Users, Target, TrendingUp, Clock, Zap, Award, Star } from 'lucide-react'

const HomePage: React.FC = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

 
  const [stats] = useState({
    totalTeams: 12,
    totalParticipants: 48,
    challengesCompleted: 156,
    averageScore: 325
  })

 
  useEffect(() => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7) 
    const interval = setInterval(() => {
      const now = new Date()
      const difference = endDate.getTime() - now.getTime()

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const topTeams = [
    { name: 'Les Codeurs Masqués', score: 450, trend: 'up' },
    { name: 'React Masters', score: 520, trend: 'up' },
    { name: 'FullStack Warriors', score: 380, trend: 'stable' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm mb-6">
              <Trophy className="h-10 w-10" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Podium Challenge
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Application de gestion de concours pour le BDE MIAGE Paris Cité
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link
                to="/leaderboard"
                className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all"
              >
                Voir le Classement
              </Link>
              <button
                onClick={() => alert('Le concours commence le 15 janvier 2024 !')}
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transform hover:scale-105 transition-all"
              >
                Participer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
                <Clock className="mr-2 text-primary-500" />
                Temps restant avant la fin
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Le concours se termine dans :
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(countdown).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4">
                    <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
                      {value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 capitalize">
                      {key}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi choisir Podium Challenge ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Une plateforme complète pour gérer votre concours de développement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-6">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Classement Temps Réel
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Suivez la progression des équipes en direct avec des mises à jour instantanées grâce à WebSocket.
              </p>
              <button
                onClick={() => window.location.href = '/leaderboard'}
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Explorer le classement →
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/30 rounded-xl mb-6">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Mises à jour instantanées
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                WebSocket pour des notifications en temps réel et une expérience utilisateur fluide.
              </p>
              <button
                onClick={() => alert('Connectez-vous pour recevoir les notifications')}
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Activer les notifications →
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="inline-flex p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-6">
                <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Accessibilité WCAG
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Conforme aux standards d'accessibilité WCAG 2.1 niveau AA pour une inclusion totale.
              </p>
              <button
                onClick={() => alert('Cette application respecte toutes les normes d\'accessibilité')}
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Voir le rapport d'accessibilité →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Statistiques du Concours
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Des chiffres qui parlent d'eux-mêmes
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(stats).map(([key, value]) => {
                const icons = {
                  totalTeams: Users,
                  totalParticipants: Users,
                  challengesCompleted: Target,
                  averageScore: TrendingUp
                }
                const labels = {
                  totalTeams: 'Équipes',
                  totalParticipants: 'Participants',
                  challengesCompleted: 'Défis réalisés',
                  averageScore: 'Score moyen'
                }
                const Icon = icons[key as keyof typeof icons]
                
                return (
                  <div key={key} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                    <div className="inline-flex p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {value.toLocaleString()}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {labels[key as keyof typeof labels]}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Teams Preview */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Top des Équipes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Les meilleures équipes du moment
              </p>
            </div>
            <Link
              to="/leaderboard"
              className="px-6 py-2 text-primary-600 dark:text-primary-400 border border-primary-500 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topTeams.map((team, index) => (
              <div key={team.name} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-800'
                    }`}>
                      {index === 0 ? <Trophy className="h-5 w-5" /> : index + 1}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-gray-900 dark:text-white">{team.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>{team.score} points</span>
                        {team.trend === 'up' && (
                          <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <button
                  onClick={() => alert(`Détails de ${team.name}`)}
                  className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Voir le profil
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage