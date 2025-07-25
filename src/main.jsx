import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SmartGoalPlanner from './challenge-2.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SmartGoalPlanner/>
  </StrictMode>,
)
