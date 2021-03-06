import React, {useEffect, useRef} from 'react';
import './videochat.css';

export default function VideoChat() {
  const myID = useRef('');                                  //stores current user ID
  const toUserRef = useRef();                               //stores ID of the other user
  const messageRef = useRef();                              //stores data from message input field
  const sendRef = useRef();                                 //send button
  const pasteRef = useRef();                                //paste button
  const peer = useRef(new window.peerjs.Peer());            //peer object. ID changes each time it runs.
  const conn = useRef();                                    //connection object gets generated once connection is established
  const connectConn = useRef();                             //connect button
  const disconnectConn = useRef();                          //disconnect button
  const receivedMessage = useRef('');                       //stores received message data
  const myVideo = useRef();                                 //mediaStream (video) of current user
  const receivedVideo = useRef();                           //mediaStrean (video) of other user
  const calls = useRef();                                   //calls object generated once (video)call made or received
  const notification = useRef();                            //handles notifications
  const answerCall = useRef();                              //answer call button
  const rejectCall = useRef();                              //reject call button
  const endCall = useRef();                                 //end call button
  const makeCall = useRef();                                //call button
  const videoStreamParam = useRef(true);                    //video settings (quality & on/off)
  const audioStreamParam = useRef(true);                    //true if audio is on, false otherwise
  const blankVideoTrack = useRef(); 




  //######################## USE EFFECT ###########################
  
  useEffect(()=>{
    console.log(window);
      navigator.mediaDevices.getUserMedia(                  //fetches data from mediaDevices (webcam and mic)
      {video: true,
      audio: true
      })
    .then(stream =>{ 
      myVideo.current.srcObject = stream;                   //initialises myVideo with audio and video tracks
    });


    // blank/void track
    const height = 360;
      const width = 640;
      const canvas = Object.assign(document.createElement('canvas'), { width, height });
      canvas.getContext('2d').fillRect(0, 0, width, height);
      blankVideoTrack.current = canvas.captureStream().getVideoTracks()[0];   



    peer.current.on('open', function(id) {
      
      myID.current.innerHTML = id;                          //displays current user's peer ID on the page
      
      peer.current.on('call', function(call) {                //executes in the event a call is received but not accepted
        calls.current=call;
        answerCall.current.style.display = "inline";
        rejectCall.current.style.display = "inline";
        makeCall.current.style.display = "none";
        notification.current.innerHTML = "INCOMMING CALL... PLEASE ANSWER OR REJECT.";
        setTimeout(() => { notification.current.innerHTML = ""}, 4000);
      });

      peer.current.on('connection', function(connection){     //event when connection is received
        conn.current=connection;                              //start connection
        SendReceive();
        toUserRef.current.value=conn.current.peer;
      });

    });

  },[]);
  
//####################### FUNCTIONS ############################



  function SendReceive(){
    conn.current.on('open',()=>{

      toUserRef.current.style.display = "none";
      connectConn.current.style.display = "none"
      disconnectConn.current.style.display = "inline";
      pasteRef.current.style.display = "none";
      sendRef.current.style.display = "inline";
      messageRef.current.style.display = "inline";
      makeCall.current.style.display = "inline";

      conn.current.on('data', function(data){
        if(data.control === 'disconnectCall'){                                 
          calls.current.close();                                                         //workaround to disconnect call bug
        }
        if(data.message)
        { 
          receivedMessage.current.innerHTML += "<p>Received: "+data.message+"</p>";                //displays received data
        }
      })
      notification.current.innerHTML = "CONNECTION ESTABLISHED";             //notifies user that connection is established
      setTimeout(() => { notification.current.innerHTML = ""}, 4000);        //hides the notification after 4 secs
    })
    conn.current.on('close', () => {
      
      receivedVideo.current.style.display="none";                            //hides video element
      toUserRef.current.style.display = "inline";
      connectConn.current.style.display = "inline"
      disconnectConn.current.style.display = "none";
      pasteRef.current.style.display = "inline";
      sendRef.current.style.display = "none";
      messageRef.current.style.display = "none";
      makeCall.current.style.display = "none";
      endCall.current.style.display = "none";
      answerCall.current.style.display = "none";
      rejectCall.current.style.display = "none";
      myVideo.current.style.display="none";
      receivedMessage.current.innerHTML = "";

      notification.current.innerHTML = "CONNECTION CLOSED";                  //notifies user that connection is closed
      setTimeout(() => { notification.current.innerHTML = ""}, 4000);        //hides the notification after 4 secs
      conn.current = '';
    })
  }

  //-------------------------------------------

  function onReceiveStream(){
    console.log(calls.current)
    calls.current.on('stream', function(stream){
      myVideo.current.style.display = "inline";
      receivedVideo.current.style.display = "inline";
      makeCall.current.style.display = "none";
      answerCall.current.style.display = "none";
      rejectCall.current.style.display = "none";
      endCall.current.style.display = "inline";
      receivedVideo.current.srcObject = stream;                    //displays received video
    });

    calls.current.on('close', () => {
      receivedVideo.current.style.display="none";                   //hides video element
      myVideo.current.style.display = "none";
      makeCall.current.style.display = "inline";
      endCall.current.style.display = "none";
      notification.current.innerHTML = "CALL ENDED";                          //notifies user that call has ended
      setTimeout(() => { notification.current.innerHTML = ""}, 4000);        //hides the notification after 4 secs
    })
  }

//######################### HANDLERS ##########################

  const handleConnect = (e) => {
    conn.current=peer.current.connect(toUserRef.current.value);    //connects to the other user
    SendReceive();
  }

  //-------------------------------------------
  
  const handleDisconnect = (e) => {
    if (calls.current){calls.current.close()}
    conn.current.close();
  }
  //-------------------------------------------

  const handleSend = (e) => {
    if (conn.current){
      conn.current.send({message:messageRef.current.value})
    }
    else{
      notification.current.innerHTML = "CONNECT TO A PEER TO SEND DATA";     //notifies user that no connections are available
      setTimeout(() => { notification.current.innerHTML = ""}, 4000);        //hides notification after 4 secs
    }
    messageRef.current.value = "";
    console.clear();
    console.log(conn.current.peer);
  }

  //-------------------------------------------

  const handleCall = (e) => {
    if(conn.current)
    {
      calls.current = peer.current.call(conn.current.peer, myVideo.current.srcObject);  //calls the other user
      notification.current.innerHTML = "CALLING...";
      setTimeout(() => { notification.current.innerHTML = ""}, 4000);
      onReceiveStream();                                                                //displays the stream of the other user
    }
    else{
      notification.current.innerHTML = "CONNECT TO A PEER TO CALL";              //notifies user that no connections are available
      setTimeout(() => { notification.current.innerHTML = ""}, 4000);        //hides notification after 4 secs
    }
  }

  //-------------------------------------------

  const handleDisconnectCall = (e) => {
    conn.current.send({control:"disconnectCall"})                       //sends a user defined control "disconnectCall" along the message
    calls.current.close();                                              //disconnects the call
  }
  
  //-------------------------------------------

  const handleAnswerCall = (e) => {
    calls.current.answer(myVideo.current.srcObject);                  //answers call when answer button is pressed
    onReceiveStream();                                                //displays received stream
  }

  //-------------------------------------------

  const handleRejectCall = (e) => {
    answerCall.current.style.display = "none";
    rejectCall.current.style.display = "none";
    makeCall.current.style.display = "inline";
    calls.current.close();
    onReceiveStream();
  }

  //-------------------------------------------


  const handleStreamChange = (e) => {
    if(e.target.name === "videoQuality"){
      
      if(e.target.value === "240"){
        videoStreamParam.current={width: {exact: 426}, height: {exact: 240}};
      }
      else if(e.target.value === "360"){
        videoStreamParam.current={width: {exact: 640}, height: {exact: 360}};
      }
      else if(e.target.value === "480"){
        videoStreamParam.current={width: {exact: 854}, height: {exact: 480}};
      }
      else if(e.target.value === "720"){
        videoStreamParam.current={width: {exact: 1280}, height: {exact: 720}};
      }
      else{
        videoStreamParam.current=true;
      }  
    }
    else if(e.target.name === "videoToggle")
    {
      console.log("vtoggle");
      if(videoStreamParam.current){
        myVideo.current.srcObject.getVideoTracks()[0].enabled = false;
        videoStreamParam.current=false;
      }
      else{
        myVideo.current.srcObject.getVideoTracks()[0].enabled = true;
        videoStreamParam.current=true;
      }
    }
    else if(e.target.name === "audioToggle")
    {
      console.log("atoggle");
      if(audioStreamParam.current){
        myVideo.current.srcObject.getAudioTracks()[0].enabled = false;
        audioStreamParam.current=false;
      }
      else{
        myVideo.current.srcObject.getAudioTracks()[0].enabled = true;
        audioStreamParam.current=true;
      }
    }
  }

//####################### RENDER ############################

  return (
    <div className="App">
      <p ref={myID}></p>
      <p><button onClick={() => {navigator.clipboard.writeText(myID.current.innerHTML)}}>COPY ID</button></p>
      <p ref={receivedMessage}></p>
      <button ref={pasteRef} onClick={() => {navigator.clipboard.readText().then(clipText => toUserRef.current.value =clipText)}}>PASTE</button>     
      <input ref={toUserRef} type="text" placeholder="to"/>
      <button ref={connectConn} onClick={handleConnect}>CONNECT</button>
      <button ref={disconnectConn} onClick={handleDisconnect} hidden>DISCONNECT</button>
      <input ref={messageRef} type="text" placeholder="message" hidden/>
      <button ref={sendRef} onClick={handleSend} hidden>SEND</button>
      <button ref={makeCall} onClick={handleCall} hidden>CALL</button>
      <button ref={answerCall} onClick={handleAnswerCall} hidden>ANSWER</button>
      <button ref={rejectCall} onClick={handleRejectCall} hidden>REJECT</button>
      <button ref={endCall} onClick={handleDisconnectCall} hidden>END CALL</button>
      <br/>
      <p  ref={notification}></p>
      <p>
        <label htmlFor="videoQuality">Video Quality: </label>
        <select id="videoQuality" name="videoQuality" onChange={handleStreamChange}>
            <option value="auto">auto</option>
            <option value="240">240p</option>
            <option value="360">360p</option>
            <option value="480">480p</option>
            <option value="720">720p</option>
            <option value="1080">1080p</option>
        </select>
        <label htmlFor="videoToggle"> Video: </label>
        <input id="videoToggle" name="videoToggle" type="checkbox" onChange={handleStreamChange}/>
        <label htmlFor="audioToggle"> Audio: </label>
        <input id="audioToggle" name="audioToggle" type="checkbox" onChange={handleStreamChange}/>
        <button onClick={()=>{
          console.clear();
          // console.log(myVideo.current.srcObject.getAudioTracks(), receivedVideo.current.srcObject.getAudioTracks());
          // console.log(myVideo.current.srcObject.getVideoTracks(), receivedVideo.current.srcObject.getVideoTracks());
          // myVideo.current.srcObject.getTracks().forEach((tracks)=> console.log(tracks));
          console.log(peer.current, conn.current[0]);
          //myVideo.current.srcObject.getAudioTracks()[0].stop();
          //myVideo.current.srcObject.getVideoTracks()[0].stop();
          //console.log(calls.current.peerConnection.removeTrack(calls.current.peerConnection.getSenders()[0]));

        }
          }>replace vid tracks</button>
        
        
        
        <button onClick={()=>{
          console.clear();
         
          console.log(myVideo.current.srcObject.getVideoTracks());
        }
          }>view vid tracks</button>
        
      </p>
      <br/>
      <div className="videoContainer">
        <video ref={myVideo} muted  hidden autoPlay/>
        <video ref={receivedVideo} hidden autoPlay/>
      </div>
    </div>
  );
}
