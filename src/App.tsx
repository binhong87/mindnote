import Sidebar from './components/Sidebar'
import Editor from './components/Editor'

export default function App() {
  return (
    <div className="flex h-screen w-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden">
        <Editor />
      </main>
    </div>
  )
}
