<template>
  <div>
    <mu-appbar>
      <div>MyBib</div>
    </mu-appbar>
    <div style="align-items:center; bottom:0; display:flex; justify-content:center; left:0; position:absolute; right:0; top:0;">You deleted all your projects! Create a new one?</div>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import Config from '@/config.js';

export default {
  name: 'Root',
  computed: {
    user () {
      return this.$store.getters.user;
    }
  },
  methods: {
    checkForProjectToSelect () {
      // check for the last selected project id
      const lastSelectedProjectId = parseInt(Cookies.get(Config.cookiePrefixString + '-lastSelectedProject'));
      if (lastSelectedProjectId && this.user.projects.some((p) => {
        return p.id === lastSelectedProjectId;
      })) {
        this.$router.replace({ name: 'Project', params: { projectId: lastSelectedProjectId } });
      } else if (this.user.projects[0]) {
        this.$router.replace({ name: 'Project', params: { projectId: this.user.projects[0].id } });
      }
    }
  },
  mounted () {
    this.checkForProjectToSelect();
  },
  updated () {
    this.checkForProjectToSelect();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
