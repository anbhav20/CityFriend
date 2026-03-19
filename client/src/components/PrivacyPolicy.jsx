import Backbtn from "./Backbtn";
import Footer from "./Footer";
import useAOS from "../hooks/useAOS";

const sections = [
  {
    icon: "📋",
    title: "Information We Collect",
    text: "We may collect basic information such as your name, username, email, profile picture, city, and messages you choose to send on the platform.",
  },
  {
    icon: "⚙️",
    title: "How We Use Your Information",
    text: "Your information is used to provide and improve our services, enable communication between users, and ensure a safe experience.",
  },
  {
    icon: "🔒",
    title: "Data Security",
    text: "We take reasonable measures to protect your data. However, no online service can guarantee complete security.",
  },
];

const PrivacyPolicy = () => {
  useAOS();

  return (
    <>
      {/* Back button */}
      <div className="px-4 sm:px-6 pt-5" data-aos="fade-right">
        <Backbtn />
      </div>

      {/* Hero header */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-sky-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-14 sm:py-20 text-center">
          <span
            data-aos="fade-up"
            className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-500 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-5"
          >
            Legal
          </span>
          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
          >
            Privacy Policy
          </h1>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mt-4 text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
          >
            At CityFriend, your privacy is important to us. This Privacy Policy
            explains how we collect, use, and protect your information.
          </p>
          <p
            data-aos="fade-up"
            data-aos-delay="280"
            className="mt-3 text-xs text-gray-400"
          >
            Last updated: June 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-14 sm:py-20">

        {/* Section cards */}
        <div className="space-y-6">
          {sections.map((s, i) => (
            <div
              key={i}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="group flex gap-5 p-6 sm:p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 text-white text-lg shadow-sm">
                {s.icon}
              </div>

              {/* Text */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1.5">
                  {s.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  {s.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          className="mt-10 p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center"
        >
          <p className="text-sm text-gray-600 leading-relaxed">
            By using CityFriend, you agree to this Privacy Policy.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;