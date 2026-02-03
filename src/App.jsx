import React, { useState, useEffect, useMemo } from 'react';
import VideoPlayer from './components/VideoPlayer';
import ChannelList from './components/ChannelList';
import SearchBar from './components/SearchBar';
import { fetchAndParseM3U } from './services/m3uParser';
import './App.css';

const PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.country.m3u';
// const PLAYLIST_URL = 'https://iptv-org.github.io/iptv/countries/us.m3u'; // Fallback if main list is too big/slow

function App() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChannels = async () => {
      setLoading(true);
      const data = await fetchAndParseM3U(PLAYLIST_URL);
      setChannels(data);
      if (data.length > 0) {
        // Optional: Select first channel automatically
        // setSelectedChannel(data[0]); 
      }
      setLoading(false);
    };

    loadChannels();
  }, []);

  const filteredChannels = useMemo(() => {
    if (!searchTerm) return channels.slice(0, 500); // Limit initial view for performance if list is huge

    return channels.filter(channel =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.country.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 100); // Limit search results
  }, [channels, searchTerm]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">MWASALIVE</h1>
        <div className="live-badge">LIVE TV</div>
      </header>

      <main className="app-main">
        <div className="player-section">
          <VideoPlayer
            src={selectedChannel ? selectedChannel.url : ''}
            channelName={selectedChannel ? selectedChannel.name : ''}
          />
          {!selectedChannel && !loading && (
            <div className="select-prompt">Select a channel to start watching</div>
          )}
        </div>

        <div className="list-section">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          {loading ? (
            <div className="loading-spinner">Loading Channels...</div>
          ) : (
            <ChannelList
              channels={filteredChannels}
              onSelectChannel={setSelectedChannel}
              selectedChannelId={selectedChannel?.id}
            />
          )}
          <div className="channel-count">
            Showing {filteredChannels.length} of {channels.length} channels
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
