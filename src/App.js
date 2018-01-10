import React, { Component } from 'react';
import gLogo from './images/google.png';
import './App.css';
import firebase from './config/firebase';
import Autosuggest from 'react-autosuggest';
import coinList from './config/coinList';

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : coinList.filter(lang =>
        lang.name.toLowerCase().slice(0, inputLength) === inputValue
    );
};
const getSuggestionValue = (suggestion) => suggestion.name;

const renderSuggestion = (suggestion) => (
    <div>
        {suggestion.name}
    </div>
);


class App extends Component {
    constructor(props){
        super(props);
        this.state={
            userAuthState:false,
            userInfo:{
                uid:'',
                displayName:'',
                photoURL:'',
                email:''
            },
            inputSymbol:{

            },
            value:'',
            suggestions: []
        }
        this.uid = 'TEST_USER_UID'
    }

    componentWillMount(){
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({
                    userAuthState:true,
                    userInfo:{
                        uid:user.uid,
                        displayName:user.displayName,
                        photoURL:user.photoURL,
                        email:user.email
                    }
                })
            } else {
                this.setState({userAuthState:false})
            }
        });
    }

    onChange = (event, { newValue }) => {
        this.setState({
            value: newValue
        });
    };

    // Autosuggest will call this function every time you need to update suggestions.
    // You already implemented this logic above, so just use it.
    onSuggestionsFetchRequested = ({ value }) => {
        this.setState({
            suggestions: getSuggestions(value)
        });
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    render() {
        const outView = (
            <div>
                <header className="App-header">
                    <div>
                        <h1>Coin Sum</h1>
                        <p style={{}}>Cryptocurrency portfolio</p>
                    </div>
                    <form style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} onSubmit={(ev) => this.handleSubmit(ev)}>
                        <button style={{display:'flex',backgroundColor:'#fff',width:200,height:45,justifyContent:'center',alignItems:'center',border:'none'}}>
                            <img src={gLogo} height="20" width="20" style={{marginRight:5}}/>
                            <p>구글 로그인</p>
                        </button>
                    </form>
                </header>
            </div>
        );
        const { value, suggestions } = this.state;

        // Autosuggest will pass through all these props to the input.
        const inputProps = {
            placeholder: 'Type a programming language',
            value,
            onChange: this.onChange
        };

        return (
            <div className="App">
                {
                    this.state.userAuthState ?
                        <div>
                            <header className="App-header">
                                <h1>Coin Sum</h1>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                                    <img style={{width:30,height:30,borderRadius:60, margin:10}} src={this.state.userInfo.photoURL}/>
                                    <p>{this.state.userInfo.displayName}</p>
                                    <p style={{fontSize:5}}>{"("+this.state.userInfo.email+")"}</p>
                                </div>
                                <button style={{border:'none', borderRadius:10,height:25,width:60, background:'#52baff',color:'#fff',fontSize:12}} onClick={()=>this.logout()}>로그아웃</button>
                            </header>

                            <div style={{display:'flex', alignItems:'center',justifyContent:'center'}}>
                                <div>
                                    <Autosuggest
                                        suggestions={suggestions}
                                        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                        getSuggestionValue={getSuggestionValue}
                                        renderSuggestion={renderSuggestion}
                                        inputProps={inputProps}
                                    />
                                    <button onClick={() => this.update()}>등록</button>
                                </div>
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
        console.log('handle submit')
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
        ev.preventDefault();
    }

    update(){
        firebase.database().ref(`users/${this.uid}`).set({'hi':'bye'})
            .then(()=>console.log("update success"))
            .catch((err)=>console.log("update failed",err))
    }

    logout(){
        firebase.auth().signOut()
            .then()
            .catch((err)=>alert('로그아웃 에러'))
    }
}

export default App;
