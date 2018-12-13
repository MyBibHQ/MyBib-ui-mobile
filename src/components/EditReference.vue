<template>
  <div class="view">
    <ReferenceForm v-if="reference" actionWord="Edit" :referenceMetadata="reference.metadata"></ReferenceForm>
    <div class="actions">
      <mu-raised-button @click="saveReference()" :disabled="isSaving" :label="isSaving ? 'Updating...' : 'Update'" icon="check" secondary />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import Config from '@/config.js';
import SnackBar from '@/services/snackBar.js';
import copyHtmlToClipboard from '@/utils/copyHtmlToClipboard.js';

import ReferenceForm from '@/components/ReferenceForm';

export default {
  name: 'EditReference',
  components: {
    ReferenceForm
  },
  data () {
    return {
      reference: {},
      isSaving: false
    };
  },
  computed: {
    source () {
      return Config.sources.find((s) => {
        return s.id === this.$route.params.sourceId;
      });
    },
    selectedProject () {
      return this.$store.getters.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    }
  },
  methods: {
    async saveReference () {
      this.isSaving = true;
      this.reference.sourceId = this.source.id;
      const referenceToUpdate = Object.assign(this.selectedProject.references.find((r) => { return r.id === parseInt(this.$route.params.referenceId) }), this.reference);
      const updatedReference = await this.selectedProject.updateReference(referenceToUpdate);
      if (updatedReference) {
        SnackBar.addSnack({
          message: '👍 ' + this.$t('Reference') + ' updated!',
          action: 'Copy to clipboard',
          actionColor: '#d6d6d6',
          actionClick: () => {
            copyHtmlToClipboard(updatedReference.formattedStr);
          }
        });
        this.$router.push({ name: 'Project', params: { projectId: this.$route.params.projectId } })
      } else {
        this.isSaving = false;
      }
    }
  },
  created () {
    const reference = this.selectedProject.references.find((r) => { return r.id === parseInt(this.$route.params.referenceId) })
    // if no reference, redirect
    if (reference) {
      this.reference = _.cloneDeep(reference);
      this.reference.metadata.addNamePlaceholders();
    } else {
      this.$router.push({ name: 'Project', params: { projectId: this.$route.params.projectId } });
    }
  }
}
</script>

<style scoped lang="scss">
  .actions { align-items:center; background:#fff; border-top:1px dotted #e9eaed; bottom:0; display:flex; left:0; justify-content:center; padding:20px; position:absolute; right:0; }
</style>
