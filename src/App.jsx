import { useEffect, useMemo, useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import afroLiveLogo from './assets/mwasa.svg';
import { fetchAndParseM3U } from './services/m3uParser';
import './App.css';

const PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.category.m3u';

const CATEGORY_CARDS = [
  { label: 'Movies', terms: ['movie', 'movies', 'cinema', 'film'] },
  { label: 'Kids', terms: ['kids', 'children', 'cartoon', 'family'] },
  { label: 'Religions', terms: ['religion', 'religions', 'religious', 'faith', 'christian', 'islam'] },
  { label: 'Sports', terms: ['sport', 'sports'] },
  { label: 'News', terms: ['news'] },
  { label: 'Music', terms: ['music', 'radio'] },
];

const CHANNEL_LIMIT = 18;

const buildSearchText = (channel) =>
  `${channel.name} ${channel.group ?? ''} ${channel.country ?? ''}`.toLowerCase();

function App() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadChannels = async () => {
      setLoading(true);
      const data = await fetchAndParseM3U(PLAYLIST_URL);

      if (ignore) {
        return;
      }

      setChannels(data);
      setLoading(false);
    };

    loadChannels();

    return () => {
      ignore = true;
    };
  }, []);

  const activeCategoryCard = useMemo(
    () => CATEGORY_CARDS.find((card) => card.label === activeCategory) ?? null,
    [activeCategory]
  );

  const filteredChannels = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return channels
      .filter((channel) => {
        const searchText = buildSearchText(channel);
        const matchesSearch = !normalizedSearch || searchText.includes(normalizedSearch);
        const matchesCategory =
          !activeCategoryCard || activeCategoryCard.terms.some((term) => searchText.includes(term));

        return matchesSearch && matchesCategory;
      })
      .slice(0, CHANNEL_LIMIT);
  }, [activeCategoryCard, channels, searchTerm]);

  const relatedChannels = useMemo(() => {
    if (!selectedChannel) {
      return [];
    }

    return channels
      .filter(
        (channel) =>
          channel.id !== selectedChannel.id &&
          (channel.group === selectedChannel.group || channel.country === selectedChannel.country)
      )
      .slice(0, 12);
  }, [channels, selectedChannel]);

  const hasFilters = Boolean(searchTerm.trim() || activeCategory);
  const showDiscoveryPanel = hasFilters || Boolean(selectedChannel);
  const visibleChannels = hasFilters ? filteredChannels : relatedChannels;

  const handleCategorySelect = (label) => {
    setSelectedChannel(null);
    setActiveCategory((currentCategory) => (currentCategory === label ? '' : label));
  };

  const handleSearchChange = (event) => {
    setSelectedChannel(null);
    setSearchTerm(event.target.value);
  };

  const clearSelection = () => {
    setActiveCategory('');
    setSearchTerm('');
    setSelectedChannel(null);
  };

  const discoveryTitle = selectedChannel
    ? selectedChannel.name
    : activeCategory
      ? `${activeCategory} channels`
      : 'Search results';

  const discoveryText = loading
    ? 'Loading live channels...'
    : hasFilters
      ? filteredChannels.length > 0
        ? `Choose from ${filteredChannels.length} matching live channels.`
        : 'No channels match that search right now.'
      : relatedChannels.length > 0
        ? `More channels like ${selectedChannel?.name}.`
        : 'No related channels found for this stream.';

  return (
    <div className="app-shell">
      <div className="showcase-frame">
        <section className="brand-panel">
          <h1 className="brand-title">AFRO LIVE</h1>

          <div className="brand-logo-wrap">
            <img src={afroLiveLogo} alt="Afro Live Africa logo" className="brand-logo" />
          </div>

          <p className="brand-tagline">AFRICAN LIVE TV STREAMING</p>
        </section>

        <section className="action-panel">
          <img src={afroLiveLogo} alt="" aria-hidden="true" className="corner-logo" />

          <div className="action-content">
            <h2 className="action-title">START STREAMING NOW</h2>

            <div className="category-grid">
              {CATEGORY_CARDS.map((card) => (
                <button
                  key={card.label}
                  type="button"
                  className={`category-tile ${activeCategory === card.label ? 'is-active' : ''}`}
                  onClick={() => handleCategorySelect(card.label)}
                >
                  {card.label}
                </button>
              ))}
            </div>

            <label className="search-row">
              <span className="search-icon" aria-hidden="true">
                &#128269;
              </span>
              <input
                type="text"
                className="hero-search"
                placeholder="search here"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </label>
          </div>
        </section>
      </div>

      <section className={`discovery-panel ${showDiscoveryPanel ? 'is-visible' : ''}`}>
        {showDiscoveryPanel ? (
          <>
            <div className="discovery-header">
              <div>
                <h3 className="discovery-title">{discoveryTitle}</h3>
                <p className="discovery-copy">{discoveryText}</p>
              </div>

              <button type="button" className="clear-button" onClick={clearSelection}>
                Clear
              </button>
            </div>

            {selectedChannel ? (
              <div className="player-card">
                <VideoPlayer src={selectedChannel.url} channelName={selectedChannel.name} />
              </div>
            ) : null}

            {!loading && visibleChannels.length > 0 ? (
              <div className="stream-grid">
                {visibleChannels.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    className={`stream-card ${selectedChannel?.id === channel.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <span className="stream-name">{channel.name}</span>
                    <span className="stream-meta">{channel.group || channel.country || 'Live TV'}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}

export default App;
