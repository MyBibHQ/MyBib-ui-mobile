<template>
  <div class="view">
    <mu-appbar>
      <mu-icon-button @click="$store.dispatch('toggleProjectsDrawer')" icon="menu" slot="left"/>
      <div>{{ selectedProject.title }}</div>
      <mu-icon-menu v-if="user.hasRegistered" icon="account_box" slot="right">
        <mu-sub-header>{{user.email || user.firstName}}</mu-sub-header>
        <mu-menu-item :to="{name: 'Settings'}" title="Settings" leftIcon="settings"/>
        <mu-menu-item href="?desktop" title="Switch to desktop mode" leftIcon="desktop_windows"/>
        <mu-divider />
        <mu-menu-item @click="handleUserLogout" title="Logout" leftIcon="directions_run"/>
      </mu-icon-menu>
      <mu-icon-menu v-if="!user.hasRegistered" icon="account_box" slot="right">
        <mu-menu-item href="/register" title="Create a free account" leftIcon="person_add"/>
        <mu-menu-item href="?desktop" title="Switch to desktop mode" leftIcon="desktop_windows"/>
        <mu-divider/>
        <mu-menu-item href="/login" title="Login" leftIcon="person"/>
      </mu-icon-menu>
    </mu-appbar>

    <form action="/logout" method="POST" ref="logoutForm" style="display:none"></form>

    <div class="project">
      <div class="actions-toolbar">
        <mu-flat-button :to="{ name: 'Styles', params: { projectId: $route.params.projectId }}" :label="selectedProject.styleName.length > 18 ? selectedProject.styleName.substring(0, 18) + '…' : selectedProject.styleName + ' style'" icon="spellcheck"/>
        <mu-flat-button @click="showDownloadSheet" :class="{disabled: selectedProject.references.length === 0 /* using a class instead of attribute so that it's still clickable for an alert */}" label="Download" icon="file_download" backgroundColor="#2196f3" color="#ffffff"/>
      </div>

      <div v-if="selectedProject.references.length > 0" class="project-toolbar">
        <div class="search-wrapper">
          <i class="material-icons">search</i>
          <input v-model="toolbarOptions.searchTerm" @keydown.enter="blurSearchTermInput($event)" type="text" class="search-box" placeholder="Search project..."/>
        </div>
        <div style="padding-left:14px;">
          <button @click="displayModeMenuIsOpen = !displayModeMenuIsOpen" ref="displayModeMenuBtn">
            <span>
              <span style="font-size:15px; text-transform:uppercase;">{{selectedProject.referenceDisplayMode}}</span>
              <i class="material-icons" style="color:rgba(0,0,0,0.12)">arrow_drop_down</i>
            </span>
          </button>
          <mu-popover :autoPosition="false" :trigger="$refs.displayModeMenuBtn" :open="displayModeMenuIsOpen" :anchorOrigin="{vertical: 'top', horizontal: 'right'}" :targetOrigin="{vertical: 'top', horizontal: 'right'}" @close="displayModeMenuIsOpen = false">
            <mu-menu>
              <mu-menu-item @click="changeDisplayMode('formatted')" title="Formatted"/>
              <mu-menu-item @click="changeDisplayMode('details')" title="Details"/>
            </mu-menu>
          </mu-popover>
        </div>
      </div>

      <div v-if="selectedProject.isLoading" style="position:relative; top:94px; width:100%;">
        <Spinner />
      </div>
      <div v-else-if="selectedProject.references.length === 0" style="left:30px; position:absolute; right:30px; text-align:center; top:94px;">
        <div style="margin-bottom:10px;">There are no {{$t('references')}} in this project yet.</div>
        <mu-raised-button :to="{name: 'NewReferenceSearch', params: {projectId: $route.params.projectId}}" :label="'Add ' + $t('Reference')" icon="add" style="text-transform:none;" primary/>
      </div>
      <transition-group v-else class="references" name="fade-forward" tag="ul">
        <ProjectViewReference v-for="reference in filteredReferences" :key="reference.id" :ref="'reference_' + reference.id" :reference="reference"/>
      </transition-group>

      <tap-target :show="addReferenceTapTargetIsOpen" :target="addReferenceTapTargetTarget" @close="addReferenceTapTargetIsOpen = false" contentLocation="nw" title="Get started!" :content="'Add ' + $t('references') + ' to your project with this button.'"/>
      <mu-float-button :to="{name: 'NewReferenceSearch', params: {projectId: $route.params.projectId}}" ref="addReferenceFab" icon="add" backgroundColor="#ff8065" class="add-reference-fab"/>

      <DownloadOptionsBottomSheet :open="downloadSheetIsShowing" @close="downloadSheetIsShowing = false" :selectedProject="selectedProject" />
    </div>
  </div>
</template>

<script>
import ProjectViewReference from '@/components/ProjectViewReference';
import DownloadOptionsBottomSheet from '@/components/DownloadOptionsBottomSheet';
import Spinner from '@/components/Spinner';

import _ from 'lodash';
import Cookies from 'js-cookie';
import Config from '@/config.js';

export default {
  name: 'ProjectView',
  components: { ProjectViewReference, DownloadOptionsBottomSheet, Spinner },
  data () {
    return {
      toolbarOptions: { searchTerm: '' },
      displayModeMenuIsOpen: false,
      downloadSheetIsShowing: false,
      addReferenceTapTargetTarget: null,
      addReferenceTapTargetIsOpen: false
    }
  },
  computed: {
    user () {
      return this.$store.getters.user;
    },
    selectedProject () {
      return this.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    },
    filteredReferences () {
      const filteredReferences = this.selectedProject.references.filter(r => (Object.values(r.metadata).join(' ') + ' ' + r.formattedStr).toLowerCase().indexOf(this.toolbarOptions.searchTerm.toLowerCase()) !== -1);
      // then sort if we're showing details
      return this.selectedProject.referenceDisplayMode === 'details' ? _.sortBy(filteredReferences, 'metadata.title') : filteredReferences;
    }
  },
  methods: {
    showDownloadSheet () {
      if (this.selectedProject.references.length > 0) {
        this.downloadSheetIsShowing = true;
      } else {
        alert(`There are no ${this.$t('references')} in this project yet. Add a ${this.$t('reference')} before trying to download.`);
      }
    },
    handleDisplayModeDropDownChange (val) {
      this.selectedProject.referenceDisplayMode = val;
    },
    handleUserLogout () {
      this.$refs.logoutForm.submit();
    },
    blurSearchTermInput (event) {
      event.target.blur();
    },
    changeDisplayMode (displayMode) {
      this.selectedProject.referenceDisplayMode = displayMode;
      this.displayModeMenuIsOpen = false;
    }
  },
  mounted () {
    this.$nextTick(() => {
      // scroll to a new or edited reference
      const highlightedReference = this.selectedProject && this.selectedProject.references.find((r) => {
        return r.isHighlighted;
      });
      if (highlightedReference) {
        const highlightedReferenceEl = this.$refs['reference_' + highlightedReference.id][0].$el;
        this.$scrollTo(highlightedReferenceEl, 1, { container: highlightedReferenceEl.parentNode, offset: -200 });
      }
    });

    this.addReferenceTapTargetTarget = this.$refs.addReferenceFab;
    if (!Cookies.get(Config.cookiePrefixString + '-introComplete')) {
      Cookies.set(Config.cookiePrefixString + '-introComplete', 1);
      setTimeout(() => {
        this.addReferenceTapTargetIsOpen = true;
      }, 1000);
    }

    // change title
    document.title = this.selectedProject ? this.selectedProject.title + ' - MyBib' : 'MyBib';
  }
}
</script>

<style lang="scss" scoped>
  @import '../variables.scss';

  .project { bottom:0; left:0; overflow-y:auto; overflow-x:hidden; position:absolute; right:0; top:56px; }

  .actions-toolbar { align-items:center; background:#F5F7F9; display:flex; justify-content: space-between; height:60px; padding:0 10px; }

  .project-toolbar { align-items:center; background:#fff; border-bottom:1px dotted #e9eaed; border-top:1px dotted #e9eaed; display:flex; height:56px; justify-content:space-between; padding:0 10px;
    .search-wrapper { align-items:center; border-right:1px dotted #e9eaed; display:flex; flex-grow:1; position:relative;
      i { left:4px; position:absolute;
        &.active { color: $secondary-color; }
      }
      .search-box { padding:12px 12px 12px 32px; width:100%; }
    }

    .mu-dropDown-menu { position:relative; right:-20px; }
  }

  .references { background:#ffffff; min-height:100%; padding-bottom:60px; }

  .add-reference-fab { bottom:18px; position:fixed; right:18px; }

  @media (min-width: 480px) {
    .project { top: 64px; }
  }
</style>
