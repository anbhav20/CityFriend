import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navleft from "../../../components/Navleft";
import useForm from "../../../hooks/useForm";
import Input from "../../../components/Input";
import Backbtn from "../../../components/Backbtn";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { form, handleChange } = useForm({ identifier: "", password: "" });
  const navigate = useNavigate();
  const { Login } = useAuth(); // ✅ removed loading from context
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ local only

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await Login(form.identifier, form.password);
      navigate("/home");
    } catch {
      // interceptor toast already shown
    } finally {
      setIsSubmitting(false); // ✅ always resets even if login fails
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-sky-50 flex flex-col">
      <div className="px-4 sm:px-6 pt-5">
        <Backbtn />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-7 py-9">
            <div className="mb-7">
              <Navleft />
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Welcome back
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Sign in to continue to CityFriend
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                onChange={handleChange}
                type="text"
                placeholder="Username or Email"
                name="identifier"
                value={form.identifier}
                required
              />
              <Input
                onChange={handleChange}
                type="password"
                placeholder="Password"
                name="password"
                value={form.password}
                required
              />

              <button
                type="submit"
                disabled={isSubmitting} // ✅ local state
                className="mt-1 w-full py-2.5 rounded-xl text-sm font-semibold text-white
                  bg-gradient-to-r from-blue-600 to-sky-400
                  hover:scale-[1.02] active:scale-[0.98] transition shadow-sm shadow-blue-100
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? "Please wait…" : "Login"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-300">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-sm text-center text-gray-500">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-blue-500 font-semibold hover:text-blue-600 transition">
                Sign up
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            By signing in you agree to our{" "}
            <Link to="/terms" className="underline hover:text-gray-600 transition">Terms</Link>{" "}
            &amp;{" "}
            <Link to="/privacy-policy" className="underline hover:text-gray-600 transition">Privacy Policy</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;