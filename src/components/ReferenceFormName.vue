<template>
  <div class="name">
    <div class="label">
      <button @click="dropdownIsOpen = true" ref="dropdownTrigger">
        <span>
          {{labelToDisplay}}  <i class="material-icons">arrow_drop_down</i>
        </span>
      </button>
      <mu-popover :trigger="dropdownTrigger" :open="dropdownIsOpen" @close="dropdownIsOpen = false">
        <mu-menu>
          <mu-menu-item :title="label" @click="useLiteralName(false)"/>
          <mu-menu-item title="Organization" @click="useLiteralName(true)"/>
        </mu-menu>
      </mu-popover>
    </div>
    <div class="input">
      <input v-if="!literalNameIsSelected" type="text" v-model="name.given" :class="{'important': isImportant && !name.given}" placeholder="First name(s)" />
      <input v-if="!literalNameIsSelected" type="text" v-model="name.family" :class="{'important': isImportant && !name.family}" placeholder="Surname"/>
      <input v-if="literalNameIsSelected" type="text" v-model="name.literal" class="expand" placeholder="Company or organization name"/>
      <button class="remove-name-btn red" title="Remove person" @click="$emit('onDelete')">
        <span>
          <i class="material-icons">remove_circle_outline</i>
        </span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReferenceFormName',
  props: ['label', 'name', 'isImportant'],
  data () {
    return {
      dropdownIsOpen: false,
      literalNameIsSelected: false
    }
  },
  computed: {
    labelToDisplay () {
      return this.literalNameIsSelected ? 'Organization' : this.label
    }
  },
  methods: {
    useLiteralName (useLiteralName) {
      this.literalNameIsSelected = useLiteralName;
      if (useLiteralName) {
        this.name.given = null;
        this.name.family = null;
      } else {
        this.name.literal = null;
      }

      this.dropdownIsOpen = false;
    }
  },
  beforeMount () {
    if (this.name.literal) {
      this.literalNameIsSelected = true;
    }
  },
  mounted () {
    this.dropdownTrigger = this.$refs.dropdownTrigger
  }
}
</script>

<style lang="scss" scoped>
  .name { margin-bottom:10px; }
  .label { align-items:center; display:flex; font-size:14px; font-weight:700; position:relative; text-transform:uppercase;
    button { padding:0; text-transform:uppercase;}
    i { margin-right:-8px; }
  }
  .dropdown { background:#ffffff; border:1px solid #d7dbe0; left:0; position:absolute; top:0; width:160px; z-index:5;
    button { justify-content:center; padding: 6px 2px; width:100%;
      &:first-child { border-bottom: 1px dotted #d7dbe0; }
      &:hover { background: darken(#ffffff, 2%);}
      &.selected { background:#f6f8fa;
        &:hover { background: darken(#f6f8fa, 2%);}
      }
    }
  }
  input { width:50%;
    &.expand { width:100%; }
  }
</style>
