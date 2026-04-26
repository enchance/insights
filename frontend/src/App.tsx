import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex justify-center items-center min-h-svh bg-amber-100">
      <h1 className="text-3xl">Hello !world!</h1>
    </div>
  )
}

export default App
