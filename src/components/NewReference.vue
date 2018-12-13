<template>
  <div class="view">
    <ReferenceForm actionWord="New" :referenceMetadata="referenceMetadata"></ReferenceForm>

    <div class="actions">
      <mu-raised-button @click="saveReference()" :disabled="isSaving" :label="isSaving? 'Saving...' : 'Save'" icon="check" secondary/>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js';
import MessageBus from '@/services/messageBus.js';
import SnackBar from '@/services/snackBar.js';
import ReferenceMetadata from '@/classes/ReferenceMetadata.js';
import copyHtmlToClipboard from '@/utils/copyHtmlToClipboard.js';

import ReferenceForm from '@/components/ReferenceForm';

export default {
  name: 'NewReference',
  components: { ReferenceForm },
  data () {
    return {
      referenceMetadata: {},
      urlToImage: '',
      isSaving: false
    };
  },
  computed: {
    source () {
      return Config.sources.find((s) => {
        return s.id === this.$route.params.sourceId;
      });
    }
  },
  methods: {
    async saveReference () {
      this.isSaving = true;
      const selectedProject = this.$store.getters.user.projects.find((p) => { return p.id === parseInt(this.$route.params.projectId) });
      const newReference = await selectedProject.addReference({sourceId: this.$route.params.sourceId, urlToImage: this.urlToImage, metadata: this.referenceMetadata})
      // await selectedProject.loadReferences();
      if (newReference) {
        SnackBar.addSnack({
          message: '👍 ' + this.$t('Reference') + ' added!',
          action: 'Copy to clipboard',
          actionColor: '#d6d6d6',
          actionClick: () => {
            copyHtmlToClipboard(newReference.formattedStr);
          }
        });
        this.$router.push({ name: 'Project', params: { projectId: selectedProject.id } })
      } else {
        this.isSaving = false;
      }
    }
  },
  beforeMount () {
    // if the source type doesn't exist, redirect
    if (!this.source) {
      this.$router.push({name: 'NewReferenceSearch'});
    }

    this.referenceMetadata = Object.assign(new ReferenceMetadata(), MessageBus.newReference.metadata);
    this.referenceMetadata.addNamePlaceholders();
    this.urlToImage = MessageBus.newReference.urlToImage;
  }
}
</script>

<style lang="scss" scoped>
  .actions { align-items:center; background:#fff; border-top:1px dotted #e9eaed; bottom:0; display:flex; left:0; justify-content:center; padding:20px; position:absolute; right:0; }
</style>
