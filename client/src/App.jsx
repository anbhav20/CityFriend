import Login from './pages/Login'
import Signup from './pages/Signup'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Notifications from './pages/Notifications'
import Chats from './pages/Chats'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Search from './pages/Search'
import About from './components/About'
import PrivacyPolicy from './components/PrivacyPolicy'
import Terms from './components/Terms'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFound from './pages/NotFound'

const App = () => {
  return (

     <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing/>}/>
      <Route path='/home' element={<Home/>} />
      <Route path ='/login' element={<Login/>} />
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/search' element={<Search/>}/>
      <Route path='/chats' element={<Chats/>}/>
      <Route path='/settings' element={<Settings/>}/>
      <Route path='/:username' element={<Profile/>}/>
      <Route path='/notifications' element={<Notifications/>}/>
      <Route path="/about" element={<About />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound/>}/>
      
      {/* <Route path='/learn-more' element={<About/>}/> */}
      
    </Routes>
  </BrowserRouter>
     </>
  )
}

export default App