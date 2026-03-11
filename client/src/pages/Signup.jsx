import Backbtn from "../components/Backbtn";
import { Link, useNavigate } from "react-router-dom";
import Navleft from "../components/Navleft";
import useForm from "../hooks/useForm";
import axios from "axios";

const Signup = () => {
  const { form, handleChange } = useForm({
    username: "",
    email: "",
    city: "",
    password: "",
    confirmpassword: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation 
    if (form.password !== form.confirmpassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // send only required fields like confirm password mt bhjo
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          username: form.username,
          email: form.email,
          city: form.city,
          password: form.password
        }, {withCredentials:true}
      );

      alert(res.data.message||"Signup successful!");
      navigate("/home");

    } catch (error) {
      alert( error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <>
      <Backbtn />
      <div className="h-120 w-full flex justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="mt-5 p-2 w-80 lg:w-140 gap-5 flex flex-col"
        >
          <div className="mb-10">
            <Navleft />
          </div>

          <input
            name="username"
            onChange={handleChange}
            required
            className="py-2 px-10 rounded-lg border outline-none"
            type="text"
            placeholder="Create Username"
          />

          <input
            name="email"
            onChange={handleChange}
            required
            className="py-2 px-10 rounded-lg border outline-none"
            type="email"
            placeholder="E-mail"
          />

          <input
            name="city"
            onChange={handleChange}
            className="py-2 px-10 rounded-lg border outline-none"
            type="text"
            placeholder="City"
          />

          <input
            name="password"
            onChange={handleChange}
            required
            className="py-2 px-10 rounded-lg border outline-none"
            type="password"
            placeholder="Password"
          />

          <input
            name="confirmpassword"
            onChange={handleChange}
            required
            className="py-2 px-10 rounded-lg border outline-none"
            type="password"
            placeholder="Confirm Password"
          />

          <button className="mt-5 py-2 px-10 text-white bg-blue-500 rounded-2xl">
            Sign Up
          </button>

          <div>
            <span>Already have an account?</span>{" "}
            <Link className="text-blue-500" to="/login">
              Login
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default Signup;
