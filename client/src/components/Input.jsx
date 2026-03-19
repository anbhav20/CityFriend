import React from 'react'

const Input = ({children, classname="", ...props}) => {
  return (
    <div>
        {children}
        <input {...props} className={` py-2 px-4 rounded-lg border w-full  focus:outline-none focus:ring-1 focus:ring-blue-300  ${classname}`} />
    </div>
  )
}

export default Input