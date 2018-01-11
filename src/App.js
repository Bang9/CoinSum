import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import {Bounce} from 'react-activity';
import Dots from 'react-activity/lib/Dots';

import gLogo from './images/google.png';
import coinSumLogo from './images/coinsum_logo-03.png'
import v from './images/icon_v.png';
import x from './images/icon_x.png';

import './App.css';
import firebase from './config/firebase';
import coinList from './config/coinList';

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : coinList.filter(lang =>
        lang.name.toLowerCase().slice(0, inputLength) === inputValue ||
        lang.symbol.toLowerCase().slice(0, inputLength) === inputValue
    );
};
const getSuggestionValue = (suggestion,callback) =>{
    callback;
    return suggestion.symbol;
};

const getCoinSrc = (coin) => `https://files.coinmarketcap.com/static/img/coins/64x64/${coin}.png`

const renderSuggestion = (suggestion) => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        {/*<img style={{width:20,height:20,marginRight:5}} src={suggestion.logo}/>*/}
        <img alt={''} style={{width:20,height:20,marginRight:5}} src={getCoinSrc(suggestion.name.toLowerCase())}/>
        {`${suggestion.name}(${suggestion.symbol})`}
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
            portfolioList:[],
            currentPrice:[],
            currentBtcPrice:0,
            customBtcPrice:23000000,
            totalValue:0,
            value:'',
            suggestions: [],
            counter:30
        }
    }

    componentWillMount(){
        this.getCurrentBtcPrice()
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log(user);
                this.setState({
                    userAuthState:true,
                    userInfo:{
                        uid:user.uid,
                        displayName:user.displayName,
                        photoURL:user.photoURL,
                        email:user.email
                    }
                },()=>this.fetchPortfolio())
            } else {
                this.setState({userAuthState:false})
            }
        });

        setInterval(()=>{
            this.setState({counter:this.state.counter-1},
                ()=>{
                    if(this.state.counter==0)
                        this.setState({counter:30},()=>{
                            this.getCurrentBtcPrice();
                            this.fetchPortfolio();
                        })
                })
        },1000)

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

    fetchPortfolio(){
        firebase.database().ref(`/users/${this.state.userInfo.uid}/portfolio`).once('value')
            .then((res)=>{
                let portfolio = res.val();
                if(portfolio) {
                    this.setState({portfolioList: portfolio})
                    portfolio.forEach((elem,index,coins)=>{
                        this.getCurrentPrice(elem,index);
                    })
                }
            })
        console.log(window.innerHeight)
    }

    render() {
        const outView = (
            <div>
                <header className="App-header">
                    <div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <img alt={''} style={{width:60,height:60,marginRight:5}} src={coinSumLogo}/>
                            <h1>Coin Sum</h1>
                        </div>
                        <p style={{}}>Cryptocurrency portfolio</p>
                    </div>
                    <form style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} onSubmit={(ev) => this.login(ev)}>
                        <button style={{display:'flex',backgroundColor:'#fff',width:200,height:45,justifyContent:'center',alignItems:'center',border:'none'}}>
                            <img alt={''} src={gLogo} height="20" width="20" style={{marginRight:5}}/>
                            <p>구글 로그인</p>
                        </button>
                    </form>
                </header>
            </div>
        );
        const { value, suggestions } = this.state;

        // Autosuggest will pass through all these props to the input.
        const inputProps = {
            placeholder: 'Find your coin',
            value,
            onChange: this.onChange
        };

        return (
            <div className="App">
                {
                    this.state.userAuthState ?
                        <div>

                            {/* Coin Sum Header */}
                            <header className="App-header">
                                <div style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,margin:15,fontWeight:'bold'}}>
                                    <img alt={''} style={{width:60,height:60}} src={coinSumLogo}/>
                                    <div style={{marginTop:10}}>Coin Sum</div>
                                </div>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                                    <img alt={''} style={{width:30,height:30,borderRadius:60, margin:10}} src={this.state.userInfo.photoURL}/>
                                    <p>{this.state.userInfo.displayName}</p>
                                    <p style={{fontSize:5}}>{"("+this.state.userInfo.email+")"}</p>
                                </div>
                                <button style={{border:'none', borderRadius:10,height:25,width:60, background:'#52baff',color:'#fff',fontSize:12}} onClick={()=>this.logout()}>로그아웃</button>
                            </header>

                            {/* Coin Search Bar*/}
                            <div style={{display:'flex', alignItems:'center',justifyContent:'center',margin:15}}>
                                <Autosuggest
                                    suggestions={suggestions}
                                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                    getSuggestionValue={(v)=>getSuggestionValue(v,this.addPortfolio(v))}
                                    renderSuggestion={renderSuggestion}
                                    inputProps={inputProps}
                                />
                            </div>

                            {/* Coin Portfoilo List */}
                            <div>
                                {
                                    this.state.portfolioList.map((coin,number)=>{
                                        return (
                                            <div key={number} style={{display:'flex',width:window.innerWidth>700 ? 700:null,margin:'auto',alignItems:'center',justifyContent:'center',padding:10}}>
                                                <div style={{display:'flex',flex:0.3,alignItems:'center',justifyContent:'flex-start',}}>
                                                    <img alt={''} style={{width:20,height:20,marginRight:5}} src={getCoinSrc(coin.name.toLowerCase())}/>
                                                    {`${coin.symbol}`}
                                                </div>
                                                <div style={{display:'flex',flex:1,flexDirection:'column',justifyContent:'center'}}>
                                                    <div style={{display:'flex',justifyContent:'flex-start',alignItems:'center'}}>
                                                        <input
                                                            type="number"
                                                            onChange={(ev)=>this.changePrice(ev,number)}
                                                            value={this.state.portfolioList[number].buyPrice}
                                                            placeholder="0.00000000"
                                                            style={{margin:5,border:'none',borderBottomStyle:'solid',borderBottomWidth:1,borderBottomColor:'#888',marginLeft:40,textAlign:'right'}}></input>
                                                        btc
                                                    </div>
                                                    <div style={{display:'flex',flex:1,justifyContent:'flex-start',alignItems:'center'}}>
                                                        <input
                                                            type="number"
                                                            onChange={(ev)=>this.changeAmount(ev,number)}
                                                            value={this.state.portfolioList[number].amount}
                                                            placeholder="0.00000000"
                                                            style={{margin:5,border:'none',borderBottomStyle:'solid',borderBottomWidth:1,borderBottomColor:'#888',marginLeft:40,textAlign:'right'}}></input>
                                                        amount
                                                    </div>
                                                </div>
                                                <div style={{display:'flex',flex:1,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                                    {
                                                        this.state.currentPrice[number] ?
                                                            <div>
                                                                <div style={{margin:5}}>
                                                                    {`Current price : ${this.state.currentPrice[number]}`}
                                                                </div>
                                                                <div style={{color:this.getRate(number)>0 ? 'green' : this.getRate(number)<0 ? 'red':'black',fontWeight:'bold',margin:5}}>
                                                                    {`${this.getRate(number)}% (${this.getBtc(number)})`}
                                                                </div>
                                                            </div>
                                                            :
                                                            <div>
                                                                <Dots color="#727981" size={10} speed={1} />
                                                            </div>
                                                    }
                                                </div>
                                                <div style={{display:'flex',flex:0.3,justifyContent:'flex-end',alignItems:'center'}}>
                                                    <button
                                                        onClick={()=>this.updatePortfolio()}
                                                        style={{border:'none', backgroundColor:'#a4ff98',width:30,height:30,margin:4}}>
                                                        <img style={{width:20,height:20}} alt="" src={v}/>
                                                    </button>
                                                    <button
                                                        onClick={()=>this.removePortfolio(number)}
                                                        style={{border:'none', backgroundColor:'#ff7474',width:30,height:30,margin:4}}>
                                                        <img style={{width:20,height:20}} alt="" src={x}/>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                <p style={{fontSize:10,marginTop:15}}>{`30초마다 새로운 데이터로 갱신합니다.\n ${this.state.counter}초 남음`}</p>
                                <div style={{height:1,margin:40,backgroundColor:'#ccc'}}/>
                            </div>

                            {/* Coin Sum Result */}
                            {
                                this.getTotalBtc()!='NaN' ?
                                    <div>
                                        <p>{`현재 BTC 갯수 : ${this.getTotalBtc()} btc`}</p>
                                        <p>{`총 평가 금액 : ${(this.state.currentBtcPrice * this.getTotalBtc()).toFixed(0)} 원 (BTC ${Math.floor(this.state.currentBtcPrice)}원 기준)`}</p>

                                        <label>BTC 직접입력 : </label>
                                        <input
                                            type="number"
                                            placeholder="23,000,000원"
                                            onChange={(ev)=>this.changeCustomBtc(ev)}
                                            style={{
                                                textAlign: 'center',
                                                fontSize: 18,
                                                border: 'none',
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#888',
                                                borderBottomStyle: 'solid'
                                            }}
                                        />
                                        <p>{`예상 평가액 : ${Math.floor(this.getTotalBtc()*this.state.customBtcPrice)}원`}</p>
                                    </div>
                                    :
                                    <Dots color="#727981" size={10} speed={1} />
                            }
                        </div>
                        :
                        outView
                }
                {!this.state.userAuthState&&<Dots color="#727981" size={30} style={{position:'absolute',top:10}} speed={1}/>}
            </div>
        );
    }
    changeCustomBtc(ev){
        this.setState({customBtcPrice:ev.target.value})
    }
    getRate(index){
        let rate = this.state.currentPrice[index]/this.state.portfolioList[index].buyPrice*100
        return (rate-100).toFixed(2)
    }
    getBtc(index){
        let btc = (this.state.currentPrice[index]-this.state.portfolioList[index].buyPrice)*this.state.portfolioList[index].amount
        return btc.toFixed(8)
    }
    getTotalBtc(){
        let {portfolioList,currentPrice} = this.state;
        let sum=0;
        portfolioList.forEach((e,i)=>{
            sum+=Number(e.amount*currentPrice[i])
        })
        return sum.toFixed(8);
    }
    getCurrentBtcPrice(){
        fetch(`https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=KRW`)
            .then(result=>{
                return result.json()
            })
            .then(data=>{
                console.log(data[0].price_krw);
                return this.setState({currentBtcPrice:data[0].price_krw});
            })
            .catch((err)=>{
                console.log('fetch failed')
            })
    }
    async getCurrentPrice(coin,index){
        await fetch(`https://api.coinmarketcap.com/v1/ticker/${coin.name.toLowerCase()}/`)
            .then(result=>{
                return result.json()
            })
            .then(data=>{
                let {currentPrice} = this.state;
                currentPrice[index] = data[0].price_btc;
                console.log(data[0].price_btc);
                return this.setState({currentPrice});
            })
            .catch((err)=>{
                console.log('fetch failed')
            })
        // fetch(`https://min-api.cryptocompare.com/data/price?fsym=${coin.symbol}&tsyms=BTC&extraParams=coinSum`)
        //     .then(result=>{return result.json()})
        //     .then(data=>{
        //         let {currentPrice} = this.state;
        //         currentPrice[index] = data.BTC;
        //         console.log(data);
        //         return this.setState({currentPrice});
        //     })
        //     .catch((err)=>{
        //         console.log('fetch failed',err)
        //     })
    }
    changeAmount(ev,index){
        let {portfolioList} = this.state;
        portfolioList[index].amount = ev.target.value;
        this.setState({portfolioList})
    }
    changePrice(ev,index){
        let {portfolioList} = this.state;
        portfolioList[index].buyPrice = ev.target.value;
        this.setState({portfolioList})
    }
    addPortfolio(suggestion){
        let {portfolioList} = this.state;
        let a = [...portfolioList, {...suggestion,'buyPrice':'0.00000000','amount':'0.00000000'}];
        this.setState({portfolioList:a},this.updatePortfolio);
        console.log(this.state)
    };
    updatePortfolio(){
        firebase.database().ref(`/users/${this.state.userInfo.uid}/portfolio`)
            .set(this.state.portfolioList)
            .then(()=>console.log("update success"))
            .catch((err)=>console.log("update failed",err))
    }
    removePortfolio(index){
        let {portfolioList} = this.state;
        portfolioList.splice(index,1);
        this.setState({portfolioList},this.updatePortfolio);
    }

    login(ev){
        console.log('login submit');
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
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

    logout(){
        firebase.auth().signOut()
            .then()
            .catch((err)=>alert('로그아웃 에러'))
    }
}

export default App;
