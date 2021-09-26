import React, { Component, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';

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


    async saveDocument(event) {
        this.mounted = true;
        let regex = /[a-zA-Z]/
        if(this.state.name === "" || regex.test(this.state.name) == false) {
            alert("Add a document name with at least one letter");
        } else {
            if (this.state.status === "new") {
                await axios.post(`https://jsramverk-editor-sohe20.azurewebsites.net/create`, {
                  name: this.state.name,
                  content: this.state.content
                })
            } else {
                this.state.current.content = this.state.content
                await axios.put(`https://jsramverk-editor-sohe20.azurewebsites.net/update/${this.state.current._id}`, {
                  name: this.state.name,
                  content: this.state.content
                })
            }
        }
        await axios.get(`https://jsramverk-editor-sohe20.azurewebsites.net/list`)
          .then(res => {
            const documents = res.data.data;
            this.setState({ documents });
          })
    }

    async handleChange(event) {
        if (event.target.value === "new") {
            await this.setState({status: "new"});
            this.setState({current: {name: "", content: ""}});
        } else {
            await this.setState({status: "edit"});
            this.setState({current: JSON.parse(event.target.value)});
            this.setState({name: this.state.current.name});
        }

        console.log(this.state.current)
    }

    handleName(event) {
        this.setState({name: event.target.value});
    }

    inputHandler = (event, editor) => {
        this.setState({content: editor.getData()});
        console.log(this.state.current.id, this.state.content)

    }

    componentDidMount() {
      this.mounted = true;
      axios.get(`https://jsramverk-editor-sohe20.azurewebsites.net/list`)
        .then(res => {
          const documents = res.data.data;
          this.setState({ documents });
        })
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


                <div>
                    <CKEditor
                      id="inputText"
                      data={this.state.current.content}
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
