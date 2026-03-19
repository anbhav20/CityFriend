import React from 'react'

const Button = ({children, className="", ...props}) => {
  return (
   <button {...props}
    className={` mt-4 py-2 px-5 text-white bg-blue-500 scale-105 ease-out hover:bg-blue-600 rounded-xl transition" ${className}`}>
    {children}
   </button>
  )
}

export default Button