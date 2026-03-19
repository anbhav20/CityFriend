import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white">
      <div
        className="
          max-w-7xl mx-auto
          px-4 sm:px-6
          py-16 sm:py-20 lg:py-28
          grid grid-cols-1 lg:grid-cols-2
          gap-12 items-center
        "
      >
        {/* TEXT */}
        <div
          data-aos="fade-right"
          className="text-center lg:text-left"
        >
          <h1
            className="
              text-3xl sm:text-4xl lg:text-5xl
              font-bold text-gray-800
              leading-tight
            "
          >
            Meet People Near You <br />
            <span className="text-blue-600">Connect Instantly</span>
          </h1>

          <p
            className="
              mt-4 sm:mt-6
              text-sm sm:text-base
              text-gray-500
              max-w-xl
              mx-auto lg:mx-0
            "
          >
            Discover a new way to connect with people around you, make friends,
            and grow your social circle — city by city.
          </p>

          {/* CTA */}
          <div
            className="
              mt-8 sm:mt-10
              flex flex-col sm:flex-row
              gap-4 justify-center lg:justify-start
            "
          >
            <Link
              to="/signup"
              className="
                px-7 py-3 rounded-full
                text-white font-medium
                bg-gradient-to-r from-blue-600 to-sky-400
                hover:scale-105 transition
                shadow-md
              "
            >
              Join Now
            </Link>

            <Link
              to="/about"
              className="
                px-7 py-3 rounded-full
                font-medium
                border border-blue-500
                text-blue-600
                hover:bg-blue-50 transition
              "
            >
              Learn More
            </Link>
          </div>

          <p className="mt-5 text-xs sm:text-sm text-gray-400">
            Join <span className="font-semibold text-blue-600">45+</span>{" "}
            users and start chatting in your city
          </p>
        </div>

        {/* IMAGE */}
        <div
          data-aos="fade-left"
          data-aos-delay="150"
          className="relative flex justify-center"
        >
          <img
            src="https://s3-alpha.figma.com/hub/file/2610778840/5e9eddd9-5736-4945-9f55-20136583dc94-cover.png"
            alt="people chatting"
            className="
              w-full max-w-xs sm:max-w-sm lg:max-w-lg
              rounded-3xl shadow-xl
              object-cover
            "
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
