import {Link} from 'react-router-dom'

const Navright = () => {
  return (
     <div id="right"
                className='flex tetx-xs lg:gap-10 gap-1 lg:text-md font-semibold'>
                {/* <Link  to='/home'
                className='cursor-pointer hover:text-blue-500 active:text-blue-600 transition'>
                Home</Link> */}
                <Link to='/features'
                 className='cursor-pointer hover:scale-110 '>
                Features</Link>
                <Link to='/community'
                 className='cursor-pointer hover:scale-110 '>
                Community</Link>
                <Link to='/login'
                 className='cursor-pointer hover:scale-110 bg-gray-200 rounded-2xl lg:py-1 lg:px-5'>
                Sign-in</Link>
            </div>
  )
}

export default Navright