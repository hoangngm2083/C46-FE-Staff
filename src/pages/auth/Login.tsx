import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHospital,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaStar,
} from "react-icons/fa6";
import useAuthService from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, account } = useAuthService({
    accountName: accountName,
    password: password,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const { isError, error: loginError } = await login.refetch();
      if (isError) {
        throw loginError;
      }

      const { data: accountData } = await account.refetch();

      const userRole = accountData?.role;

      if (userRole === "ADMIN") {
        navigate("/admin");
      } else if (userRole === "MANAGER") {
        navigate("/manager");
      } else if (userRole === "DOCTOR") {
        navigate("/doctor");
      } else if (userRole === "RECEPTIONIST") {
        navigate("/receptionist");
      } else {
        navigate("/");
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to sign in. Please try again.";

      if (error.status === 400 || error.response?.status === 400) {
        errorMessage = "Tài khoản hoặc mật khẩu không đúng";
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white antialiased relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-900/50 to-slate-900"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl mb-6 shadow-2xl shadow-blue-500/25">
              <FaHospital className="w-10 h-10 text-slate-900" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent mb-3">
              Đăng nhập
            </h1>
            {/* <p className="text-lg text-slate-300 leading-relaxed">
              Access your professional healthcare dashboard
            </p> */}
          </div>

          {/* Form Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-200">
                  Account
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-300">
                    <FaEnvelope className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập tên tài khoản"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-slate-400 outline-none transition-all duration-300 focus:border-blue-400 focus:bg-white/10 focus:shadow-lg focus:shadow-blue-400/20"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-200">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-300">
                    <FaLock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-slate-400 outline-none transition-all duration-300 focus:border-blue-400 focus:bg-white/10 focus:shadow-lg focus:shadow-blue-400/20"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-4 h-4" />
                    ) : (
                      <FaEye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300 hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-center text-red-400 text-sm">{error}</div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!accountName || !password || isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-slate-900 font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <FaArrowRight className="w-5 h-5" />
                    <span>Đăng nhập</span>
                    <FaStar className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-slate-400">
              Secure access to your healthcare workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
