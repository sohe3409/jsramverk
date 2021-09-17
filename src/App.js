import './App.css';
import TextEditor from "./components/TextEditor";


function App() {

const app = (
    <div>
        <header className="App-header">
          <p>
            Sofias Text Editor
          </p>
        </header>

        <div className="editor">
            <TextEditor />
        </div>
    </div>
)

  return (
    <div className="App">
        {app}
    </div>
  );
}

export default App;
