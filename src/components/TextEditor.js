import React, { Component, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
import socketIOClient from "socket.io-client";
// const ENDPOINT = "http://localhost:1338";
const ENDPOINT = "https://jsramverk-editor-sohe20.azurewebsites.net";
const socket = socketIOClient(ENDPOINT);


class TextEditor extends Component {
    constructor() {
        super();
        this.state = {
            status: "new",
            current: {},
            documents: [],
            users: [],
            titles: [],
            id: "",
            content: "",
            name: "",
            allow: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleUsers = this.handleUsers.bind(this);
        this.saveDocument = this.saveDocument.bind(this);
        this.handleName = this.handleName.bind(this);
        this.getDocs = this.getDocs.bind(this);
        this.save = this.save.bind(this);
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
            console.log(this.state.users)
        })
        .then(this.getDocs());
    }

    componentDidUpdate() {
        socket.on("doc", (data) => {
            if (this.state.content !== data.html) {
                this.setState({ content: data.html });
                console.log("vad händer")
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

    async saveDocument(event) {
        let regex = /[a-zA-Z]/
        if(this.state.name === "" || regex.test(this.state.name) == false) {
              alert("Add a document name with at least one letter");
        } else {
            if (this.state.status === "new") {
                if ( this.state.titles.includes(this.state.name)) {
                    alert("There is already a document with this name");
                } else {
                    await axios.put(`${ENDPOINT}/create/${this.state.id}`, {
                        doc: {
                            name: this.state.name,
                            content: this.state.content,
                            allowed_users: this.state.allow
                        },
                        headers: {
                            'x-access-token': this.props.token
                        }
                    })
                }
            } else {
                this.state.current.content = this.state.content
                await axios.put(`${ENDPOINT}/update/${this.state.id}`, {
                    prev: this.state.current.name,
                    doc: {
                        name: this.state.name,
                        content: this.state.content,
                        allowed_users: this.state.allow
                    },
                    headers: {
                        'x-access-token': this.props.token
                    }
                })
            }
        }
    }

    async handleChange(event) {
        await this.getDocs();
        if (event.target.value === "new") {
            await this.setState({status: "new"});
            this.setState({current: {name: "", content: ""}, content: "", name: "", allow: []});
        } else {
            await this.setState({status: "edit"});
            this.setState({current: JSON.parse(event.target.value)});
            this.setState({name: this.state.current.name});
            this.setState({content: this.state.current.content});
            this.setState({allow: this.state.current.allowed_users});
            socket.emit("create", (this.state.current._id))
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

    handleName(event) {
        this.setState({name: event.target.value});
    }

    inputHandler = (event, editor) => {
        this.setState({content: editor.getData()});
    }

    onKeyPressed = () => {
        let data = {
            _id: this.state.current._id,
            html: this.state.content
        };

        socket.emit("doc", data);
    }

    save() {
        this.saveDocument().then(this.getDocs());
    }


    render() {
        console.log("rendering")
        let share;
        if (this.state.status == "new") {
            share = (
              <select style={{width: "208px", height: "30px", marginLeft: "5px"}} id="options" onChange={this.handleUsers}>
              <option disabled={true} selected>Share with users</option>
              {this.state.users.map((user) => (
                (<option value={user}>{user}</option>)
              ))}
              </select>
            )
        }
        return (
            <div>
                <div class="choice">
                    <label style={{width: "200px", marginBottom: "10px"}} htmlFor="doc-name">Document name: </label><br/>
                    <input style={{width: "200px", height: "25px", marginBottom: "10px"}} id="doc-name" type="text" value={this.state.name} onChange={this.handleName} placeholder="Document name" />
                    <br/>
                    <select style={{width: "208px", height: "30px"}} id="options" onChange={this.handleChange}>
                        <option disabled={true}>Choose or create a document</option>
                        <option value="new" >Create new</option>
                        {this.state.documents.map((doc) => (
                            <option value={JSON.stringify(doc)}>{doc.name}</option>
                        ))}
                    </select>

                    {share}
                    <button class="save-btn" onClick={this.getDocs}>
                        Update
                    </button>

                    <button class="save-btn" onClick={this.save}>
                        Save
                    </button>
                </div>



                <div class="text-editor" onKeyUp={this.onKeyPressed}>
                    <CKEditor
                        id="inputText"
                        data={this.state.content}
                        editor={ClassicEditor}
                        onChange={this.inputHandler}
                        onReady={(editor) => {
                            editor.editing.view.change((writer) => {
                            writer.setStyle(
                                "height",
                                "600px",
                                editor.editing.view.document.getRoot()
                            );
                            });
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default TextEditor;
