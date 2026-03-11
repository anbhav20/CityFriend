import Backbtn from "./Backbtn";
import Footer from "./Footer";

const PrivacyPolicy = () => {
  return (
    <>
    <div className="p-5">  <Backbtn/> </div>
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

      <p className="text-gray-700 mb-4">
        At CityFriend, your privacy is important to us. This Privacy Policy
        explains how we collect, use, and protect your information.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Information We Collect
      </h2>
      <p className="text-gray-700 mb-4">
        We may collect basic information such as your name, username, email,
        profile picture, city, and messages you choose to send on the platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        How We Use Your Information
      </h2>
      <p className="text-gray-700 mb-4">
        Your information is used to provide and improve our services, enable
        communication between users, and ensure a safe experience.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Data Security
      </h2>
      <p className="text-gray-700 mb-4">
        We take reasonable measures to protect your data. However, no online
        service can guarantee complete security.
      </p>

      <p className="text-gray-700">
        By using CityFriend, you agree to this Privacy Policy.
      </p>
    </div>

    <Footer/>
    </>
  );
};

export default PrivacyPolicy;
