import Backbtn from "./Backbtn";
import Footer from "./Footer";
const About = () => {
  return (
    
    <>
     <div className="p-5">  <Backbtn/> </div>
    <div className="max-w-4xl mx-auto px-6 py-10">
           
        <h1 className="text-3xl font-bold mb-4">About CityFriend</h1>

      <p className="text-gray-700 mb-4">
        CityFriend is a social platform designed to help people connect with
        others in their city. Whether you are a student, a working professional,
        or new to a place, CityFriend makes it easy to find friends, chat, and
        build meaningful connections.
      </p>

      <p className="text-gray-700 mb-4">
        Our goal is to create a safe, simple, and friendly environment where
        users can discover people nearby, share thoughts, and communicate
        freely without unnecessary complexity.
      </p>

      <p className="text-gray-700">
        CityFriend is built with a focus on privacy, ease of use, and a modern
        social experience inspired by today’s most loved platforms.
      </p>
    </div>

    <Footer/>
    </>
  );
};

export default About;
