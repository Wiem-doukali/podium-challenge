import React from 'react'
import { Trophy, Users, TrendingUp, Award } from 'lucide-react'
import { useSocket } from '../contexts/SocketContext'

const LeaderboardPage: React.FC = () => {
  const { leaderboard, isConnected } = useSocket()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Classement en Temps Réel
          </h1>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isConnected ? 'text-success-600' : 'text-danger-600'}`}>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success-500 animate-pulse' : 'bg-danger-500'}`}></div>
              <span className="font-medium">
                {isConnected ? 'Connecté en temps réel' : 'Hors ligne'}
              </span>
            </div>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              {leaderboard.length} équipes participantes
            </span>
          </div>
        </div>

        {/* Podium */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Trophy className="mr-2 text-yellow-500" />
            Podium
          </h2>
          
          <div className="flex items-end justify-center space-x-4 md:space-x-8 h-72">
            {/* 2ème place */}
            {leaderboard[1] && (
              <div className="flex flex-col items-center flex-1 max-w-40">
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-t-2xl h-48 flex flex-col items-center justify-end p-4">
                  <div className="mb-4">
                    <Award className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-gray-800 dark:text-white">{leaderboard[1].name}</p>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{leaderboard[1].score}</p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>
                <div className="w-full bg-gray-400 dark:bg-gray-500 h-8 flex items-center justify-center">
                  <span className="text-white font-bold">2ème</span>
                </div>
              </div>
            )}

            {/* 1ère place */}
            {leaderboard[0] && (
              <div className="flex flex-col items-center flex-1 max-w-48">
                <div className="w-full bg-yellow-100 dark:bg-yellow-900/30 rounded-t-2xl h-56 flex flex-col items-center justify-end p-4">
                  <div className="mb-6">
                    <Trophy className="w-16 h-16 text-yellow-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl text-gray-900 dark:text-white">{leaderboard[0].name}</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{leaderboard[0].score}</p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>
                <div className="w-full bg-yellow-500 h-10 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">1er</span>
                </div>
              </div>
            )}

            {/* 3ème place */}
            {leaderboard[2] && (
              <div className="flex flex-col items-center flex-1 max-w-40">
                <div className="w-full bg-amber-200 dark:bg-amber-900/30 rounded-t-2xl h-40 flex flex-col items-center justify-end p-4">
                  <div className="mb-2">
                    <Award className="w-10 h-10 text-amber-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-gray-800 dark:text-white">{leaderboard[2].name}</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{leaderboard[2].score}</p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>
                <div className="w-full bg-amber-400 h-6 flex items-center justify-center">
                  <span className="text-white font-bold">3ème</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tableau du classement */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <TrendingUp className="mr-2" />
              Classement Complet
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Équipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Membres
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
      
                {leaderboard.map((team: { id: React.Key | null | undefined; avatar: string | undefined; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; score: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; members: string[] }, index: number) => (
                  <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                          index === 2 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800' :
                          'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {team.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={team.avatar}
                              alt={`Avatar de ${team.name}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {team.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {team.score}
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">pts</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {team.members.slice(0, 3).map((member: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm"
                          >
                            {member}
                          </span>
                        ))}
                        {team.members.length > 3 && (
                          <span className="inline-block bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-sm">
                            +{team.members.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage