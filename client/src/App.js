import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';



class PlaylistCounter extends Component {
  render () {

    return (
      <div style = {{width: '40%', display : 'inline-block', color : '#68D962'}}>
        <h2> {this.props.playlists.length} playlists </h2>
      </div>
    );
  }
}
class HoursCounter extends Component {
  render () {
    let allSongs = this.props.playlists.reduce( (songs, eachPlaylist) => {
      return songs.concat(eachPlaylist.songs)
    }, [])
    let totalDuration = allSongs.reduce((sum, eachSong) => {
      return sum + eachSong.duration
    }, 0)
    return (
      <div style = {{width: '40%', display : 'inline-block', color : '#68D962'}}>
        <h2> {Math.round(totalDuration/60)} hours </h2>
      </div>
    );
  }
}

class Playlist extends Component {
  render () {
    let playlist = this.props.playlist;
    return (
      <div style = {{width : '25%', display: 'inline-block'}}> 
        <img src={playlist.imageUrl}  style = {{width : '150px'}}/>
        <h3>{playlist.name}</h3>
        <ul>
          {playlist.songs.map(song =>
            <li>{song.name}</li>
          )}          
        </ul>
      </div>
    );
  }
}



class App extends Component {

  constructor () {
    super();
    this.state = {
      serverData: {}
  }
  }
  componentDidMount () {
    let parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;

    if (!accessToken)
        return;
    fetch ('https://api.spotify.com/v1/me', 
    {headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(data => this.setState({
        user: {
          name: data.display_name
        }
    })) 
    
    fetch ('https://api.spotify.com/v1/me/playlists', 
    {headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(data => this.setState({
      playlists: data.items.map(item => {
        return {
        name: item.name,
        imageUrl: item.images[0].url,
        songs: []
        }
        
      })
    }))
  }
  render () {
    let playlistToRender = 
    this.state.user && 
    this.state.playlists  
      ? this.state.playlists : []
    return (
      <div className="App">
        
        {this.state.user ?
        <div>
        <h1 style = {{'font-size': '60px'}}>  
          {this.state.user.name}'s Playlist 
        </h1>
       
        
        <PlaylistCounter playlists = {playlistToRender}/>
        <HoursCounter playlists = {playlistToRender}/>
        {playlistToRender.map(playlist => 
           <Playlist playlist = {playlist} />
        )}
        </div> : <button onClick ={() => window.location = 'http://localhost:8888/login' }
          style={{padding:'20px', fontSize:'50px', marginTop:'20px'}}> Sign in with Spotify</button>

        }
      </div>
   );
 }
}

export default App;
