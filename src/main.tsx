import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { AuthProvider } from './context/AuthContext'
import { ChildrenProvider } from './context/ChildrenContext'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ChildrenProvider>
      <App />
    </ChildrenProvider>
  </AuthProvider>,
)
