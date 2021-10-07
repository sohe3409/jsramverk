import './App.css';
import React from "react";
import TextEditor from "./components/TextEditor";
import { Login} from "./components/login/Login";
import { Register } from "./components/login/Register";

class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            token: null,
            user: "",
            message: "",
        }
    }

    handleLogin = (childData) =>{
        this.setState({token: childData.token, user: childData.user.email, message: childData.detail})
        console.log(this.state.user, this.state.token, this.state.message)
    }

    handleRegister = (childData) =>{
        this.setState({message: childData.detail})
        console.log(this.state.message)
    }

    render() {
        if (this.state.token) {
            return (
                <div className="App">
                    <header className="App-header">
                        <p>
                          Sofias Text Editor
                        </p>
                    </header>
                    <div>
                        <TextEditor user = {this.state.user} token = {this.state.token} />
                    </div>
                </div>
            )
        } else {
            return (
                <div className="App">
                    <header className="App-header">
                        <p>
                            Sofias Text Editor
                        </p>
                    </header>
                    <div className="base-container">
                        <Login parentCallback = {this.handleLogin} />
                        <Register parentCallback = {this.handleRegister} />
                    </div>
                    <p className="message">{this.state.message}</p>
                </div>
            );
        }
    }
}

export default App;
