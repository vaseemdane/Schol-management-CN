import { useState, useEffect } from "react"
import { authApi } from "@/api"
import { useAuthStore } from "@/store/authStore"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FormField, Input, Select } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading"
import { User, KeyRound, HelpCircle, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function Settings() {
  const { user, login } = useAuthStore()
  const [currentUser, setCurrentUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Username form states
  const [newUsername, setNewUsername] = useState("")
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [usernameSuccess, setUsernameSuccess] = useState("")

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  // Security Question form states
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [customQuestion, setCustomQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionError, setQuestionError] = useState("")
  const [questionSuccess, setQuestionSuccess] = useState("")

  const recoveryQuestions = [
    "What is your school name?",
    "What was the name of your first school?",
    "What was the name of your first pet?",
    "In what city were you born?",
    "What is your favorite book?",
    "Custom Question"
  ]

  // Fetch current user details on mount
  const fetchUserDetails = async () => {
    try {
      setLoadingUser(true)
      const res = await authApi.me()
      setCurrentUser(res.data)
      setNewUsername(res.data.mobile)
      if (recoveryQuestions.includes(res.data.security_question)) {
        setSecurityQuestion(res.data.security_question || "")
      } else if (res.data.security_question) {
        setSecurityQuestion("Custom Question")
        setCustomQuestion(res.data.security_question)
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err)
    } finally {
      setLoadingUser(false)
    }
  }

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const handleUpdateUsername = async (e) => {
    e.preventDefault()
    setUsernameError("")
    setUsernameSuccess("")

    const usernameTrimmed = newUsername.trim()
    if (!usernameTrimmed) {
      setUsernameError("Username (mobile number) cannot be empty")
      return
    }
    if (!/^\d+$/.test(usernameTrimmed) || usernameTrimmed.length < 10 || usernameTrimmed.length > 15) {
      setUsernameError("Username must be a valid 10-15 digit mobile number")
      return
    }

    setUsernameLoading(true)
    try {
      const res = await authApi.updateUsername({ new_username: usernameTrimmed })
      setUsernameSuccess("Username updated successfully!")
      // Sync auth state if token is valid (it uses user ID, so login function keeps session active)
      const token = localStorage.getItem("access_token")
      login(token, res.data.role, res.data.id)
      setCurrentUser(res.data)
    } catch (err) {
      setUsernameError(err.response?.data?.detail || "Failed to update username")
    } finally {
      setUsernameLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (!currentPassword) {
      setPasswordError("Please enter your current password")
      return
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setPasswordLoading(true)
    try {
      await authApi.updatePassword({ current_password: currentPassword, new_password: newPassword })
      setPasswordSuccess("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleUpdateSecurityQuestion = async (e) => {
    e.preventDefault()
    setQuestionError("")
    setQuestionSuccess("")

    const finalQuestion = securityQuestion === "Custom Question" ? customQuestion.trim() : securityQuestion
    const finalAnswer = securityAnswer.trim()

    if (!finalQuestion) {
      setQuestionError("Please select or write a security question")
      return
    }
    if (!finalAnswer) {
      setQuestionError("Security answer cannot be empty")
      return
    }

    setQuestionLoading(true)
    try {
      await authApi.updateSecurityQuestion({
        security_question: finalQuestion,
        security_answer: finalAnswer
      })
      setQuestionSuccess("Security question & answer updated successfully!")
      setSecurityAnswer("")
      fetchUserDetails()
    } catch (err) {
      setQuestionError(err.response?.data?.detail || "Failed to update security question")
    } finally {
      setQuestionLoading(false)
    }
  }

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground mt-4 text-sm">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="page-container max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">Account Settings</h1>
        <p className="section-subtitle">Manage your administrator login credentials and account recovery options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username card */}
        <Card className="glass-card shadow-xl border border-border/40 hover:border-blue-500/30 transition-all duration-300">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Change Username</CardTitle>
                <CardDescription className="text-xs">Update your login mobile number</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <FormField label="Current Username (Mobile)">
                <Input value={currentUser?.mobile || ""} disabled className="bg-muted/50 cursor-not-allowed opacity-80" />
              </FormField>

              <FormField label="New Username (Mobile)">
                <Input
                  type="tel"
                  placeholder="Enter 10-15 digit mobile number"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  maxLength={15}
                  required
                />
              </FormField>

              {usernameError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{usernameError}</span>
                </div>
              )}

              {usernameSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{usernameSuccess}</span>
                </div>
              )}

              <Button type="submit" disabled={usernameLoading} className="w-full">
                {usernameLoading ? "Updating..." : "Update Username"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Question card */}
        <Card className="glass-card shadow-xl border border-border/40 hover:border-purple-500/30 transition-all duration-300">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Account Recovery</CardTitle>
                <CardDescription className="text-xs">Setup a security question for password recovery</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateSecurityQuestion} className="space-y-4">
              <FormField label="Security Question">
                <Select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} required>
                  <option value="">Select a question</option>
                  {recoveryQuestions.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </Select>
              </FormField>

              {securityQuestion === "Custom Question" && (
                <FormField label="Write your custom question">
                  <Input
                    placeholder="Enter your security question"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    required
                  />
                </FormField>
              )}

              <FormField label="Answer">
                <Input
                  type="password"
                  placeholder="Enter your confidential answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                />
              </FormField>

              {questionError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{questionError}</span>
                </div>
              )}

              {questionSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{questionSuccess}</span>
                </div>
              )}

              <Button type="submit" disabled={questionLoading} className="w-full">
                {questionLoading ? "Saving..." : "Save Question"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Password card */}
      <Card className="glass-card shadow-xl border border-border/40 hover:border-pink-500/30 transition-all duration-300">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Change Password</CardTitle>
              <CardDescription className="text-xs">Update and strengthen your login password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Current Password">
                <div className="relative">
                  <Input
                    type={showCurrentPass ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>

              <FormField label="New Password">
                <div className="relative">
                  <Input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>

              <FormField label="Confirm New Password">
                <div className="relative">
                  <Input
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={passwordLoading} className="px-6">
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
