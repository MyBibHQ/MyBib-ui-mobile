<template>
  <div class="view">
    <mu-appbar>
      <mu-icon-button :to="{name: 'Root'}" icon="arrow_back" slot="left"/>
      <div>Settings</div>
    </mu-appbar>

    <form @submit.prevent="save">
      <div style="padding:14px;">
        <div class="fields">
          <div class="field string">
            <label>Email</label>
            <div class="input">
              <input type="email" placeholder="Email address" v-model="email" required />
            </div>
          </div>
          <div class="field string">
            <label>Password</label>
            <div>
              <router-link :to="{name: 'SettingsChangePassword'}" class="blue">Change password</router-link>
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
  name: 'Settings',
  data () {
    return {
      email: '',
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
      this.user.email = this.email;

      this.isSaving = true;
      const wasSuccessful = await this.user.save();
      this.isSaving = false;

      if (wasSuccessful) {
        SnackBar.addSnack({
          message: '👍 Settings updated.'
        })
        this.$router.push({name: 'Root'});
      } else {
        SnackBar.addSnack({
          message: '⛔ Settings couldn\'t be updated. Please try again.'
        })
      }
    }
  },
  mounted () {
    if (!this.user.hasRegistered) {
      this.$router.push({name: 'Root'});
    }

    this.email = this.user.email;
  }
}
</script>

<style lang="scss" scoped>
  .fields {
    .field { margin-bottom:20px;
      label { align-items:center; display:flex; font-size:14px; font-weight:700; text-transform:uppercase; }
      .input { display:flex; position:relative; }
      input[type=text], input[type=email] { border:1px solid #d7dbe0; border-radius:3px; box-shadow:0 1px 1px rgba(0,0,0,0.1); padding:6px 12px; }
      &.string {
        input { width:100%; }
      }
    }
  }

  .actions { align-items:center; border-top:1px dotted #e9eaed; display:flex; justify-content:center; padding:20px; }
</style>
