import UserCard from "./UserCard";

const testimonials = [
  {
    profilePic:"https://plus.unsplash.com/premium_photo-1664015982598-283bcdc9cae8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bWVufGVufDB8fDB8fHww",
    username: "Aman Verma",
    city: "Noida",
    text: "I met some really genuine people from my city. The UI is clean and chatting feels instant.",
  },
  {
    profilePic:"https://images.unsplash.com/photo-1692579406317-36d761b3ac39?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVvcGxlJTIwY2hhdHRpbmclMjBpbiUyMHBob25lfGVufDB8fDB8fHww",
    username: "Priya Sharma",
    city: "Delhi",
    text: "Very simple to use and no unnecessary steps. Perfect for making new friends nearby.",
  },
  {
    profilePic:"/user1avatar.avif",
    username: "Rohit Singh",
    city: "Gurgaon",
    text: "Loved the idea of city-based connections. Feels safe and modern.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            What Our Users Say
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Real people. Real connections. Real experiences.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

          {testimonials.map((user, index) => (

            <div
              key={index}
              className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-lg transition"
            >

              {/* User info */}
              <UserCard user={user} />

              {/* Testimonial text */}
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                {user.text}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
};

export default Testimonials;