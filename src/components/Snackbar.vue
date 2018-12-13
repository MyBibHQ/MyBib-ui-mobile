<template>
  <mu-snackbar v-if="snackBar.activeSnack && snackBar.activeSnack.message" :message="snackBar.activeSnack.message" :action="snackBar.activeSnack.action || ''" :actionColor="snackBar.activeSnack.actionColor || ''" @actionClick="doAction" />
</template>

<script>
import SnackBar from '@/services/snackBar.js';

export default {
  name: 'Snackbar',
  data () {
    return {
      snackBar: SnackBar
    }
  },
  computed: {
  },
  methods: {
    doAction () {
      this.snackBar.activeSnack.actionClick();
      this.snackBar.removeActiveSnack();
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
