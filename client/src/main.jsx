import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './features/auth/AuthContext.jsx'
import { UserProvider } from './features/user/UserContext.jsx'
import { PostProvider } from './features/post/PostContext.jsx'
import { MessageProvider } from './features/messages/MessageContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <UserProvider>
      <PostProvider>
        <MessageProvider>
          <StrictMode>
           <App />
          </StrictMode>
        </MessageProvider>
      </PostProvider>
    </UserProvider>
  </AuthProvider>
)
