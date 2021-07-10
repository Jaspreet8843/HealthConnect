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

    useEffect(()=>{

        //4. my video
        const myvideo = document.createElement('video');
        myvideo.muted = true;

        navigator.mediaDevices.getUserMedia({
            video : true,
            audio : true
        })
        .then(stream =>{
            
            addVideoStream(myvideo,stream);
            
            //6. Answer call
            myPeer.on('call',call =>{
                call.answer(stream);
                const video = document.createElement('video');
                call.on('stream',userVideoStream =>{
                    addVideoStream(video,userVideoStream);
                },err=>{
                    console.log(err);
                })
            })

            //5. Connect and send video
            socket.on('user-connected',userId =>{
                console.log("New user: "+userId);
                connectToNewUser(userId,stream);
            })
        })

        //function definition
        function connectToNewUser(userId,stream){
            const call = myPeer.call(userId,stream);
            const video = document.createElement('video');
            //call user
            myPeer.on('stream',userVideoStream =>{
                //not running
                console.log("on call");
                addVideoStream(video,userVideoStream);
            },err=>{
                console.log(err);
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

        //3. Join room - peer js ID
        myPeer.on('open',id=>{
            console.log(id);
            socket.emit('join-room',roomId,id);
        })
    },[])

    return(
        <div id="video-grid"></div>
    )
}