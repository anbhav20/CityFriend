import MVP from '../components/MVP'
import MainLayout from '../components/MainLayout'
const Notifications = () => {
  return (
    <MainLayout>
      <main className='flex-1 min-h-screen'>
        <div className='flex justify-center items-center min-h-screen'>
        <MVP child={"Notifications"}/>
      </div>
      </main>
    </MainLayout>
  )
}

export default Notifications