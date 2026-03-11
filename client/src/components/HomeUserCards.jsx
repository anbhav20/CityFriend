
const mockUsers=[
  {
    id:0,
    username:'_anbhav',
    avatar:"/public/user1avatar.avif",
    fullName:"Anbhav Singh",
    city:"noida"

  },
  {
    id:1,
    username:'afrah',
    avatar:"/public/user1avatar.avif",
    fullName:"Anbhav Singh",
    city:"delhi"

  },
  {
    id:2,
    username:'abhi',
    avatar:"/public/user1avatar.avif",
    fullName:"Anbhav Singh",
    city:"noida"

  }
]
const HomeUserCards = () => {
  return (
   <>
   <section className="flex flex-col gap-5">
          {mockUsers.map((user) => (
            <article
              key={user.id}
              className="flex items-center justify-between p-6 bg-white  rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              {/* Left: Avatar + Info */}
              <div className="flex items-center gap-5">
                <img
                  src={user.avatar}
                  alt={`${user.username} avatar`}
                  className="h-16 w-16 rounded-full object-cover"
                />

                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {user.username}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {user.fullName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 max-w-md">
                    {user.city}
                  </p>
                </div>
              </div>

              {/* Right: Action */}
              <button
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-full
                           hover:bg-blue-700 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Follow
              </button>
            </article>
          ))}
        </section>
   </>
  )
}

export default HomeUserCards