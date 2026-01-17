"use client"

import Link from 'next/link'

export default function Home() {

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 p-4 bg-gray-900">
        {/* Navigation Bar */}
        <nav className='w-full p-4 flex justify-between items-center'>
          <div className='text-2xl font-bold text-white'>
            AI Lifehub
          </div>
          <div className='flex space-x-4'>
            <Link
              href='/login'
              className='px-4 py-2 text-white hover:text-gray-300 transition-colors'
            >
              Login
            </Link>
            <Link
              href='/signup'
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
            >
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Information about the project */}
        <main className='flex-1 flex flex-col items-center justify-center px-4 py-16'>
          <div className="max-w-4xl text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Welcome to AI LifeHub
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your AI-powered productivity assistant
            </p>
            
            <div className="text-gray-400 space-y-4 max-w-2xl mx-auto">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque 
                laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi 
                architecto beatae vitae dicta sunt explicabo.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href='/signup'
              className='px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors'
            >
              Get Started
            </Link>
            <div className='px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg transition-colors'>
              <Link href="/task-manager">Click here for the Task Manager!</Link>
            </div>
          </div>
        </main>

        <footer className="w-full p-6 text-center text-gray-500">
          <p>&copy; 2026 AI LifeHub. All rights reserved.</p>
        </footer>
      </div>  
    </>
  )
}