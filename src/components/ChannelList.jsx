import React from 'react';
import './ChannelList.css';

const ChannelList = ({ channels, onSelectChannel, selectedChannelId }) => {
    return (
        <div className="channel-list-container">
            {channels.length === 0 ? (
                <div className="no-channels">No channels found</div>
            ) : (
                <div className="channel-grid">
                    {channels.map((channel) => (
                        <div
                            key={channel.id}
                            className={`channel-card ${selectedChannelId === channel.id ? 'selected' : ''}`}
                            onClick={() => onSelectChannel(channel)}
                        >
                            <div className="channel-icon">
                                {channel.logo ? (
                                    <img src={channel.logo} alt={channel.name} onError={(e) => e.target.style.display = 'none'} />
                                ) : (
                                    <div className="placeholder-icon">TV</div>
                                )}
                            </div>
                            <div className="channel-info">
                                <h3 className="channel-name">{channel.name}</h3>
                                <span className="channel-country">{channel.country}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChannelList;
