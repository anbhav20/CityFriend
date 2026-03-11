import React from 'react'
import MainLayout from '../components/MainLayout'
import MVP from '../components/MVP'


const Profile = () => {

  return (
    <MainLayout>
      <main className='flex-1 min-h-screen'>
      <div className='flex h-full justify-center items-center'>
        <div><MVP child={"Profile"}/></div>
      </div>
      </main>
    </MainLayout>
  )
}

export default Profile