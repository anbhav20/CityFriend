import CtaStrip from "./CtaStrip";

const features = [
  {
    title: "Connect Nearby",
    desc: "Find and chat with people from your city or nearby locations in real time.",
    icon: "📍",
  },
  {
    title: "Instant Chats",
    desc: "No waiting. Start conversations instantly with people who are online.",
    icon: "💬",
  },
  {
    title: "Safe & Simple",
    desc: "Clean UI, simple onboarding, and privacy-focused experience.",
    icon: "🔒",
  },
];

const MainSection = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* HEADING */}
        <div
          data-aos="fade-up"
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Why Use Our Platform?
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-500">
            Everything you need to connect with people nearby.
          </p>
        </div>

        {/* CARDS */}
        <div
          className="
            mt-12 sm:mt-16
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
            gap-6 sm:gap-8
          "
        >
          {features.map((item, i) => (
            <div
              key={i}
              data-aos="fade-up"
              data-aos-delay={i * 120}
              className="
                p-6 sm:p-8
                rounded-3xl
                border border-gray-100
                bg-white
                shadow-sm
                hover:shadow-lg
                hover:-translate-y-1
                transition
              "
            >
              <div
                className="
                  w-12 h-12 sm:w-14 sm:h-14
                  flex items-center justify-center
                  rounded-xl
                  bg-gradient-to-r from-blue-500 to-sky-400
                  text-white text-xl
                "
              >
                {item.icon}
              </div>

              <h3 className="mt-5 text-lg sm:text-xl font-semibold text-gray-800">
                {item.title}
              </h3>

              <p className="mt-2 text-sm sm:text-base text-gray-500">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <CtaStrip />
      </div>
    </section>
  );
};

export default MainSection;
