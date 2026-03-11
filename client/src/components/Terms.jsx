import Backbtn from "./Backbtn";
import Footer from "./Footer";

const Terms = () => {
  return (
   <>
   <div className="p-5">  <Backbtn/> </div>
    <div className="max-w-4xl mx-auto px-6 py-10">

  
      <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>

      <p className="text-gray-700 mb-4">
        By accessing or using CityFriend, you agree to comply with these Terms
        and Conditions.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        User Responsibility
      </h2>
      <p className="text-gray-700 mb-4">
        You are responsible for the content you share. Any abusive, illegal,
        or harmful behavior may result in account suspension or removal.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Account Usage
      </h2>
      <p className="text-gray-700 mb-4">
        You must not misuse the platform, attempt unauthorized access, or
        interfere with other users’ experience.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Changes to Terms
      </h2>
      <p className="text-gray-700 mb-4">
        CityFriend reserves the right to update these terms at any time.
        Continued use of the platform means you accept the updated terms.
      </p>

      <p className="text-gray-700">
        If you do not agree with these terms, please discontinue using
        CityFriend.
      </p>
    </div>
    <Footer/>
   </>
    
  );
};

export default Terms;
