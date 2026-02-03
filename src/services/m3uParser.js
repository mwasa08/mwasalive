export const fetchAndParseM3U = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.statusText}`);
    }
    const text = await response.text();
    return parseM3U(text);
  } catch (error) {
    console.error("Error parsing M3U:", error);
    return [];
  }
};

export const parseM3U = (content) => {
  const lines = content.split('\n');
  const playlist = [];
  let currentItem = {};

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      // Example: #EXTINF:-1 tvg-id="CNN.us" tvg-name="CNN" tvg-logo="..." group-title="News",CNN
      
      // Extract metadata
      const info = line.substring(8);
      const commaIndex = info.lastIndexOf(',');
      let name = '';
      let meta = '';

      if (commaIndex !== -1) {
        name = info.substring(commaIndex + 1).trim();
        meta = info.substring(0, commaIndex);
      } else {
        meta = info;
      }

      // reliable parsing of attributes
      const getAttr = (attr) => {
        const regex = new RegExp(`${attr}="([^"]*)"`);
        const match = meta.match(regex);
        return match ? match[1] : null;
      };

      currentItem = {
        name: name || getAttr('tvg-name') || 'Unknown Channel',
        logo: getAttr('tvg-logo'),
        group: getAttr('group-title') || 'Uncategorized',
        country: getAttr('group-title') || 'Unknown', // Often group-title is the country in some lists
        id: crypto.randomUUID()
      };
    } else if (!line.startsWith('#')) {
      // This is the URL
      if (currentItem.name && line.startsWith('http')) {
        currentItem.url = line;
        playlist.push(currentItem);
        currentItem = {}; // Reset
      }
    }
  }

  return playlist;
};
