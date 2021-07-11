import React, { useEffect } from 'react';
import './video.css';
import io from 'socket.io-client';
import { baseUrl } from '../../base';
import { useParams } from 'react-router-dom';
import Peer from 'peerjs';
const socket = io(baseUrl, { transports: ['websocket', 'polling', 'flashsocket'] });

export default function Video(){
    //1. Room ID
    const roomId = useParams().roomId;    

    //2. Peer object
    const myPeer = new Peer({
        host: '/',
        port: '3002',
    })

    useEffect(()=>{
        
        const videogrid = document.getElementById('video-grid');

        //3. Join room - peer js ID
        myPeer.on('open',id=>{
            console.log("Your id: ",id);
            socket.emit('join-room',roomId,id);
        })

        //4. my video
        const myvideo = document.createElement('video');
        myvideo.muted = true;

        navigator.mediaDevices.getUserMedia({
            video : true,
            audio : true
        })
        .then(stream =>{
            
            addVideoStream(myvideo,stream);

            //5. Connect and send video
            socket.on('user-connected',userId =>{
                console.log("New user: "+userId);
                //waiting for navigator   
                setTimeout(connectToNewUser,3000,userId,stream);
            })
            
            //6. Answer call
            myPeer.on('call',call =>{
                console.log("call");
                //Answer incoming call and receive the stream
                call.answer(stream);
                const video = document.createElement('video');
                call.on('stream',userVideoStream =>{
                    console.log(userVideoStream);
                    addVideoStream(video,userVideoStream);
                })
            })
        })

        //7. Disconnected
        socket.on('user-disconnected',userId=>{
            console.log("user disconnected: "+userId);
        })

        //function definition
        function addVideoStream(myvideo,stream){
            myvideo.srcObject = stream;
            myvideo.addEventListener('loadedmetadata', ()=>{
                myvideo.play();
            })
            //append video to html div
            videogrid.append(myvideo);
        }

        //function definition
        function connectToNewUser(userId,stream){
            const calling = myPeer.call(userId,stream);
            const video = document.createElement('video');

            //stream event fired when other person receives call with their stream
            calling.on('stream',userVideoStream =>{
                console.log("on calling");
                addVideoStream(video,userVideoStream);
            });
            
            //remove video when peer is closed
            calling.on('close', ()=>{
                video.remove();
            });
        }

    },[])

    return(
        <div id="video-grid"></div>
    )
}