import { useState } from 'react'
import react from 'react'
import './App.css'
import { Signin } from './components/sigin.jsx'
import { landing } from './landing.jsx'
import { Dashboard } from './components/dashboard.jsx'
import { Signup } from './components/createaccount.jsx'

function App() {
  // const [count, setCount] = useState(0)


  return (
    <>
      {/* <Signin/>  */}
      {/* <Signup/> */}
      <Dashboard/>
    </>
  )
}

export default App
