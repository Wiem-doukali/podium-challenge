import React from 'react'
import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-danger-100 dark:bg-danger-900/30 rounded-full mb-4">
            <AlertCircle className="h-12 w-12 text-danger-600 dark:text-danger-400" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Page non trouvée
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Code d'erreur: 404_NOT_FOUND</p>
            <p className="mt-2">Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage