import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Testwise</h1>
        <p className="text-lg text-muted-foreground">Frontend with Shadcn/UI is running!</p>
        <Button onClick={() => alert("It works!")}>Click Me</Button>
      </div>
    </div>
  )
}

export default App