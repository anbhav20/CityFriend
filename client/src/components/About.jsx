import Backbtn from "./Backbtn";
import Footer from "./Footer";
import useAOS from "../hooks/useAOS";

const values = [
  {
    icon: "🌆",
    title: "City-First",
    text: "Built around your city, not algorithms. Real proximity, real connections.",
  },
  {
    icon: "🔒",
    title: "Privacy-Focused",
    text: "Your data stays yours. We never sell or misuse your personal information.",
  },
  {
    icon: "✨",
    title: "Simple by Design",
    text: "No clutter, no complexity. Just clean, fast, and friendly.",
  },
];

const About = () => {
  useAOS();

  return (
    <>
      {/* Back button */}
      <div className="px-4 sm:px-6 pt-5" data-aos="fade-right">
        <Backbtn />
      </div>

      {/* Hero header */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-14 sm:py-20 text-center">
          <span
            data-aos="fade-up"
            className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-500 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-5"
          >
            Our Story
          </span>
          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
          >
            About CityFriend
          </h1>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mt-4 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            CityFriend is a social platform designed to help people connect with
            others in their city. Whether you are a student, a working
            professional, or new to a place, CityFriend makes it easy to find
            friends, chat, and build meaningful connections.
          </p>
        </div>
      </div>

      {/* Mission block */}
      <div className="max-w-4xl mx-auto px-6 pt-14 sm:pt-20">
        <div
          data-aos="fade-up"
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-sky-400 p-8 sm:p-10 text-white text-center shadow-lg shadow-blue-100"
        >
          <p className="text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            "Our goal is to create a safe, simple, and friendly environment
            where users can discover people nearby, share thoughts, and
            communicate freely without unnecessary complexity."
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-4xl mx-auto px-6 py-14 sm:py-20">
        <div
          data-aos="fade-up"
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            What We Stand For
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            CityFriend is built with a focus on privacy, ease of use, and a
            modern social experience inspired by today's most loved platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              data-aos="fade-up"
              data-aos-delay={i * 110}
              className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 text-white text-xl shadow-sm mb-4">
                {v.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1.5">
                {v.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default About;