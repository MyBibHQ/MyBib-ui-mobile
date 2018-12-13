<template>
  <div class="view" style="background:#fff;">
    <mu-appbar>
      <mu-icon-button :to="{name: 'Project', params:{projectId: $route.params.projectId}}" icon="arrow_back" slot="left"/>
      <div>Add {{$t('reference')}}</div>
    </mu-appbar>

    <div style="bottom:0; left:0; position:absolute; overflow-y:auto; overflow-x:hidden; right:0; top:56px;">
      <div class="search-widget" :class="{'pin-to-top': hasSearched || moreDropdownOpen}">
        <div class="tabs">
          <div v-for="(specialSource, index) in specialSources" :key="index" :class="{selected: selectedSourceId === specialSource.id}" class="tab">
            <button @click="changeSource(specialSource.id)" class="tab__button">{{specialSource.name}}</button>
          </div>

          <div class="tab more" :class="{open: moreDropdownOpen, selected: moreSourceIsSelected}">
            <button @click="openMoreDropdown()" class="tab__button">{{moreDropdownText}}<i class="material-icons" style="margin-right:-6px;">arrow_drop_down</i></button>
            <div class="more-sources-dropdown">
              <div style="font-weight:500;">Select a source</div>

              <div class="sources-container">
                <button v-for="(source, index) in config.sources.filter((s) => { return s.name.toLowerCase().indexOf(sourceFilterTerm.toLowerCase()) > -1 })" :key="index" @click="changeSource(source.id)">{{source.name}}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="body">
          <div class="input-wrapper">
            <input type="text" ref="searchTerm" v-model="searchTerm" :placeholder="inputPlaceholderText" @keyup.enter="doSearch()"/>
            <button class="btn btn-raised bg-blue white" :disabled="isSearching" @click="doSearch()">
              <span>
                <i class="material-icons">search</i>
              </span>
            </button>
          </div>
        </div>

        <div v-if="selectedSourceId" style="padding:10px; text-align:center;">Or <router-link :to="{ name: 'NewReference', params:{ sourceId:selectedSourceId } }" class="btn btn-outline btn-inline">enter manually</router-link></div>
      </div>

      <div class="search-results">
        <div v-if="isSearching" style="height:200px; position:relative;">
          <Spinner />
        </div>
        <div v-if="hasSearched && !isSearching && searchResults.length === 0" class="no-results-found">No results found. Try again or <router-link :to="{ name: 'NewReference', params:{ sourceId:selectedSourceId } }" class="btn btn-outline btn-inline" style="margin-top:8px;">enter manually</router-link></div>
        <ul ref="searchResults">
          <li v-for="(result, index) in searchResults" :key="index" class="result">
            <button @click="selectResult(result)">
              <ListReferenceDetailed :reference="result" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js';
import MessageBus from '@/services/messageBus.js';
import AutociteApi from '@/services/autociteApi.js';

import ListReferenceDetailed from '@/components/ListReferenceDetailed';
import Spinner from '@/components/Spinner';

export default {
  name: 'NewReferenceSearch',
  components: {
    ListReferenceDetailed,
    Spinner
  },
  data () {
    return {
      config: Config,
      selectedSourceId: null,
      specialSources: [{
        id: 'webpage',
        name: 'Website',
        icon: 'language',
        inputPlaceholderText: 'Search for the page title or paste a URL address'
      }, {
        id: 'book',
        name: 'Book',
        icon: 'book',
        inputPlaceholderText: 'Search for the book title or ISBN'
      }, {
        id: 'article_journal',
        name: 'Journal',
        icon: 'description',
        inputPlaceholderText: 'Search for the journal article title or DOI'
      }],
      moreDropdownOpen: false,
      sourceFilterTerm: '',
      searchTerm: '',
      hasSearched: false,
      isSearching: false,
      searchResults: []
    };
  },
  computed: {
    selectedSource () {
      return Config.sources.find((s) => { return s.id === this.selectedSourceId });
    },
    moreSourceIsSelected () {
      return this.selectedSourceId && !this.specialSources.find((s) => { return s.id === this.selectedSourceId });
    },
    moreDropdownText () {
      return this.moreSourceIsSelected ? this.selectedSource.name : 'More';
    },
    inputPlaceholderText () {
      return this.moreSourceIsSelected ? 'Search for the title or enter a URL' : this.selectedSourceId !== null ? this.specialSources.find((s) => { return s.id === this.selectedSourceId }).inputPlaceholderText : '';
    }
  },
  methods: {
    changeSource (sourceId) {
      this.clearSearch();
      this.selectedSourceId = sourceId;
      this.moreDropdownOpen = false;
      // if the source type doesn't have autocite then redirect straight to the manual form
      if (!this.selectedSource.hasAutocite) {
        this.$router.push({ name: 'NewReference', params: { sourceId: sourceId } });
      } else {
        this.$refs.searchTerm.focus();
      }
    },
    openMoreDropdown () {
      this.clearSearch();
      this.selectedSourceId = null;
      this.moreDropdownOpen = true;
    },
    clearSearch () {
      this.hasSearched = false;
      this.searchResults.length = 0;
    },
    async doSearch () {
      window.history.replaceState({}, null, `#${this.$route.path}?q=${this.searchTerm}&source=${this.selectedSourceId}`);
      if (this.searchTerm && this.searchTerm.length > 1) {
        this.clearSearch();
        this.$refs.searchTerm.blur();
        this.isSearching = true;
        this.hasSearched = true;

        let searchResults = await AutociteApi.search(this.searchTerm, this.selectedSourceId);
        if (searchResults && searchResults.length > 0) {
          this.searchResults = searchResults;
        } else {
          this.noResultsFound = true;
        }
        this.isSearching = false;
      }
    },
    selectResult (result) {
      MessageBus.newReference = {
        metadata: result.metadata,
        urlToImage: result.urlToImage
      }
      this.$router.push({ name: 'NewReference', params: { sourceId: result.sourceId } });
    }
  },
  created () {
    MessageBus.newReference = {};
  },
  mounted () {
    this.changeSource('webpage');

    // check for pre-populated q and source params
    if (this.$route.query.q && this.$route.query.source) {
      this.searchTerm = this.$route.query.q;
      this.changeSource(this.$route.query.source);
      this.$nextTick(() => {
        this.doSearch(); // this is in a nextTick because otherwise the tooltip breaks the enter manually button
      })
    }
  }
}
</script>

<style lang="scss">
  @import '../variables.scss';

  .search-widget { margin-top:40px; padding:10px; transition:all 0.3s;
    &.pin-to-top { margin-top:0; }

    .tabs { display:flex;
      .tab { border-radius:3px 3px 0 0; border-bottom:3px solid #ffffff; position:relative; width:25%;
        >button { align-items:center; display:flex; height:40px; justify-content: center; width:100%; }
        &.selected { font-weight:500;
          &:nth-child(1n) { border-color: $primary-color;}
          &:nth-child(2n) { border-color: #fcede6;}
          &:nth-child(3n) { border-color: $secondary-color;}
          &:nth-child(4n) { border-color: #2e80b0;}
          &:nth-child(5n) { border-color: #000000;}
        }
        &.more {
          button { padding-right:0; }
          &.open { font-weight:500;
            .more-sources-dropdown { display:block; font-weight:400; }
          }
          &.selected { width:40%; }
        }
        &:hover { font-weight:500;}
      }

      .more-sources-dropdown { background:#ffffff; border:1px solid #d5d8dc; border-radius:3px 0 3px 3px; box-shadow:0 2px 6px rgba(0,0,0,0.1); display:none; margin-bottom:10px; padding:15px; position:absolute; right:-1px; top:100%; width:calc(400% + 8px); z-index:5;
        input { border:1px solid #d7dbe0; border-radius:3px; font-size:14px; margin:10px 0; padding:8px 12px; width:100%; }
        .sources-container { display:flex; flex-wrap: wrap;
          button { border-radius:3px; padding:10px; text-align:left; width:100%;
            &:hover { background: #f4f6f8; font-weight:500; }
          }
        }
      }
    }

    .body { background: #f6f8fa; padding:10px;
      .input-wrapper { display:flex;
        input { border-radius:2px 0 0 2px; border:none; flex:1 0 0; padding:10px; }
        button { border-radius:0 2px 2px 0; font-weight:500; font-size:15px; justify-content: center; width:60px;
          i { margin-right: 0; }
        }
      }
    }
  }

  .search-results {
    .result button { width:100%; }
    .no-results-found { align-items: center; display:flex; flex-direction: column; justify-content: center; height:200px; margin:0 20px; }
  }
</style>
