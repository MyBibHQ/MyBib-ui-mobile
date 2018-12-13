<template>
  <div class="view">
    <mu-appbar>
      <mu-icon-button :to="{name: 'Project', params:{projectId: $route.params.projectId}}" icon="arrow_back" slot="left"/>
      <div>Change style</div>
    </mu-appbar>
    <div style="bottom:0; left:0; position:absolute; overflow-y:auto; overflow-x:hidden; right:0; top:56px;">
      <div class="current-style">
        <div>Current style:</div>
        <div style="font-weight:500;">{{selectedProject.styleName}}</div>
      </div>
      <div ref="styleSearchBox" class="search-box">
        <input v-model="searchTerm" @keyup="doSearch()" type="text" :placeholder="'Search for your ' + $t('reference') + ' style'" />
        <i class="material-icons">search</i>
      </div>
      <Spinner v-if="isLoading" />
      <div class="search-results">
        <ul>
          <li v-for="(searchResult, index) in searchResults" :key="index">
            <button @click="selectStyle(searchResult.id)" :disabled="isSaving">
              {{ searchResult.name}}
            </button>
          </li>
        </ul>
      </div>
      <div class="powered-by-csl">
        Powered by <a href="http://citationstyles.org/" target="_new">CSL</a> (<a href="https://github.com/Juris-M/citeproc-js" target="_new">citeproc-js</a>)
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from '@/components/Spinner';

import StylesApi from '@/services/stylesApi.js';

import _ from 'lodash';

export default {
  name: 'Styles',
  components: { Spinner },
  data () {
    return {
      searchTerm: '',
      searchResults: [],
      isLoading: false,
      isSaving: false
    }
  },
  computed: {
    selectedProject () {
      return this.$store.getters.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      })
    }
  },
  methods: {
    doSearch: _.debounce(async function () {
      this.isLoading = true;
      this.searchResults = await StylesApi.search(this.searchTerm);
      this.isLoading = false;
    }, 200),
    async selectStyle (styleId) {
      this.isSaving = true;
      await this.selectedProject.changeStyle(styleId);
      this.$router.push({ name: 'Project', params: { projectId: this.$route.params.projectId } })
    }
  },
  mounted () {
    this.doSearch();

    this.searchBoxTooltipTarget = this.$refs.styleSearchBox;
  }
}
</script>

<style lang="scss" scoped>
  @import '../variables.scss';

  .current-style { margin:20px 0; padding:0 10px; text-align:center; }
  .search-box { margin-bottom:10px; padding: 0 10px; position:relative;
    input[type=text] { border:1px solid #d7dbe0; border-radius:3px; box-shadow:0 1px 1px rgba(0,0,0,0.1); font-size:20px; padding:12px 12px 12px 50px; width:100%;
      &:focus { border-color:$secondary-color; }
    }
    i { color:#7e8994; left:22px; margin-top:-12px; position:absolute; top:50%; }
  }
  .search-results { background:#fff; border-top:1px dotted #e9eaed;
    ul { margin:auto; width: 396px; }
    li { align-items:center; display:flex; flex-grow:1; position:relative; }
    button { color:#7e8994; padding: 12px 20px; text-align:left; width:100%;
      &:hover { background:#f6f8fa; }
    }
  }
  .powered-by-csl { background:#ffffff; border-top:1px dotted #e9eaed; font-size:13px; opacity:0.6; padding:20px; }
</style>
