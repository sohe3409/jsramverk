import './App.css';
import TextEditor from "./components/TextEditor";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Sofias Text Editor
        </p>
      </header>
      <div className="editor">
          <TextEditor />
      </div>

    </div>
  );
}

export default App;
