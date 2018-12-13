<template>
  <div>
    <mu-appbar>
      <mu-icon-button :to="$route.params.projectId ? {name: 'Project', params:{projectId: $route.params.projectId}} : {name: 'Root'}" icon="arrow_back" slot="left"/>
      <div>Import {{$t('References')}}</div>
      <mu-icon-button :to="$route.params.projectId ? {name: 'Project', params:{projectId: $route.params.projectId}} : {name: 'Root'}" icon="close" slot="right"/>
    </mu-appbar>

    <Spinner v-if="isLoading"/>

    <div v-if="!isLoading">
      <div class="import-results">
        <div v-if="!isLoading && references.length === 0" class="no-results-found">There was an error while trying to import your {{$t('references')}} - the file may be formatted incorrectly. If you're sure your file is formatted correctly please send it to support@mybib.com</div>
        <ul ref="importResults">
          <li v-for="(reference, index) in references" :key="index">
            <ListReferenceDetailed :reference="reference" />
          </li>
        </ul>
      </div>

      <div class="actions">
        <div v-if="showProjectsDropdown" style="align-items:center; display:flex;">
          <label>Import to project:</label>
          <mu-select-field v-model="selectedProject" :maxHeight="200">
            <mu-menu-item v-for="project in user.projects" :key="project.id" :value="project" :title="project.title" />
          </mu-select-field>
        </div>
      </div>
      <div class="actions">
        <mu-raised-button @click="doImport()" :disabled="references.length === 0 || isSaving" :label="isSaving ? 'Importing...' : 'Import'" icon="check" secondary />
      </div>
    </div>
  </div>
</template>

<script>
import SnackBar from '@/services/snackBar.js';
import referenceImporter from '@/services/referenceImporter.js';

import ListReferenceDetailed from '@/components/ListReferenceDetailed';
import Spinner from '@/components/Spinner';

import Cookies from 'js-cookie';
import Config from '@/config.js';

export default {
  name: 'ImportReferences',
  components: {
    ListReferenceDetailed,
    Spinner
  },
  data () {
    return {
      isLoading: true,
      isSaving: false,
      references: [],
      showProjectsDropdown: false,
      selectedProject: {},
      importResultsTooltipTarget: null
    }
  },
  computed: {
    user () {
      return this.$store.getters.user;
    }
  },
  methods: {
    async doImport () {
      this.isSaving = true;
      const newReferences = await this.selectedProject.addReferences(this.references);
      this.isSaving = false;

      if (newReferences) {
        SnackBar.addSnack({message: `👍 Import complete. ${newReferences.length} ${newReferences.length > 1 ? this.$t('references') : this.$t('reference')} added!`});
        this.$router.push({ name: 'Project', params: { projectId: this.selectedProject.id } })
      }
    }
  },
  async created () {
    // load the imported references
    this.references = await referenceImporter.retrieve(this.$route.params.importToken);

    // check for if we need to show the project dropdown
    // if the project route param is selected, use that
    if (this.$route.params.projectId) {
      this.selectedProject = this.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    } else if (this.user.projects.length === 1) {
      // if the user has one project, use that
      this.selectedProject = this.user.projects[0];
    } else {
      // show the dropdown
      this.showProjectsDropdown = true;
      if (Cookies.get(Config.cookiePrefixString + '-lastSelectedProject')) {
        // if the user has a lastSelectedProject cookie
        this.selectedProject = this.user.projects.find((p) => {
          return p.id === parseInt(Cookies.get(Config.cookiePrefixString + '-lastSelectedProject'));
        });
      } else {
        this.selectedProject = this.user.projects[0];
      }
    }

    this.isLoading = false;
  },
  updated () {
    this.$nextTick(() => {
      this.importResultsTooltipTarget = this.$refs.importResults;
    })
  }
}
</script>

<style lang="scss" scoped>
  .import-results {
    .no-results-found { align-items: center; display:flex; justify-content: center; height:200px; }
  }

  .actions { align-items:center; border-top:1px dotted #e9eaed; display:flex; justify-content:center; padding:20px;
    label { font-size:13px; font-weight:500; text-transform:uppercase; }
    .mu-text-field { min-height:auto; margin-bottom:0; margin-left:16px; margin-right:16px; position:relative; top:4px; width:200px;
    }
  }
</style>
