import React, { useEffect } from 'react';
import './video.css';
import io from 'socket.io-client';
import { baseUrl } from '../../base';
import { useParams } from 'react-router-dom';
import Peer from 'peerjs';
const socket = io(baseUrl, { transports: ['websocket', 'polling', 'flashsocket'] });

export default function Video(){
    const roomId = useParams().roomId;
    //2. Peer object
    const myPeer = new Peer(undefined, {
        host: '/',
        port: '3002'
    })

    //4. my video
    const myvideo = document.createElement('video');
    myvideo.muted = true;

    navigator.mediaDevices.getUserMedia({
        video : true,
        audio : true
    }).then(stream =>{
        addVideoStream(myvideo,stream);
        //6. Answer call
        myPeer.on('call',call =>{
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream',userVideoStream =>{
                addVideoStream(video,userVideoStream);
            })
        })
        //5. Connect and send video
        socket.on('user-connected',userId =>{
            console.log("user connected");
            connectToNewUser(userId,stream);
        })
    })

    //function definition
    function connectToNewUser(userId,stream){
        console.log(userId);
        const call = myPeer.call(userId,stream);
        const video = document.createElement('video');
        call.on('stream',userVideoStream =>{
            addVideoStream(video,userVideoStream);
        });
        call.on('close', ()=>{
            video.remove();
        });
    }

    //function definition
    function addVideoStream(myvideo,stream){
        myvideo.srcObject = stream;
        myvideo.addEventListener('loadedmetadata', ()=>{
            myvideo.play();
        })
        const videogrid = document.getElementById('video-grid');
        videogrid.append(myvideo);
    }

    //7. Disconnected
    socket.on('user-disconnected',userId=>{
        console.log("user disconnected: "+userId);
    })

    //3. peerjs connection
    myPeer.on('open',id=>{
        //join room
        console.log(id);
        socket.emit('join-room',roomId,id);
    })

    //1. broadcast message - test code
    // socket.on('user-connected',userId =>{
    //     console.log("User connected: "+userId)
    // })


    return(
        <div id="video-grid">
            This is a video grid cell.
        <script defer src="https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js"></script>
        </div>
    )
}