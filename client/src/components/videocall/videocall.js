import React, { useEffect, useState } from "react";
import './videocall.css';
import axios from 'axios'; 
import {baseUrl} from '../../base';
import { Redirect } from "react-router-dom";

export default function VideoCall(){
    const [roomId, setRoomId] = useState(null);

    useEffect(()=>{
        axios.get(baseUrl+"/").then(response =>{
            setRoomId(response.data.roomId);
        });
    },[])
    
    return(
        <div>
            This is Video Call Component
            {/* <Redirect to="/call/addaadadd" /> */}
        </div>
    )
}