import React from 'react'
import { Trophy, Github } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo et copyright */}
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold text-gray-800 dark:text-white">
              Podium Challenge
            </span>
            <span className="text-gray-500 dark:text-gray-400">•</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} BDE MIAGE Paris Cité
            </span>
          </div>

          {/* Liens */}
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              À propos
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>

          {/* WCAG Badge */}
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
              ♿ WCAG 2.1 AA
            </div>
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
              🚀 Full-Stack
            </div>
          </div>
        </div>

        {/* Note d'accessibilité */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cette application respecte les standards d'accessibilité WCAG 2.1 niveau AA.
            Pour signaler un problème d'accessibilité, contactez-nous.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer