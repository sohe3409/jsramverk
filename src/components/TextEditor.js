import React, { Component, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
import socketIOClient from "socket.io-client";
import html2pdf from 'html2pdf.js'
// const ENDPOINT = "https://jsramverk-editor-sohe20.azurewebsites.net";
const ENDPOINT = "http://localhost:1338";
const socket = socketIOClient(ENDPOINT);


class TextEditor extends Component {
    constructor() {
        super();
        this.state = {
            status: "new",
            invite: "",
            mode: ["text", "code"],
            current: {},
            documents: [],
            users: [],
            titles: [],
            id: "",
            runCode: "",
            content: "",
            name: "",
            allow: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleUsers = this.handleUsers.bind(this);
        this.saveDocument = this.saveDocument.bind(this);
        this.getDocs = this.getDocs.bind(this);
        this.save = this.save.bind(this);
        this.pdf = this.pdf.bind(this);
        this.invite = this.invite.bind(this);
        this.runCode = this.runCode.bind(this);
    }

    componentWillMount() {
        axios.post(`${ENDPOINT}/graphql`, {
            query: "{ users { email } }"
        })
        .then(data => {
            const users = data.data.data.users;
            console.log("DATA", data.data.data.users)
            users.map((user) => {
                if (user.email !== this.props.user) {
                    this.state.users.push(user.email)
                }
            });
            this.state.allow.push(this.props.user);
            console.log("USER CHOOSE",this.state.users)
            console.log("USER ALLOW",this.state.allow)
        })
        .then(this.getDocs());
    }

    componentDidUpdate() {
        socket.on("doc", (data) => {
            if (this.state.content !== data.html) {
                this.setState({ content: data.html });
            }
        });
    }

    getDocs = () => {
        axios.get(`${ENDPOINT}/list/${this.props.user}`, {
            headers: {
                'x-access-token': this.props.token
            }
        })
        .then(res => {
            const documents = res.data.data;
            const id = res.data.id;
            this.setState({ documents });
            this.setState({ id });
            this.state.documents.map((doc) => (
                this.state.titles.push(doc.name)
            ))
        })
    }

    saveDocument(event) {
      return new Promise((resolve, reject) => {
        let regex = /[a-zA-Z]/
        if(this.state.name === "" || regex.test(this.state.name) == false) {
              alert("Add a document name with at least one letter");
        } else {
            if (this.state.status === "new") {
                if ( this.state.titles.includes(this.state.name)) {
                    alert("There is already a document with this name");
                } else {
                        axios.put(`${ENDPOINT}/create/${this.state.id}`, {
                        doc: {
                            name: this.state.name,
                            content: this.state.content,
                            mode: this.state.mode[0],
                            allowed_users: this.state.allow
                        },
                        headers: {
                            'x-access-token': this.props.token
                        }
                    })
                }
            } else {
                this.state.current.content = this.state.content
                    axios.put(`${ENDPOINT}/update/${this.state.id}`, {
                    prev: this.state.current.name,
                    doc: {
                        name: this.state.name,
                        content: this.state.content,
                        mode: this.state.mode[0],
                        allowed_users: this.state.allow
                    },
                    headers: {
                        'x-access-token': this.props.token
                    }
                })
            }
        }
        return resolve();
    })}

    async handleChange(event) {
        await this.getDocs();
        if (event.target.value === "new") {
            await this.setState({status: "new"});
            this.setState({current: {name: "", content: ""}, content: "", name: "", allow: [this.props.user]});
        } else {
            await this.setState({status: "edit"});
            await this.setState({current: JSON.parse(event.target.value)});
            this.setState({content: this.state.current.content});
            if (this.state.current.mode == "code") {
                await this.setState({mode: ["code", "text"]})
                await this.setState({content: this.state.current.content});
            } else {
                this.setState({mode: ["text", "code"]})
            }
            this.setState({name: this.state.current.name});
            this.setState({allow: this.state.current.allowed_users});

            socket.emit("create", (this.state.current.name))
        }
    }

    handleUsers(event) {
        if ( this.state.allow.includes(event.target.value)) {
            alert("Already shared with ths user");
        } else {
            this.state.allow.push(event.target.value);
        }
        console.log("ALLOW", this.state.allow)
    }

    inputHandler = (event, editor) => {
        this.setState({content: editor.getData()});
    }

    onKeyPressed = () => {
        let data = {
            name: this.state.current.name,
            html: this.state.content
        };
        socket.emit("doc", data);
    }

    save() {
        this.saveDocument().then(this.getDocs());
    }

    invite(event) {
        event.preventDefault();
        return new Promise((resolve, reject) => {
        let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/
        if(event.target.email.value === "" || regex.test(event.target.email.value) == false) {
              alert("This is not a valid email address");
        }
        let message = `Hello friend! I would like to invite you to edit the document, "${this.state.name}". Register or login at: https://www.student.bth.se/~sohe20/editor/`
        axios.post(`${ENDPOINT}/contact`, {
            headers: {
               'Content-type': 'application/json'
            },
            body: {
                from: this.props.user,
                to: event.target.email.value,
                subject: `Invite to join document, Sofias text editor`,
                text: message
            }
        })

        if ( this.state.allow.includes(event.target.email.value)) {
            alert("Already shared with ths user");
        } else {
            this.state.allow.push(event.target.email.value);
        }
        console.log("ALLOW", this.state.allow)
        this.setState({ invite: ""})
        this.saveDocument();
        return resolve();

      })};

    pdf() {
       const element = this.state.content;
       const opt = {
           margin: 1,
           filename: `${this.state.name}`,
           image: { type: 'png', quality: 0.98 },
           html2canvas: { scale: 2 },
           jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
       };
       html2pdf( element, opt );
    }

    runCode = () => {
      console.log(this.state.content)
      var data = {
          code: btoa(this.state.content)
      };

      fetch("https://execjs.emilfolino.se/code", {
          body: JSON.stringify(data),
          headers: {
              'content-type': 'application/json'
          },
          method: 'POST'
      })
      .then(response => {
          return response.json();
      })
      .then(result => {
          let content = atob(result.data);
          this.setState({runCode: content});
      });
    }

    render() {
        let share;
        let invite;
        let editor;

        if (this.state.status == "new") {
            share = (
                <select style={{width: "208px", height: "30px", marginTop: "10px"}} id="options" onChange={this.handleUsers}>
                    <option disabled={true} selected>Share with users</option>
                    {this.state.users.map((user) => (
                        (<option value={user}>{user}</option>)
                    ))}
                </select>
            )
        }

        if (this.state.invite == "active") {
            invite = (
                <div className="invite">
                    <form style={{width: "80%", float: "right"}} onSubmit={this.invite}>
                        <label>Enter the email-address of the person you want to share with: </label>
                        <input type="text" name="email" />
                        <button type="submit" class="btn">Invite</button>
                    </form>
                    <button className="x-btn" onClick={() => this.setState({ invite: ""})}>X</button>
                </div>
            )
        }

        if (this.state.mode[0] == "code") {
          editor = (
            <div>
              <div class="code-mode" onKeyUp={this.onKeyPressed}>
                  <CodeMirror
                      value={this.state.content}
                      height="700px"
                      width="700px"
                      extensions={[javascript({ jsx: true })]}
                      onChange={(value, viewUpdate) => {
                          this.setState({content: value})
                          console.log('value:', this.state.content);
                      }}
                  />
                  <div className="exec">
                      {this.state.runCode}
                  </div>
              </div>
                  <button className="run-btn" onClick={this.runCode}>run code</button>
              </div>
            )
         } else {
             editor = (
               <div class="text-editor" onKeyUp={this.onKeyPressed}>
                   <CKEditor
                       id="inputText"
                       data={this.state.content}
                       editor={ClassicEditor}
                       onChange={this.inputHandler}
                       onReady={(editor) => {
                           editor.editing.view.change((writer) => {
                               writer.setStyle({
                                   height: "800px",
                                   width: "50vw",
                                   padding: "2em 4em"
                               }, editor.editing.view.document.getRoot()
                           )});
                       }}
                   />
               </div>
             )
         }

        return (
            <div>
                <div class="choice">
                    {invite}
                    <label style={{width: "200px", marginBottom: "10px"}} htmlFor="doc-name">Document name: </label><br/>
                    <input style={{width: "200px", height: "25px", marginBottom: "10px"}} id="doc-name" type="text" value={this.state.name} onChange={() => this.setState({name: event.target.value})} placeholder="Document name" />
                    <br/>
                    <select style={{width: "208px", height: "30px", marginRight: "5px"}} id="options" onChange={this.handleChange}>
                        <option disabled={true}>Choose or create a document</option>
                        <option value="new" >Create new</option>
                        {this.state.documents.map((doc) => (
                            <option value={JSON.stringify(doc)}>{doc.name}</option>
                        ))}
                    </select>

                    {share}
                    <div className="buttons">
                        <button class="save-btn" onClick={this.pdf}>
                            Download as pdf
                        </button>

                        <button class="save-btn" onClick={this.save}>
                            Save
                        </button>

                        <button class="save-btn" onClick={() => this.setState({ invite: "active"})}>
                            Invite
                        </button>

                        <button class="save-btn" style={{width: "110px"}} onClick={() => this.setState({mode: [this.state.mode[1], this.state.mode[0]]})}>
                            {this.state.mode[1]} mode
                        </button>
                    </div>
                </div>
                {editor}
            </div>
        );
    }
}

export default TextEditor;
