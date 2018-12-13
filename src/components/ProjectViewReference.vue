<template>
  <li class="row" :class="{ highlighted: reference.isHighlighted }" @contextmenu.prevent="toggleContextMenu">
    <router-link :to="{ name: 'EditReference', params: { projectId: reference.projectId, referenceId: reference.id, sourceId: reference.sourceId } }" class="row-body" draggable="false">
      <img v-if="reference.urlToImage" :src="reference.urlToImage" class="avatar square" :title="source && source.name" referrerpolicy="no-referrer" />
      <div v-else class="avatar" :title="source.name">
        <i class="material-icons">{{sourceIdToMaterialIconDictionary[reference.sourceId] || sourceIdToMaterialIconDictionaryDefault}}</i>
      </div>
      <div class="reference">
        <div style="float:right; height:24px; width:30px"><!--this makes a space in the text for the button above it--></div>
        <div v-if="selectedProject.referenceDisplayMode === 'formatted'" v-html="reference.formattedStr" class="formatted"></div>
        <div v-if="selectedProject.referenceDisplayMode === 'details'" class="details">
          <span v-if="reference.metadata.title" class="detail" style="font-weight:500;"><span>{{reference.metadata.title}}</span></span>
          <span class="detail">By <span>{{reference.authorStr}}</span></span>
          <span v-if="reference.metadata.issued && reference.metadata.issued.year" class="detail">Year: <span>{{reference.metadata.issued.year}}</span></span>
          <span v-if="reference.metadata.containerTitle" class="detail">Container: <span>{{reference.metadata.containerTitle}}</span></span>
          <span v-if="reference.metadata.publisher" class="detail">Publisher: <span>{{reference.metadata.publisher}}</span></span>
          <span v-if="reference.metadata.publisherPlace" class="detail">Publisher Place: <span>{{reference.metadata.publisherPlace}}</span></span>
          <span v-if="reference.metadata.edition" class="detail">Edition: <span>{{reference.metadata.edition}}</span></span>
          <span v-if="reference.metadata.volume" class="detail">Volume: <span>{{reference.metadata.volume}}</span></span>
          <span v-if="reference.metadata.issue" class="detail">Issue: <span>{{reference.metadata.issue}}</span></span>
          <span v-if="reference.metadata.page" class="detail">Page: <span>{{reference.metadata.page}}</span></span>
          <span v-if="reference.metadata.doi" class="detail">DOI: <span>{{reference.metadata.doi}}</span></span>
          <span v-if="reference.metadata.isbn" class="detail">ISBN: <span>{{reference.metadata.isbn}}</span></span>
          <span v-if="reference.metadata.url" class="detail">URL: <span style="word-break:break-all;">{{reference.metadata.url}}</span></span>
        </div>
        <div class="subline">
          <div v-if="reference.citations">{{citationLabel}}: <span v-for="(citation, index) in reference.citations" :key="index" v-html="citation"></span></div>
        </div>
      </div>
    </router-link>
    <div class="options">
      <button ref="contextMenuBtn" @click="toggleContextMenu()">
        <span>
          <i class="material-icons">more_vert</i>
        </span>
      </button>
      <mu-bottom-sheet :open="contextMenuIsOpen" @close="handleContextMenuClose">
        <mu-menu>
          <mu-menu-item v-if="reference.notes && reference.notes.length > 0" :title="reference.notes.length + ' ' + (reference.notes.length === 1 ? 'note / quote':'notes / quotes')" leftIcon=":icon-pin" :to="{ name:'ReferenceNotes', params: {projectId: reference.projectId, referenceId: reference.id }}" />
          <mu-menu-item v-if="!reference.notes || reference.notes.length === 0" title="Add notes &amp; quotes" leftIcon="add_circle_outline" :to="{ name:'ReferenceNotes', params: {projectId: reference.projectId, referenceId: reference.id }}" />
          <mu-menu-item v-if="reference.sourceId === 'article_journal' && reference.urlToResource" title="View PDF" leftIcon=":far fa-file-pdf" :href="reference.urlToResource" target="_blank"/>
          <mu-menu-item v-if="reference.sourceId === 'video' && reference.metadata.url" title="View video" leftIcon="play_circle_outline" :href="reference.metadata.url" target="_blank" />
          <mu-menu-item v-if="reference.sourceId !== 'video' && reference.metadata.url" title="View page" leftIcon="language" :href="reference.metadata.url" target="_blank" />
          <mu-divider />
          <mu-menu-item title="Copy bibliography entry to clipboard" leftIcon="content_paste" @click="copyReferenceToClipboard()" />
          <mu-menu-item :title="`Copy ${citationLabel.toLowerCase()} to clipboard`" leftIcon="content_paste" @click="copyInTextCitationToClipboard()" />
          <mu-divider />
          <mu-menu-item title="Edit" leftIcon="edit" :to="{ name: 'EditReference', params: { projectId: reference.projectId, referenceId: reference.id, sourceId: reference.sourceId } }" />
          <mu-menu-item title="Move to project..." leftIcon="content_cut" @click="openMoveReferenceDialog()" />
          <mu-menu-item title="Copy to project..." leftIcon="content_copy" @click="openCopyReferenceDialog()" />
          <mu-divider />
          <mu-menu-item title="Delete" leftIcon="delete" @click="deleteReference()" titleClass="red" leftIconClass="red" />
        </mu-menu>
      </mu-bottom-sheet>

      <mu-dialog title="Move reference" :open="moveReferenceDialogIsOpen" @close="handleMoveReferenceDialogClose" :scrollable="true">
        <ListReferenceDetailed :reference="reference" :hideIcon="true" />
        <div class="move-reference-select-field">
          <label style="font-size: 13px; font-weight: 500; text-transform: uppercase;">Move to project:</label>
          <mu-select-field v-model="moveReferenceDropDownSelectedProject" :maxHeight="200">
            <mu-menu-item v-for="project in projects" :key="project.id" :value="project" :title="project.title" />
          </mu-select-field>
        </div>
        <mu-flat-button slot="actions" @click="handleMoveReferenceDialogClose" label="Cancel"/>
        <mu-flat-button slot="actions" @click="moveReference" primary :label="moveReferenceDialogIsSaving ? 'Moving...' : 'Move'" :disabled="moveReferenceDialogIsSaving"/>
      </mu-dialog>

      <mu-dialog title="Copy reference" :open="copyReferenceDialogIsOpen" @close="handleCopyReferenceDialogClose" :scrollable="true">
        <ListReferenceDetailed :reference="reference" :hideIcon="true" />
        <div class="move-reference-select-field">
          <label style="font-size: 13px; font-weight: 500; text-transform: uppercase;">Copy to project:</label>
          <mu-select-field v-model="copyReferenceDropDownSelectedProject" :maxHeight="200">
            <mu-menu-item v-for="project in projects" :key="project.id" :value="project" :title="project.title" />
          </mu-select-field>
        </div>
        <mu-flat-button slot="actions" @click="handleCopyReferenceDialogClose" label="Cancel"/>
        <mu-flat-button slot="actions" @click="copyReference" primary :label="copyReferenceDialogIsSaving ? 'Copying...' : 'Copy'" :disabled="copyReferenceDialogIsSaving"/>
      </mu-dialog>
    </div>
  </li>
</template>

<script>
import Config from '@/config.js';
import SnackBar from '@/services/snackBar.js';

import {sourceIdToMaterialIconDictionary, sourceIdToMaterialIconDictionaryDefault} from '@/utils/sourceIdToMaterialIconDictionary.js';
import copyHtmlToClipboard from '@/utils/copyHtmlToClipboard.js';

import ListReferenceDetailed from '@/components/ListReferenceDetailed';

export default {
  name: 'ProjectViewReference',
  props: ['reference'],
  components: {
    ListReferenceDetailed
  },
  data () {
    return {
      contextMenuIsOpen: false,
      moveReferenceDialogIsOpen: false,
      moveReferenceDropDownSelectedProject: null,
      moveReferenceDialogIsSaving: false,
      copyReferenceDialogIsOpen: false,
      copyReferenceDropDownSelectedProject: null,
      copyReferenceDialogIsSaving: false,
      sourceIdToMaterialIconDictionary: sourceIdToMaterialIconDictionary,
      sourceIdToMaterialIconDictionaryDefault: sourceIdToMaterialIconDictionaryDefault
    };
  },
  computed: {
    source () {
      return Config.sources.find((s) => {
        return s.id === this.reference.sourceId;
      });
    },
    hasPages () {
      return this.source.fields.find((f) => {
        return f.id === 'page';
      })
    },
    projects () {
      return this.$store.getters.user.projects;
    },
    selectedProject () {
      return this.$store.getters.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    },
    citationLabel () {
      return this.selectedProject.styleFormat && this.selectedProject.styleFormat.indexOf('note') > -1 ? 'Footnote' : 'In-text citation';
    }
  },
  methods: {
    toggleContextMenu () {
      this.contextMenuIsOpen = !this.contextMenuIsOpen;
    },
    handleContextMenuClose () {
      this.contextMenuIsOpen = false;
    },
    copyReferenceToClipboard () {
      this.handleContextMenuClose();
      copyHtmlToClipboard(this.reference.formattedStr);
      SnackBar.addSnack({
        message: '📋 ' + this.$t('Reference') + ' copied to clipboard.'
      })
    },
    copyInTextCitationToClipboard () {
      this.handleContextMenuClose();
      copyHtmlToClipboard(this.reference.citations[0]);
      SnackBar.addSnack({
        message: '📋 In-text citation copied to clipboard.'
      })
    },
    openMoveReferenceDialog () {
      this.moveReferenceDialogIsOpen = true;
      this.contextMenuIsOpen = false;
    },
    openCopyReferenceDialog () {
      this.copyReferenceDialogIsOpen = true;
      this.contextMenuIsOpen = false;
    },
    handleMoveReferenceDialogClose () {
      this.moveReferenceDialogIsOpen = false;
    },
    handleCopyReferenceDialogClose () {
      this.copyReferenceDialogIsOpen = false;
    },
    async moveReference () {
      this.moveReferenceDialogIsSaving = true;
      const newReference = await this.moveReferenceDropDownSelectedProject.addReference(this.reference);
      this.moveReferenceDialogIsSaving = true;
      this.selectedProject.deleteReference(this.reference);

      this.handleMoveReferenceDialogClose();
      SnackBar.addSnack({
        message: '↩️ ' + this.$t('Reference') + ' moved.',
        action: 'Undo',
        actionColor: '#d6d6d6',
        actionClick: () => {
          this.moveReferenceDropDownSelectedProject.deleteReference(newReference);
          this.selectedProject.restoreLastDeletedReference();
        }
      })
    },
    async copyReference () {
      this.copyReferenceDialogIsSaving = true;
      const newReference = await this.copyReferenceDropDownSelectedProject.addReference(this.reference);
      this.copyReferenceDialogIsSaving = false;

      this.handleCopyReferenceDialogClose();
      SnackBar.addSnack({
        message: '📋 ' + this.$t('Reference') + ' copied.',
        action: 'Undo',
        actionColor: '#d6d6d6',
        actionClick: () => {
          this.copyReferenceDropDownSelectedProject.deleteReference(newReference);
        }
      })
    },
    deleteReference () {
      this.contextMenuIsOpen = false;
      this.selectedProject.deleteReference(this.reference)

      SnackBar.addSnack({
        message: '😲 ' + this.$t('Reference') + ' deleted.',
        action: 'Undo',
        actionColor: '#d6d6d6',
        actionClick: () => {
          this.selectedProject.restoreLastDeletedReference();
        }
      })
    },
    openResource (url) {
      window.open(url);
    }
  },
  mounted () {
    this.moveReferenceDropDownSelectedProject = this.projects[0];
    this.copyReferenceDropDownSelectedProject = this.projects[0];
  }
}
</script>

<style lang="scss" scoped>
  .row { position:relative; transition:all 0.5s ease;
    .row-body { display:flex; padding: 14px 14px 0 14px; width:100%; }
    .avatar { align-items:center; background:#bdbdbd; border-radius:50%; color:#fff; display:flex; height:44px; justify-content:center; margin-right:14px; margin-top:4px; width:44px;
      &.square { background:#fff; border-radius:5px; box-shadow:0 1px 2px rgba(0,0,0,0.2); object-fit:cover; }
    }
    .reference { border-bottom:1px solid #e9eaed; flex:1; font-size:16px; padding-bottom:14px;
      .formatted { line-height:1.5em; word-break:break-word; }
      .details { color:#959eba; line-height:1.6em;
        .detail { margin-right:6px; padding-right:8px;
          span { color:#2c3e50; }
          &:after { background:#959eba; content:''; display:inline-block; height:10px; left:8px; opacity:0.6; position:relative; width:1px;}
          &:last-child:after { display:none; }
        }
      }
      .subline { align-items:center; color:#747f8b; display:flex;
        .btn > i { margin-right:4px; }
      }
    }
    .options { position: absolute; right:8px; top:12px;
      button { color:#8e98a4; }
    }
    &:hover { background: linear-gradient(to right, #ffffff 0%,#f6f8fa 100%); }
    &.highlighted { background:lighten(#FCCD2D, 30%); }
  }

  .move-reference-select-field, .copy-reference-select-field { align-items:center; display:flex;
    .mu-text-field { min-height:auto; margin-bottom:0; margin-left:16px; margin-right:16px; position:relative; top:4px; width:200px; }
  }
</style>
