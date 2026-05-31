import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { authApi } from "@/api"
import { GraduationCap, Eye, EyeOff, Phone, Lock, ArrowLeft, Shield, BookOpen, User, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading"
import { Modal } from "@/components/ui/modal"

const roleConfig = {
  admin: {
    title: "Admin Panel",
    gradient: "from-blue-600 to-cyan-600",
    color: "blue",
    icon: Shield,
    demo: { mobile: "7996812234", password: "Kiran@123" },
    redirect: "/admin/dashboard",
  },
  teacher: {
    title: "Teacher Panel",
    gradient: "from-purple-600 to-pink-600",
    color: "purple",
    icon: BookOpen,
    demo: { mobile: "9000000002", password: "teacher123" },
    redirect: "/teacher/dashboard",
  },
  student: {
    title: "Student Portal",
    gradient: "from-green-600 to-emerald-600",
    color: "green",
    icon: User,
    demo: { mobile: "9000000003", password: "student123" },
    redirect: "/student/dashboard",
  },
}

export default function LoginPage() {
  const { role } = useParams()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const config = roleConfig[role] || roleConfig.admin

  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Forgot password states
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotMobile, setForgotMobile] = useState("")
  const [forgotQuestion, setForgotQuestion] = useState("")
  const [forgotAnswer, setForgotAnswer] = useState("")
  const [forgotNewPassword, setForgotNewPassword] = useState("")
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState("")
  const [forgotSuccess, setForgotSuccess] = useState("")
  const [showForgotNewPass, setShowForgotNewPass] = useState(false)
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false)

  const handleOpenForgot = () => {
    setForgotOpen(true)
    setForgotStep(1)
    setForgotMobile("")
    setForgotQuestion("")
    setForgotAnswer("")
    setForgotNewPassword("")
    setForgotConfirmPassword("")
    setForgotError("")
    setForgotSuccess("")
  }

  const handleForgotStep1 = async (e) => {
    e.preventDefault()
    setForgotError("")
    setForgotLoading(true)
    try {
      const res = await authApi.getForgotPasswordQuestion(forgotMobile)
      setForgotQuestion(res.data.security_question)
      setForgotStep(2)
    } catch (err) {
      setForgotError(err.response?.data?.detail || "Could not retrieve security question. Verify the number is registered and belongs to an admin.")
    } finally {
      setForgotLoading(false)
    }
  }

  const handleForgotStep2 = async (e) => {
    e.preventDefault()
    setForgotError("")
    setForgotSuccess("")

    if (forgotNewPassword.length < 6) {
      setForgotError("Password must be at least 6 characters")
      return
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match")
      return
    }

    setForgotLoading(true)
    try {
      await authApi.resetPassword({
        mobile: forgotMobile,
        security_answer: forgotAnswer,
        new_password: forgotNewPassword
      })
      setForgotSuccess("Password reset successful! You can now log in.")
      setTimeout(() => {
        setForgotOpen(false)
      }, 2500)
    } catch (err) {
      setForgotError(err.response?.data?.detail || "Incorrect security answer or reset failed.")
    } finally {
      setForgotLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await authApi.login({ mobile, password })
      const { access_token, role: userRole, user_id } = res.data
      login(access_token, userRole, user_id)
      const redirectMap = { admin: "/admin/dashboard", teacher: "/teacher/dashboard", student: "/student/dashboard" }
      navigate(redirectMap[userRole] || "/")
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const Icon = config.icon

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={cn("absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-r", config.gradient)} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="glass-card overflow-hidden animate-slide-up">
          {/* Gradient header */}
          <div className={cn("p-8 bg-gradient-to-br text-white", config.gradient)}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/70 uppercase tracking-wider">C.N.Mugalkod Schools</p>
                <h1 className="text-2xl font-bold text-white">{config.title}</h1>
              </div>
            </div>
            <p className="text-white/70 text-sm">Sign in with your mobile number and password to access your portal.</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Mobile */}
              <div className="space-y-1.5">
                <label className="label">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="input pl-10"
                    required
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link - Only for Admin */}
              {role === 'admin' && (
                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={handleOpenForgot}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-400 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white",
                  "bg-gradient-to-r transition-all duration-300",
                  "hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                  config.gradient
                )}
              >
                {loading ? <LoadingSpinner size="sm" /> : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

          </div>
        </div>

        {/* School branding */}
        <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground/60">
          <GraduationCap className="w-4 h-4" />
          <p className="text-xs">C.N.Mugalkod Schools © 2024</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Admin Password Recovery"
        size="md"
      >
        {forgotStep === 1 ? (
          <form onSubmit={handleForgotStep1} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your registered administrator mobile number to retrieve your security question.
            </p>
            <div className="space-y-1.5">
              <label className="label">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={forgotMobile}
                  onChange={(e) => setForgotMobile(e.target.value)}
                  placeholder="Enter your mobile number"
                  className="input pl-10"
                  required
                  maxLength={15}
                />
              </div>
            </div>

            {forgotError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {forgotLoading ? <LoadingSpinner size="sm" /> : null}
              {forgotLoading ? "Verifying..." : "Retrieve Security Question"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotStep2} className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
              <span className="font-semibold text-blue-400 block mb-1">Security Question:</span>
              <span className="text-foreground">{forgotQuestion}</span>
            </div>

            <div className="space-y-1.5">
              <label className="label">Your Answer</label>
              <div className="relative">
                <HelpCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={forgotAnswer}
                  onChange={(e) => setForgotAnswer(e.target.value)}
                  placeholder="Enter your confidential answer"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showForgotNewPass ? "text" : "password"}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showForgotNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showForgotConfirmPass ? "text" : "password"}
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showForgotConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {forgotError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 animate-pulse">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={forgotLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {forgotLoading ? <LoadingSpinner size="sm" /> : null}
                {forgotLoading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => setForgotStep(1)}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
