<template>
  <div class="view">
    <mu-appbar>
      <mu-icon-button :to="{name: 'Settings'}" icon="arrow_back" slot="left"/>
      <div>Change password</div>
      <mu-icon-button :to="{name: 'Root'}" icon="close" slot="right"/>
    </mu-appbar>

    <form @submit.prevent="save">
      <div style="padding:14px;">

        <div class="fields">
          <div class="field string">
            <label>New password</label>
            <div class="input">
              <input type="password" placeholder="New password" v-model="password" minlength="6" required />
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <mu-raised-button type="submit" label="Update" icon="check" :disabled="isSaving" secondary/>
      </div>
    </form>
  </div>
</template>

<script>
import SnackBar from '@/services/snackBar.js';

export default {
  name: 'SettingsChangePassword',
  data () {
    return {
      password: '',
      showPassword: false,
      isSaving: false
    }
  },
  computed: {
    user () {
      return this.$store.getters.user;
    }
  },
  methods: {
    async save () {
      this.isSaving = true;
      const wasSuccessful = await this.user.changePassword(this.password);
      this.isSaving = false;
      if (wasSuccessful) {
        SnackBar.addSnack({
          message: '👍 Password updated.'
        })
        this.$router.push({name: 'Settings'});
      } else {
        SnackBar.addSnack({
          message: '⛔ Password couldn\'t be updated. Please try again.'
        })
      }
    }
  },
  mounted () {
    if (!this.user.hasRegistered) {
      this.$router.push({name: 'Settings'});
    }
  }
}
</script>

<style lang="scss" scoped>
  .fields {
    .field { margin-bottom:20px;
      label { align-items:center; display:flex; font-size:14px; font-weight:700; text-transform:uppercase; }
      .input { display:flex; position:relative; }
      input[type=text], input[type=password] { border:1px solid #d7dbe0; border-radius:3px; box-shadow:0 1px 1px rgba(0,0,0,0.1); padding:6px 12px; }
      &.string {
        input { width:100%; }
      }
    }
  }

  .actions { align-items:center; border-top:1px dotted #e9eaed; display:flex; justify-content:center; padding:20px; }
</style>
