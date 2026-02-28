import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import MetaPanel from './components/MetaPanel'

export default function App() {
  return (
    <div className="flex h-screen w-screen bg-[var(--bg-primary)] relative">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden">
        <Editor />
      </main>
      <MetaPanel />
    </div>
  )
}
