import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from './config/firebase';

class App extends Component {
    constructor(props){
        super(props);
        this.state={
            userAuthState:false,
            symbol:{}
        }
        this.uid = 'TEST_USER_UID'
    }
    componentWillMount(){
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({userAuthState:true})
            } else {
                this.setState({userAuthState:false})
            }
        });
    }
    render() {
        const outView = (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <p>로그인해주세요</p>
                <form style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} onSubmit={(ev) => this.handleSubmit(ev)}>
{/*                    <div>
                    <label>아이디</label>
                    <input type="text" value={this.state.value} onChange={(ev) => this.handleChange(ev)}/>
                    </div>
                    <div>
                        <label>패스워드</label>
                        <input type="text" value={this.state.value} onChange={(ev) => this.handleChange(ev)}/>
                    </div>*/}
                    <button style={{backgroundColor:'red',width:150,height:30,border:'none'}}>구글 로그인</button>
                </form>
            </div>
        );
        return (
            <div className="App">
                {
                    this.state.userAuthState ?
                        <div>
                            <header className="App-header">
                                <img src={logo} className="App-logo" alt="logo"/>
                                <h1 className="App-title">Welcome to React</h1>
                            </header>

                            <div>
                                <input type="text" value={this.state.value} onChange={(ev) => this.handleChange(ev)}/>
                                <button onClick={() => this.update()}>등록</button>
                            </div>
                        </div>
                        :
                        outView
                }
            </div>
        );
    }

    handleChange(ev){
        let eventValue = ev.target.value;
        this.setState({symbol:eventValue});
    }
    handleSubmit(ev){
        var provider = new firebase.auth.GoogleAuthProvider();
        //provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            console.log(user,token)

        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;

            console.log(errorCode,errorMessage,email,credential)
        });
        //ev.preventDefault();
    }

    update(){
        firebase.database().ref(`users/${this.uid}`).set({'hi':'bye'})
            .then(()=>console.log("update success"))
            .catch((err)=>console.log("update failed",err))
    }
}

export default App;
