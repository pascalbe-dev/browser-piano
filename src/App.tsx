import { Piano } from './Piano'
import './App.css'

const EMPTY_SET: ReadonlySet<number> = new Set()
const EMPTY_LABELS: ReadonlyMap<string, string> = new Map()

function App() {
  return (
    <main className="app">
      <h1>Browser Piano</h1>
      <div className="stage">
        <Piano
          transpose={0}
          activeKeys={EMPTY_SET}
          keyLabels={EMPTY_LABELS}
          onPress={() => {}}
          onRelease={() => {}}
        />
      </div>
    </main>
  )
}

export default App
