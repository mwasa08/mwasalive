import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';

const VideoPlayer = ({ src, channelName }) => {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let hls;

        if (src && videoRef.current) {
            if (Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.error("fatal network error encountered, try to recover");
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.error("fatal media error encountered, try to recover");
                                hls.recoverMediaError();
                                break;
                            default:
                                console.error("cannot recover");
                                hls.destroy();
                                setError("Stream error. Cannot play this channel.");
                                break;
                        }
                    }
                });
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                // For Safari which has native HLS support
                videoRef.current.src = src;
            }
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src]);

    return (
        <div className="video-player-container">
            {channelName && <div className="channel-overlay">{channelName}</div>}
            {error && <div className="video-error">{error}</div>}
            <video ref={videoRef} controls autoPlay className="video-element" />
        </div>
    );
};

export default VideoPlayer;
