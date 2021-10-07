import React from "react";
import axios from 'axios';
const url = "https://jsramverk-editor-sohe20.azurewebsites.net";
// const url = "http://localhost:1338";

export class Register extends React.Component {
  constructor(props){
      super(props);
      this.state = {
          email: "",
          password: ""
      }
  }

  sendData = async (event) => {
        await axios.post(`${url}/register`, {
            email: this.state.email,
            password: this.state.password,

        })
        .then(res => {
            this.props.parentCallback(res.data.data);
        })
        .catch(err => {
            console.log(err.detail)
            this.props.parentCallback(err);
        })
    }



    render() {
        return (
            <div className="content register">
                <div className="header">Register</div>
                <form>

                    <label htmlFor="email">Email</label>
                    <input type="text" name="email" placeholder="email" onChange={(e) => this.setState({email: e.target.value})} />
                    <br/>
                    <br/>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" placeholder="password" onChange={(e) => this.setState({password: e.target.value})} />

                </form>
                <button className="save-btn" onClick={this.sendData}>
                Register
                </button>
            </div>
        );
      }
  }
