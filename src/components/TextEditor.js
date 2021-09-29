import React, { Component, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
import socketIOClient from "socket.io-client";
// const ENDPOINT = "http://127.0.0.1:1338";
const ENDPOINT = "https://jsramverk-editor-sohe20.azurewebsites.net";
const socket = socketIOClient(ENDPOINT);


class TextEditor extends Component {
    constructor() {
        super();
        this.state = {
            documents: [],
            current: {},
            content: "",
            status: "new",
            name: ""
        };

        this.handleChange = this.handleChange.bind(this);
        this.saveDocument = this.saveDocument.bind(this);
        this.handleName = this.handleName.bind(this);
    }

    componentDidMount() {
      axios.get(`${ENDPOINT}/list`)
        .then(res => {
          const documents = res.data.data;
          this.setState({ documents });
        })
    }

    componentDidUpdate() {
        socket.on("doc", (data) => {
            if (this.state.content !== data.html) {
                this.setState({ content: data.html });
                console.log("vad händer")
            }
        });
    }

    async saveDocument(event) {
      let regex = /[a-zA-Z]/
      if(this.state.name === "" || regex.test(this.state.name) == false) {
            alert("Add a document name with at least one letter");
        } else {
            if (this.state.status === "new") {
                await axios.post(`${ENDPOINT}/create`, {
                  name: this.state.name,
                  content: this.state.content
                })
            } else {
                this.state.current.content = this.state.content
                await axios.put(`${ENDPOINT}/update/${this.state.current._id}`, {
                  name: this.state.name,
                  content: this.state.content
                })
            }
        }
        await axios.get(`${ENDPOINT}/list`)
          .then(res => {
              const documents = res.data.data;
              this.setState({ documents });
          })
    }

    async handleChange(event) {
        if (event.target.value === "new") {
            await this.setState({status: "new"});
            this.setState({current: {name: "", content: ""}, content: "", name: ""});
        } else {
            await this.setState({status: "edit"});
            this.setState({current: JSON.parse(event.target.value)});
            this.setState({name: this.state.current.name});
            this.setState({content: this.state.current.content});
            socket.emit("create", (this.state.current._id))
        }
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

    render() {
        return (
            <div>
                <div>
                    <label htmlFor="doc-name">Document name: </label>
                    <input id="doc-name" type="text" value={this.state.name} onChange={this.handleName} placeholder="Document name" />
                </div>

                <select id="options" onChange={this.handleChange}>
                    <option disabled={true}>Choose or create a document</option>
                    <option value="new" >Create new</option>
                    {this.state.documents.map((doc) => (
                        <option value={JSON.stringify(doc)}>{doc.name}</option>
                    ))}
                </select>

                <div onKeyUp={this.onKeyPressed}>
                    <CKEditor
                      id="inputText"
                      data={this.state.content}
                      editor={ClassicEditor}
                      onChange={this.inputHandler}
                    />
                </div>

                <button data-testid="saveBtn" onClick={this.saveDocument}>
                    Save
                </button>
            </div>
        );
    }
}

export default TextEditor;
