export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e14] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cn-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cn-secondary/8 blur-[100px]" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cn-tertiary/6 blur-[80px]" />
      
      <div className="relative z-10 w-full max-w-md px-6">
        {children}
      </div>
    </div>
  )
}
