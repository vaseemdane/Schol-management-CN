import { useNavigate } from "react-router-dom"
import { Shield, BookOpen, User, ArrowRight, GraduationCap, Star, Sparkles, ShieldCheck, BarChart3, Smartphone, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

const roles = [
  {
    id: "admin",
    title: "Admin Panel",
    description: "Complete school management — students, teachers, fees, analytics, certificates and more.",
    icon: Shield,
    linear: "from-blue-600 via-blue-500 to-cyan-500",
    bgGlow: "glow-blue",
    border: "border-blue-500/30 hover:border-blue-400/60",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    badgeText: "Full Access",
    path: "/login/admin",
    features: ["Student & Teacher Management", "Fee & Salary Tracking", "Analytics & Reports", "Certificate Generator"],
  },
  {
    id: "teacher",
    title: "Teacher Panel",
    description: "Mark attendance, manage exam results, track student performance with detailed analytics.",
    icon: BookOpen,
    linear: "from-purple-600 via-purple-500 to-pink-500",
    bgGlow: "glow-purple",
    border: "border-purple-500/30 hover:border-purple-400/60",
    badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    badgeText: "Teacher Access",
    path: "/login/teacher",
    features: ["Attendance Management", "Result Entry & Edit", "Student Analytics", "Class Overview"],
  },
  {
    id: "student",
    title: "Student / Parent Panel",
    description: "View attendance, performance, fee status, and download reports and certificates.",
    icon: User,
    linear: "from-green-600 via-emerald-500 to-teal-500",
    bgGlow: "glow-green",
    border: "border-green-500/30 hover:border-green-400/60",
    badge: "bg-green-500/15 text-green-300 border-green-500/30",
    badgeText: "View Only",
    path: "/login/student",
    features: ["Attendance Tracking", "Performance Charts", "Fee Summary", "Report Downloads"],
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background bg-grid overflow-x-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-green-600/8 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 border-b border-border/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg leading-tight">C N Mugalkhod Group of Institutions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground hidden sm:block">System Online</span>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative text-center px-6 pt-20 pb-16 animate-fade-in" aria-labelledby="hero-heading">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">School ERP v1.0</span>
          </div>

          <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
            C N Mugalkhod English and Kannada Medium School , Mudalagi
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-4">
            Bringing The Future to You
          </p>



        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/login/admin')}
            className="btn btn-primary px-6 py-3 shadow-lg shadow-blue-500/20"
          >
            Explore the ERP
          </button>
          <a href="#roles" className="btn btn-secondary px-6 py-3">
            Browse Panels
          </a>
        </div>

        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm text-muted-foreground max-w-4xl mx-auto">
          {["500+ Students", "50+ Teachers", "Real-time Analytics", "Secure & Fast"].map((item) => (
            <li key={item} className="inline-flex items-center gap-2 justify-center rounded-full border border-border/20 bg-card/70 px-4 py-2">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>

      {/* Role Cards */}
      <section id="roles" className="relative z-10 px-6 md:px-12 pb-20" aria-labelledby="roles-heading">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-[0.28em] text-primary/80 mb-3">Select your workspace</p>
            <h2 id="roles-heading" className="text-3xl md:text-4xl font-bold text-foreground">Role-driven access for every school user</h2>
            <p className="text-muted-foreground mt-3">Fast login flows for administrators, teachers, and students with visually distinctive dashboards and secure controls.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <RoleCard key={role.id} role={role} delay={index * 100} onLogin={() => navigate(role.path)} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-border/30">
        <p className="text-muted-foreground text-sm">
          built by vaseem 9738176663 vaseemdange.ac.in@gmail.com
        </p>
      </footer>
    </div>
  )
}

function RoleCard({ role, delay, onLogin }) {
  return (
    <div
      className={cn(
        "group relative glass-card border-2 transition-all duration-300 cursor-pointer overflow-hidden",
        role.border,
        role.bgGlow,
        "animate-slide-up hover:scale-[1.02] hover:-translate-y-1"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* linear top bar */}
      <div className={cn("h-1.5 w-full bg-linear-to-r", role.linear)} />

      <div className="p-7">
        {/* Icon */}
        <div className={cn(
          "w-14 h-14 rounded-2xl bg-linear-to-br flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300",
          role.linear
        )}>
          <role.icon className="w-7 h-7 text-white" />
        </div>

        {/* Badge */}
        <div className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border mb-3", role.badge)}>
          {role.badgeText}
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-foreground mb-3">{role.title}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">{role.description}</p>

        {/* Features */}
        <ul className="space-y-2 mb-6">
          {role.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={cn("w-1.5 h-1.5 rounded-full bg-linear-to-r", role.linear)} />
              {feature}
            </li>
          ))}
        </ul>

        {/* Login button */}
        <button
          onClick={onLogin}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-linear-to-r transition-all duration-300",
            "hover:shadow-lg hover:shadow-current/20 hover:gap-3",
            role.linear
          )}
        >
          Login to {role.title.split(" ")[0]} Panel
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
        </button>
      </div>
    </div>
  )
}
