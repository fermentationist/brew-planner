/* global setTimeout, clearTimeout */
import React, {useState, useEffect, useRef} from "react";

const Timer = props => {
    const timerRef = useRef(null);
    const [state, setState] = useState({
        time: props.time, // time in ms from Unix epoch
        sign: Date.now() > props.time ? "-" : "",
        hoursRemaining: getHoursRemaining(props.time),
        minutesRemaining: getMinutesRemaining(props.time),
    })
    const colorOutput = () => {
        let color = "green";
        if (state.hoursRemaining < 1){
            color = "darkgoldenrod";
        }
        if (state.sign === "-"){
            color = "red";
        }
        timerRef.current.style.color = color
    }
    useEffect(() => {
        colorOutput();
        const timer = setTimeout(() => {
            setState({
                ...state,
                sign: Date.now() > props.time ? "-" : "",
                hoursRemaining: getHoursRemaining(props.time),
                minutesRemaining: getMinutesRemaining(props.time),
            })
            
        }, 30000);
        return () => { // component unmount cleanup function
            clearTimeout(timer);
        }
    })
    return (
        <>
            <span ref={timerRef}>{state.sign}{state.hoursRemaining}h {state.minutesRemaining}m</span>
        </>
    )
}

export default Timer;

export const getHoursRemaining = time => {
    return Math.abs(Math.trunc((time - Date.now())/3600000))
}
export const getMinutesRemaining = time => {
    return Math.floor((Math.abs((time - Date.now())/(3600000)) - getHoursRemaining(time)) * 60);
}