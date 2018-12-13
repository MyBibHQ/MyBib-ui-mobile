import axios from 'axios'

import {BASE_API_URL} from '@/config.js';

class AutociteApi {
  async search (searchTerm, sourceId) {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    try {
      const response = await axios.get(BASE_API_URL + `/autocite/search?q=${encodedSearchTerm}&sourceId=${sourceId}`);

      return response.data.results;
    } catch (error) {

    }
  }
}

const singleton = new AutociteApi();
export default singleton;
