import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';


// Number of playlist


class PlaylistCounter extends Component {
  render () {

    return (
      <div style = {{width: '40%', display : 'inline-block', color : '#68D962'}}>
        <h2> {this.props.playlists.length} playlists </h2>
      </div>
    );
  }
}

// Hours of listening songs

/* class HoursCounter extends Component {
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
} */

// Playlist's name and image

class Playlist extends Component {
  render () {
    let playlist = this.props.playlist;
    return (
      <div style = {{width : '25%', display: 'inline-block'}}> 
        <img src={playlist.imageUrl}  style = {{width : '150px'}}/>
        <h3>{playlist.name}</h3>
        <ol>
          {playlist.songs.map(song =>
            <li>{song.name}</li>
          )}          
        </ol>
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
    
    fetch ('https://api.spotify.com/v1/me/playlists', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
      .then(playlistData => {
         let playlists = playlistData.items
         let trackDataPromises =  playlists.map(playlist => {
         let responsePromise = fetch(playlist.tracks.href, {
          headers: {'Authorization': 'Bearer ' + accessToken}
          })
          let trackDataPromise = responsePromise
            .then(response=> response.json())
          return trackDataPromise
        })
          let allTracksDataPromises = 
          Promise.all(trackDataPromises)
          let playlistsPromise = allTracksDataPromises.then(trackDatas => {
          trackDatas.forEach((trackData, i)=> {
            playlists[i].trackDatas = trackData.items.map(item => item.track.artists[0])
          })
          return playlists
          })
          return playlistsPromise
      })
    .then(playlists => this.setState({
      playlists: playlists.map(item => {
        console.log(item.trackDatas)
        return {
        name: item.name,
        imageUrl: item.images[0].url,
        songs: item.trackDatas.slice(0,5).map(trackData => ({
          name : trackData.name
        }))
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
       
        <h3> <PlaylistCounter playlists = {playlistToRender}/> </h3>

        {/* <HoursCounter playlists = {playlistToRender}/> */}
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
