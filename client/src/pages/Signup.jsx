import Backbtn from "../components/Backbtn";
import { Link, useNavigate } from "react-router-dom";
import Navleft from "../components/Navleft";
import useForm from "../hooks/useForm";
import axios from "axios";
import { toast } from "react-toastify";

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
      toast.error("Passwords do not match!");
      return;
    }

    const toastId = toast.loading("Please wait.");

    try {
      const res = await axios.post(
        "https://cityfriend.onrender.com/api/auth/signup",
        {
          username: form.username,
          email: form.email,
          city: form.city,
          password: form.password
        },
        { withCredentials: true }
      );

      toast.update(toastId, {
        render: res.data.message || "Signup successful!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      navigate("/home");

    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong!";

      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  return (
    <>
      <Backbtn />

      <div className="min-h-screen w-full flex justify-center items-center bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 w-80 lg:w-[450px] rounded-2xl shadow-md flex flex-col gap-3"
        >
          <div className="mb-6">
            <Navleft />
          </div>

          <input
            name="username"
            onChange={handleChange}
            required
            className="py-2 px-4 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400"
            type="text"
            placeholder="Create Username"
          />

          <input
            name="email"
            onChange={handleChange}
            required
            className="py-2 px-4 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400"
            type="email"
            placeholder="E-mail"
          />

          <input
            name="city"
            onChange={handleChange}
            className="py-2 px-4 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400"
            type="text"
            placeholder="City"
          />

          <input
            name="password"
            onChange={handleChange}
            required
            className="py-2 px-4 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400"
            type="password"
            placeholder="Password"
          />

          <input
            name="confirmpassword"
            onChange={handleChange}
            required
            className="py-2 px-4 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400"
            type="password"
            placeholder="Confirm Password"
          />

          <button className="mt-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition">
            Sign Up
          </button>

          <div className="text-sm text-center">
            <span className="text-gray-600">
              Already have an account?
            </span>{" "}
            <Link className="text-blue-500 font-medium" to="/login">
              Login
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default Signup;