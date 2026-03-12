import MainLayout from '../components/MainLayout'
import MVP from '../components/MVP'

const Settings = () => {
  return (
    <MainLayout>

       <main className='flex-1 min-h-screen'>
        <div className='flex h-full justify-center items-center min-h-screen'>
       <div> <MVP child={"settings"}/>
       <p> (App settings)  uh! dumb!!</p></div>
      </div>
      </main>
    </MainLayout>
  )
}

export default Settings