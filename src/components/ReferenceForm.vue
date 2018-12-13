<template>
  <div>
    <mu-appbar>
      <mu-icon-button href="javascript:history.back(1)" icon="arrow_back" slot="left"/>
      <div @click="toggleSourcesMenu" style="align-items:center; display:flex;">{{actionWord}} {{source.name}} <i class="material-icons">arrow_drop_down</i></div>
      <mu-icon-button :to="{name: 'Project', params:{projectId: $route.params.projectId}}" icon="close" slot="right"/>
    </mu-appbar>
    <mu-bottom-sheet :open="sourcesMenuIsOpen" @close="handleSourcesMenuClose()" sheetClass="sources-bottom-sheet">
      <mu-menu>
        <mu-menu-item v-for="(source, index) in config.sources" :key="index" :to="{name: $route.name, params: {sourceId: source.id}, query: $route.query}" :title="source.name" replace />
      </mu-menu>
    </mu-bottom-sheet>

    <div class="reference-form" ref="referenceForm">
      <div v-if="source && referenceMetadata" class="fields">
        <div v-for="(field, index) in source.fields" :key="index" >
          <transition name="fade">
            <div v-if="field.type === 'name'" class="field names">
              <transition-group name="fade-forward">
                <ReferenceFormName v-for="name in referenceMetadata[field.id]" :key="name" :label="field.label" :name="name" :isImportant="field.isImportant" @onDelete="referenceMetadata[field.id].splice(referenceMetadata[field.id].indexOf(name), 1)"></ReferenceFormName>
              </transition-group>
              <button class="add-name-btn blue" @click="referenceMetadata[field.id].push({})">
                <span>
                  <i class="material-icons">add_circle_outline</i>Add another
                </span>
              </button>
            </div>
            <div v-if="field.type === 'string'" class="field string">
              <label>{{field.label}}</label>
              <div class="input">
                <input type="text" :placeholder="field.placeholder" :name="field.id" v-model="referenceMetadata[field.id]" :class="{'important': field.isImportant && !referenceMetadata[field.id]}"/>
              </div>
            </div>
            <div v-if="field.type === 'text'" class="field text">
              <label>{{field.label}}</label>
              <div class="input">
                <textarea :placeholder="field.placeholder" :name="field.id" v-model="referenceMetadata[field.id]" :class="{'important': field.isImportant && !referenceMetadata[field.id]}"></textarea>
              </div>
            </div>
            <div v-if="field.type === 'date'" class="field date">
              <label>{{field.label}} <span @click="setDateToToday(referenceMetadata[field.id])" class="reference-form__today-btn">(today)</span></label>
              <div class="input">
                <input type="number" placeholder="YYYY" v-model="referenceMetadata[field.id].year" :class="{'important': field.isImportant && !referenceMetadata[field.id].year}"/>
                <input type="number" placeholder="MM" v-model="referenceMetadata[field.id].month" />
                <input type="number" placeholder="DD" v-model="referenceMetadata[field.id].day" />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js';

import ReferenceFormName from '@/components/ReferenceFormName';

export default {
  name: 'ReferenceForm',
  props: ['actionWord', 'referenceMetadata'],
  components: {
    ReferenceFormName
  },
  data () {
    return {
      config: Config,
      sourcesMenuIsOpen: false,
      sourcesMenuTrigger: null,
      showMoreFields: false
    };
  },
  computed: {
    source () {
      return this.config.sources.find((s) => {
        return s.id === this.$route.params.sourceId;
      });
    }
  },
  methods: {
    toggleSourcesMenu () {
      this.sourcesMenuIsOpen = !this.sourcesMenuIsOpen
    },
    handleSourcesMenuClose () {
      this.sourcesMenuIsOpen = false;
    },
    setDateToToday (field) {
      const dt = new Date();
      field.day = dt.getDate();
      field.month = dt.getMonth() + 1;
      field.year = dt.getFullYear();
      this.$forceUpdate();
    }
  },
  created () {
    // if any of the name fields have no authors, add blank ones so the inputs appear
  },
  mounted () {
    this.sourcesMenuTrigger = this.$refs.sourcesMenuBtn;
    this.referenceFormTooltipTarget = this.$refs.referenceForm;
  }
}
</script>

<style lang="scss">
  @import '../variables.scss';

  .reference-form { bottom:56px; left:0; margin-bottom:20px; overflow-y:auto; overflow-x:hidden; padding:14px; position:absolute; right:0; top:56px;
    .fields {
      .field { margin-bottom:20px;
        label { align-items:center; display:flex; font-size:14px; font-weight:700; text-transform:uppercase; }
        .input { display:flex; position:relative;
          .reference-form__today-btn { color:$secondary-color; margin-left:10px; text-transform:uppercase; }
        }
        input[type=text], input[type=number] { border:1px solid #d7dbe0; border-radius:3px; box-shadow:0 1px 1px rgba(0,0,0,0.1); padding:8px 12px;
          &.important { background: url("./../../static/images/star.svg") no-repeat right 4px center; background-size:20px 20px; border-color:rgba(#FF5722, 0.5); }
        }
        textarea { border:1px solid #d7dbe0; border-radius:3px; box-shadow:0 1px 1px rgba(0,0,0,0.1); font-size:14px; min-height:100px; padding:12px 12px; width:100%; }

        &.names { display: block;
          .add-name-btn { font-size:16px;
            i { margin-right:4px; }
          }
        }
        &.string {
          input { width:100%; }
        }
        &.date {
          input { width:33.33%; }
        }
      }
    }
  }
  .sources-bottom-sheet { max-height:80%; overflow-y:auto; overflow-x:hidden; }
  .mu-menu-item-wrapper { font-size:inherit; }
</style>
