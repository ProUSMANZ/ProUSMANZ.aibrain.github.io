import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import './FaceRecognition.css';
import FaceDetection from './components/FaceDetection/FaceDetection';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

const particleOption = {
    particles: {
        number: {
            value: 45,
            density: {
                enable: true,
                value_area: 800
            }
        }
    }
}

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    users: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
}

class FaceRecognition extends Component {
    constructor(props) {
        super(props);
        this.state = initialState;
    }

    loadUser = (data) => {
        this.setState({users: {
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
        }})
    }

    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - (clarifaiFace.right_col * width),
          bottomRow: height - (clarifaiFace.bottom_row * height)
        }
      }
    
      displayFaceBox = (box) => {
        this.setState({box: box});
      }

    inputValueChange = (event) => {
        this.setState({input: event.target.value});
    }

    onSubmitButtton = () => {
        this.setState({imageUrl: this.state.input})
            fetch('http://localhost:3000/imageurl', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    input: this.state.input
                })
            })
            .then(response => response.json())
            .then(response => {
                if(response) {
                    fetch('http://localhost:3000/image', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        id: this.state.users.id
                    })
                })
                    .then(response => response.json())
                    .then(count => {
                        this.setState(Object.assign(this.state.users, {entries: count}))
                    })
                    }
                this.displayFaceBox(this.calculateFaceLocation(response))
            })
            .catch(err => console.log(err));
    }

    onRouteChange = (route) => {
        if(route === 'signout') {
            this.setState(initialState)
        } else if (route === 'home') {
            this.setState({isSignedIn: true})
        }
        this.setState({route: route})
    }

    render() {
        const {isSignedIn, imageUrl, route, box } = this.state;
        return (
            <div>
                <Particles className="particles"
                params={particleOption}/>
                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
                {route === 'home'
                ? <div>
                    <Logo />
                    <Rank 
                        name={this.state.users.name}
                        entries={this.state.users.entries}
                    />
                    <ImageLinkForm 
                        inputValueChange = {this.inputValueChange}
                        onSubmitButtton = {this.onSubmitButtton}
                    />
                    <FaceDetection box={box} imageUrl={imageUrl}/>
                </div> 
                : (route === 'signin' 
                    ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
                    : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
                )
                }
            </div>
        );
    }
}

export default FaceRecognition;