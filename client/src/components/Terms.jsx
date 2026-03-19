import Backbtn from "./Backbtn";
import Footer from "./Footer";
import useAOS from "../hooks/useAOS";

const sections = [
  {
    icon: "👤",
    title: "User Responsibility",
    text: "You are responsible for the content you share. Any abusive, illegal, or harmful behavior may result in account suspension or removal.",
  },
  {
    icon: "🛡️",
    title: "Account Usage",
    text: "You must not misuse the platform, attempt unauthorized access, or interfere with other users' experience.",
  },
  {
    icon: "🔄",
    title: "Changes to Terms",
    text: "CityFriend reserves the right to update these terms at any time. Continued use of the platform means you accept the updated terms.",
  },
];

const Terms = () => {
  useAOS();

  return (
    <>
      {/* Back button */}
      <div className="px-4 sm:px-6 pt-5" data-aos="fade-right">
        <Backbtn />
      </div>

      {/* Hero header */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 border-b border-gray-100">
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
            Terms & Conditions
          </h1>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mt-4 text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
          >
            By accessing or using CityFriend, you agree to comply with these
            Terms and Conditions.
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

        {/* Numbered section cards */}
        <div className="space-y-6">
          {sections.map((s, i) => (
            <div
              key={i}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="relative flex gap-5 p-6 sm:p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
            >
              {/* Step number */}
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

              {/* Subtle index */}
              <span className="absolute top-5 right-5 text-xs font-bold text-gray-200 select-none">
                0{i + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          className="mt-10 p-6 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4 items-start"
        >
          <span className="text-xl flex-shrink-0">⚠️</span>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you do not agree with these terms, please discontinue using
            CityFriend.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Terms;