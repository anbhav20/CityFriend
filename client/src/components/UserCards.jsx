 import React from 'react'

const UserCards = ({item}) => {
  return (
    <>
    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                “{item.text}”
              </p>

              <div className="mt-6 flex gap-3">
                <img className="object-center object-cover h-20 w-20 rounded-full"
                src={item.avtar} alt="pfp" />
                <div className='flex flex-col py-2'>
                    <p className="font-semibold text-gray-800">
                    {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                    {item.city}
                    </p>
                </div>
              </div>
    </>
  )
}

export default UserCards