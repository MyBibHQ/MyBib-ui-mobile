<template>
  <div id="app">
    <Snackbar/>

    <Spinner v-if="user.isLoading"></Spinner>

    <div v-if="!user.isLoading && user.wasError" style="align-items:center; bottom:0; display:flex; flex-direction:column; justify-content:center; left:0; padding:0 20px; position:absolute; right:0; top:0;">
      <div style="font-size:140px;">☹️</div>
      <div style="font-size:24px; font-weight:500; text-align:center;">Oh snap! Something went wrong, please reload the page.</div>
    </div>

    <div v-if="!user.isLoading && user.isReady">
      <mu-drawer :open="$store.getters.projectsDrawerIsOpen" :docked="false" @close="toggleProjectsDrawer">
        <div class="logo">
          <img src="~../static/images/logo.svg" />
          <span style="font-weight:500;">My</span>
          <span>Bib</span>
        </div>
        <Projects/>
      </mu-drawer>

      <transition :name="transitionName">
        <router-view :key="$route.fullPath" @toggleProjectsDrawer="toggleProjectsDrawer"/>
      </transition>
    </div>

  </div>
</template>

<script>
import Projects from '@/components/Projects';
import Spinner from '@/components/Spinner';
import Snackbar from '@/components/Snackbar';

export default {
  name: 'App',
  components: { Projects, Spinner, Snackbar },
  data () {
    return {
      transitionName: 'fade-back'
    }
  },
  computed: {
    user () {
      return this.$store.getters.user;
    }
  },
  watch: {
    '$route' (to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      this.transitionName = toDepth === fromDepth ? 'no-transition' : toDepth < fromDepth ? 'fade-down' : 'fade-up'
    }
  },
  methods: {
    toggleProjectsDrawer () {
      this.$store.dispatch('toggleProjectsDrawer');
    }
  }
}
</script>

<style lang="scss">
  @import 'variables.scss';

  body { color:#2c3e50; font-size:16px; }
  a, article, body, code, dd, div, dl, dt, fieldset, footer, form, h1, h2, h3, h4, h5, h6, header, html, input[type=email], input[type=number], input[type=password], input[type=tel], input[type=text], input[type=url], legend, li, main, ol, p, pre, section, table, td, textarea, th, tr, ul { box-sizing: border-box; }
  ul { list-style-type: none; margin:0; padding:0; }
  button { background:none; border:none; color:inherit; cursor: pointer; font-family: 'Roboto', sans-serif; outline:none;
    > span { align-items:center; display:flex; }
  }
  input, textarea { border:none; font-family: 'Roboto', sans-serif; outline:none;
    &:focus { border-color:$secondary-color !important; }
  }
  a { color:inherit; text-decoration:none; }
  .btn { align-items:center; display:flex; padding:4px 12px;
    span > i:first-child { margin:0 6px 0 0; }
    &:hover { opacity:0.9; }
    &.btn-inline { display:inline-flex; margin-left:6px; margin-right:6px; }
    &[disabled] { filter:grayscale(100%); }
  }

  .btn-flat, .btn-outline, .btn-raised { border-radius:3px; font-size:13px; font-weight:500; }
  .btn-outline { border:1px solid #b6c3d0; }
  .btn-raised { padding-top:5px; padding-bottom:5px; box-shadow:0 2px 1px rgba(0,0,0,0.1); }

  ::placeholder { color: #747f8b; opacity: 1; /* Firefox */ }
  :-ms-input-placeholder { /* Internet Explorer 10-11 */ color: #747f8b; }
  ::-ms-input-placeholder { /* Microsoft Edge */ color: #747f8b; }

  .white { color:#ffffff; }
  .orange {color:$primary-color; }
  .blue { color:$secondary-color; }
  .red { color:#f44336; }

  .bg-blue { background:$secondary-color; }

  .logo { align-items:center; background:#fff; border-bottom:1px dotted #e9eaed; display:flex; font-family:'Google Sans', sans-serif; font-size:20px; padding:20px 12px;
    img { margin-right:14px; width:30px; }
  }

  .view { background:#fff; bottom:0; left:0; position:absolute; right:0; top:0; }

  .csl-left-margin { display:inline-block; min-width:1em; }
  .csl-right-inline { display:inline; }

  .mu-bottom-sheet.copy-and-paste-page { height:90vh; overflow-y:auto; }
  .mu-appbar { background-color:#fff; border-bottom:1px solid #d5d8dc; color:#2c3e50; }
  .mu-paper-1 { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }
  .mu-raised-button-primary { background-color: $primary-color; }
  .mu-raised-button-secondary { background-color: $secondary-color; }
  .mu-flat-button.disabled { filter:grayscale(100%); }
  .mu-flat-button-secondary { color: $secondary-color; }
  .mu-raised-button, .mu-flat-button { font-weight:500; text-transform: none; }
  .mu-dialog-actions, .mu-snackbar {
    .mu-flat-button-label, .mu-raised-button-label { text-transform:uppercase; }
  }
  .mu-tabs { background:#ffffff; }
  .mu-tab-link { color:#2a3c4e; }
  .mu-tab-active { color:#2a3c4e; }
  .mu-tab-link > div { align-items:center; display:flex;}
  .mu-tab-text.has-icon { margin:0 0 0 4px; }
  .actions-toolbar .mu-flat-button-label { font-size:16px; }
  .mu-tab-link-highlight { background-color:$primary-color; }

  /* Transitions */
  .fade-back-enter-active, .fade-back-leave-active { transition: all .5s }
  .fade-back-enter, .fade-back-leave-to {  opacity: 0 }
  .fade-back-enter { transform: translate3d(-50px,0,0) }
  .fade-back-leave-to { transform: translate3d(50px,0,0) }

  .fade-forward-enter-active, .fade-forward-leave-active { transition: all .5s }
  .fade-forward-enter, .fade-forward-leave-to {  opacity: 0 }
  .fade-forward-enter {  transform: translate3d(50px,0,0) }
  .fade-forward-leave-to {  transform: translate3d(-50px,0,0) }

  .fade-up-enter-active, .fade-up-leave-active { transition: all .2s }
  .fade-up-enter { opacity: 0; z-index:100; }
  .fade-up-enter { transform: translate3d(0,50px,0) }

  .fade-down-leave-active { transition: all .2s }
  .fade-down-leave-active { z-index:100; }
  .fade-down-leave-to { opacity: 0 }
  .fade-down-leave-to { transform: translate3d(0,50px,0) }

  .fade-enter-active, .fade-leave-active { transition: all .5s; }
  .fade-enter, .fade-leave-to {  opacity: 0; }

  .no-transition-enter-active, .no-transition-leave-active { transition: none; }
</style>
