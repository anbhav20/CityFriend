import {Link} from 'react-router-dom'

const CtaStrip = () => {
  return (
    <>
     <div className="mt-24 text-center bg-gradient-to-r from-blue-600 to-sky-400
          rounded-3xl py-16 px-6 text-white">
          <h3 className="text-2xl lg:text-3xl font-bold">
            Ready to Meet New People?
          </h3>
          <p className="mt-4 text-blue-100">
            Join thousands of users already connecting in their cities.
          </p>

          <Link to='/signup'
            className="inline-flex justify-center items-center mt-8 px-8 py-3 rounded-full font-medium
            bg-white text-blue-600
            hover:scale-105 transition shadow-lg"
          >
            Get Started
          </Link>
        </div>
    </>
   
    
  )
}

export default CtaStrip