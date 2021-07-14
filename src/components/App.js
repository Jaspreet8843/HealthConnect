import React, {useEffect, useRef} from 'react';
import './App.css';

function App() {
  const myID = useRef('');                                  //stores current user ID
  const toUserRef = useRef();                               //stores ID of the other user
  const messageRef = useRef();                              //stores data from message input field
  const peer = useRef(new window.peerjs.Peer());            //peer object. ID changes each time it runs.
  const conn = useRef();                                    //connection object gets generated once connection is established
  const receivedMessage = useRef('');                       //stores received message data
  const connections = useRef([]);                           //if more than 1 incomming connection then it gets stored in array(only useful for sending)
  const myVideo = useRef();                                 //mediaStream (video) of current user
  const receivedVideo = useRef();                           //mediaStrean (video) of other user
  const calls = useRef();                                   //calls object generated once (video)call made or received
  const notification = useRef();                            //handles notifications

//######################## USE EFFECT ###########################

  useEffect(()=>{


    navigator.mediaDevices.getUserMedia({                   //fetches data from mediaDevices (webcam and mic)
      video : {exact:{height:360}},
      audio : true
    })
    .then(stream =>{ 
      myVideo.current.srcObject = stream;                   //initialises myVideo with audio and video tracks
    });

    //-------------------------------------------

    peer.current.on('open', function(id) {
      
      myID.current.innerHTML = id;                          //displays current user's peer ID on the page
      
      peer.current.on('call', function(call) {                //executes in the event a call is in progress (received)
        calls.current=call;
        calls.current.answer(myVideo.current.srcObject);      //answers the call and passes current user's video stream
        onReceiveStream();                                    //sets receivedVideo video output element to the received stream
      });

      peer.current.on('connection', function(connection){     //event when connection is received
        conn.current=connection;                              //start connection
        connections.current.push(connection);
        SendReceive();
        toUserRef.current.value=conn.current.peer;
      });

    });

  },[]);
  
//####################### FUNCTIONS ############################

  function SendReceive(){
    conn.current.on('open',()=>{
      notification.current.innerHTML = "CONNECTION ESTABLISHED";             //notifies user that connection is established
      setTimeout(() => { notification.current.innerHTML = ""}, 4000);        //hides the notification after 4 secs
      conn.current.on('data', function(data){
        receivedMessage.current.innerText = "Received: "+data;                //displays received data
      })
    })
    conn.current.on('close', () => {
        receivedVideo.current.style.display="none";                            //hides video element
        notification.current.innerHTML = "CONNECTION CLOSED";                  //notifies user that connection is closed
        setTimeout(() => { notification.current.innerHTML = ""}, 4000);        //hides the notification after 4 secs
      })
  }

  //-------------------------------------------

  function onReceiveStream(){
    receivedVideo.current.style.display="inline";                  //unHide the received video element
    calls.current.on('stream', function(stream){
      receivedVideo.current.srcObject = stream;                    //displays received video
    });

    calls.current.on('close', () => {
      receivedVideo.current.style.display="none";                   //hides video element
      notification.current.innerHTML = "CALL ENDED";                          //notifies user that call has ended
      setTimeout(() => { notification.current.innerHTML = ""}, 4000);        //hides the notification after 4 secs
    })
  }

//######################### HANDLERS ##########################

  const handleConnect = (e) => {
    conn.current=peer.current.connect(toUserRef.current.value);    //connects to the other user
    connections.current.push(conn.current);                        //appends the connection to the array connections
    SendReceive();
  }

  //-------------------------------------------
  
  const handleDisconnect = (e) => {
    if (calls.current){calls.current.close()}
    conn.current.close();
    connections.current.forEach((element) => {element.close()})     //disconnects from all connections

  }
  //-------------------------------------------

  const handleSend = (e) => {
    connections.current.forEach((element)=>{element.send(messageRef.current.value)})  //sends the data to each connection
    messageRef.current.value = "";
  }

  //-------------------------------------------

  const handleCall = (e) => {
    calls.current = peer.current.call(toUserRef.current.value, myVideo.current.srcObject);  //calls the other user
    onReceiveStream();                                                                      //displays the stream of the other user
  }

  //-------------------------------------------

  const handleDisconnectCall = (e) => {
    calls.current.close();                                              //disconnects the call
  }

//####################### RENDER ############################

  return (
    <div className="App">
      <p ref={myID}></p>
      <p><button onClick={() => {navigator.clipboard.writeText(myID.current.innerHTML)}}>COPY ID</button></p>
      <p ref={receivedMessage}></p>
      <button onClick={() => {navigator.clipboard.readText().then(clipText => toUserRef.current.value =clipText)}}>PASTE</button>     
      <input type="text" placeholder="to" ref={toUserRef}/>
      <button onClick={handleConnect}>CONNECT</button>
      <button onClick={handleDisconnect}>DISCONNECT</button>
      <input type="text" placeholder="message" ref={messageRef}/>
      <button onClick={handleSend}>SEND</button>
      <button onClick={handleCall}>CALL</button>
      <button onClick={handleDisconnectCall}>END CALL</button>
      <br/>
      <p  ref={notification}></p>
      <br/>
      <div className="videoContainer">
        <video ref={myVideo} muted autoPlay/>
        <video ref={receivedVideo} muted hidden autoPlay/>
      </div>
    </div>
  );
}

export default App;
