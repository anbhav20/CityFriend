import Navleft from './Navleft'
import Navright from './Navright'

    export const Header = () => {
    return (
        <div className='lg:px-6 lg:py-5 h-15 flex justify-between items-center border-gray-200 shadow-md'>
            <Navleft/>
            <Navright/>
        </div>
    )
    }
