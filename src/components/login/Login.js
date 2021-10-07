import React from "react";
import axios from 'axios';
const url = "https://jsramverk-editor-sohe20.azurewebsites.net";
// const url = "http://localhost:1338";

export class Login extends React.Component {
  constructor(props){
      super(props);
      this.state = {
          email: "",
          password: ""
      }
  }

  sendData = async (event) => {
        await axios.post(`${url}/login`, {
            email: this.state.email,
            password: this.state.password,

        })
        .then(res => {
            console.log("HAAAAAAAALLÅ", res.data.data)
            this.props.parentCallback(res.data.data);
        })
    }



    render() {
        return (

              <div className="content login">
                  <div className="header">Login</div>
                  <form>

                      <label htmlFor="email">Email</label>
                      <input type="text" name="email" placeholder="email" onChange={(e) => this.setState({email: e.target.value})} />
                      <br/>
                      <br/>
                      <label htmlFor="password">Password</label>
                      <input type="password" name="password" placeholder="password" onChange={(e) => this.setState({password: e.target.value})} />

                  </form>
                  <button class="save-btn" onClick={this.sendData}>
                  Login
                  </button>
              </div>

          );
      }
  }

// axios.get(`${ENDPOINT}/list`, {
// headers: {
//     'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlakBoZWouY29tIiwiaWF0IjoxNjMzNDI5ODcxLCJleHAiOjE2MzM1MTYyNzF9.2Cptd_KHWX2yYAR_voJELQGVXgeis6FWp4nFZvYD-7g"
// }
// })
// .then(res => {
//     const documents = res.data.data;
//     this.setState({ documents });
// })
