import Backbtn from "../components/Backbtn";
import { Link, useNavigate } from "react-router-dom";
import Navleft from "../components/Navleft";
import useForm from "../hooks/useForm";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const { form, handleChange } = useForm({
    identifier: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Please wait.");

    try {
      const res = await axios.post(
        "https://cityfriend.onrender.com/api/auth/login",
        {
          identifier: form.identifier,
          password: form.password
        },
        {
          withCredentials: true
        }
      );

      toast.update(toastId, {
        render: res.data.message || "Login successful!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      navigate("/home");

    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong";

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
          className="bg-white p-8 w-80 lg:w-[420px] rounded-2xl shadow-md flex flex-col gap-6"
        >
          <div className="mb-6">
            <Navleft />
          </div>

          <input
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            className="py-2 px-4 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400"
            type="text"
            placeholder="Email or Username"
            required
          />

          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            className="py-2 px-4 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400"
            type="password"
            placeholder="Password"
            required
          />

          <button
            type="submit"
            className="mt-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition"
          >
            Login
          </button>

          <div className="text-sm text-center">
            <span className="text-gray-600">
              Don&apos;t have an account?
            </span>{" "}
            <Link className="text-blue-500 font-medium" to="/signup">
              Signup
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;