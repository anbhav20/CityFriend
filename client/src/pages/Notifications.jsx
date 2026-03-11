import MVP from '../components/MVP'
import MainLayout from '../components/MainLayout'
const Notifications = () => {
  return (
    <MainLayout>
      <main className='flex-1 min-h-screen'>
        <div className='flex h-full justify-center items-center'>
        <MVP child={"Notifications"}/>
      </div>
      </main>
    </MainLayout>
  )
}

export default Notifications