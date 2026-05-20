import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  	return (
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="rounded-2xl bg-white p-6 shadow">
				<h1 className="text-3xl font-bold text-blue-700">
					Radia Frontend Ready
				</h1>
				<p className="mt-2 text-slate-600">
					React Vite Tailwind setup is working.
				</p>
			</div>
		</div>
	)
}

export default App
