import './App.css';
import Video from './components/video/video';
import VideoCall from './components/videocall/videocall';
import {BrowserRouter as Router,Route} from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <h1 align="center">Health Connect</h1>
      <Router>
        <Route exact path="/startcall">
          <VideoCall />
        </Route>
        <Route exact path="/call/:roomId">
            <Video />
        </Route>
      </Router>
    </div>
  );
}

export default App;
