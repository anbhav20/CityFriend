import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './features/auth/AuthContext.jsx'
import { UserProvider } from './features/user/UserContext.jsx'
import { PostProvider } from './features/post/PostContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <UserProvider>
      <PostProvider>
        <StrictMode>
         <App />
      </StrictMode>
      </PostProvider>
    </UserProvider>
  </AuthProvider>
)
