<template>
  <div>
    <mu-bottom-sheet :open="open" @close="$emit('close')">
      <div class="options-sheet">
        <button @click="$emit('close')" class="close">
          <i class="material-icons">close</i>
        </button>

        <div class="sheet-title">Download Bibliography</div>
        <div class="options">
          <div>
            <button class="btn btn-outline" @click="toggleCopyAndPasteSheet()">
              <img src="~../../static/images/clipboard.svg" style="width:40px;"/>
            </button>
            <div>Copy &amp; paste</div>
          </div>
          <div>
            <a :href="'/download/' + selectedProject.id + '/docx'" class="btn btn-outline">
              <img src="~../../static/images/ms_word_logo.svg" style="width:36px;" />
            </a>
            <div>Word</div>
          </div>
          <div>
            <a :href="'/download/' + selectedProject.id + '/bibtex'" class="btn btn-outline">
              <img src="~../../static/images/bibtex_logo.svg" style="width:56px;" />
            </a>
            <div>BibTeX</div>
          </div>
          <div>
            <a :href="'/download/' + selectedProject.id + '/ris'" class="btn btn-outline" style="color:#bc2426;">
              <i class="ai ai-mendeley"></i>
            </a>
            <div>Mendeley</div>
          </div>
          <div>
            <a :href="'/download/' + selectedProject.id + '/ris'" class="btn btn-outline" style="color:#900;">
              <i class="ai ai-zotero"></i>
            </a>
            <div>Zotero</div>
          </div>
          <div>
            <button class="btn btn-outline" @click="toggleEmailDialog">
              <i class="material-icons">email</i>
            </button>
            <div>Email</div>
          </div>
          <div>
            <button class="btn btn-outline" @click="printBibliography()">
              <i class="material-icons">print</i>
            </button>
            <div>Print</div>
          </div>
          <div>
            <a :href="'/download/' + selectedProject.id + '/backup'" class="btn btn-outline">
              <i class="material-icons">save</i>
            </a>
            <div>Save backup</div>
          </div>
        </div>
      </div>
    </mu-bottom-sheet>

    <mu-bottom-sheet :open="showCopyAndPasteSheet" @close="showCopyAndPasteSheet = false" sheetClass="copy-and-paste-page">
      <button @click="showCopyAndPasteSheet = false" class="close">
        <i class="material-icons">close</i>
      </button>
      <mu-flat-button @click="copyBibliographyToClipboard" :icon="copyBibliographyToClipboardIcon" class="outline" style="min-width:40px; position:absolute; right:60px; top:16px; text-transform:uppercase;"/>
      <div ref="copyAndPastePage" class="doc">
        <div :style="'font-size:' + selectedProject.titleSize + 'em; line-height:'+ selectedProject.lineSpacing +'em; margin-bottom:' + selectedProject.titleSpacing + 'em; text-align:' + selectedProject.titleAlign + ';'">{{selectedProject.titleText}}</div>
        <div>
          <p v-for="(reference, index) in selectedProject.references" :key="index" :style="'margin-top:0; margin-bottom:' + selectedProject.entrySpacing + 'em; line-height:' + (selectedProject.lineSpacing < 2 ? 1.5 : selectedProject.lineSpacing) + 'em;' + (selectedProject.hasHangingIndent ? 'margin-left:4em; text-indent: -4em;' : '')" v-html="reference.formattedStr"></p>
        </div>
      </div>
    </mu-bottom-sheet>

    <mu-dialog :open="showEmailDialog" @close="showEmailDialog = false" title="Email bibliography">
      <div class="fields">
        <div class="field string">
          <label>To (your email)</label>
          <div class="input">
            <input v-model="sendBibliographyToEmail" type="email" placeholder="you@email.com"/>
          </div>
        </div>
      </div>
      <mu-flat-button slot="actions" @click="showEmailDialog = false" label="Close"/>
      <mu-flat-button slot="actions" primary @click="emailBibliography" :disabled="bibliographyIsSending" :label="bibliographyIsSending ? 'Sending...' : 'Send'"/>
    </mu-dialog>
  </div>
</template>

<script>
import {BASE_API_URL} from '@/config.js';
import copyHtmlToClipboard from '@/utils/copyHtmlToClipboard.js';
import AccessToken from '@/services/accessToken.js';
import SnackBar from '@/services/snackBar.js';

import axios from 'axios';

export default {
  name: 'DownloadOptionsBottomSheet',
  props: ['open', 'selectedProject'],
  data () {
    return {
      showCopyAndPasteSheet: false,
      copyBibliographyToClipboardIcon: 'content_paste',
      showEmailDialog: false,
      sendBibliographyToEmail: null,
      bibliographyIsSending: false
    }
  },
  methods: {
    toggleCopyAndPasteSheet () {
      this.showCopyAndPasteSheet = true;
      this.$emit('close');
    },
    toggleEmailDialog () {
      this.showEmailDialog = true;
      this.$emit('close');
    },
    copyBibliographyToClipboard () {
      this.copyBibliographyToClipboardIcon = 'check';
      copyHtmlToClipboard(this.$refs.copyAndPastePage.innerHTML);
      setTimeout(() => {
        this.copyBibliographyToClipboardIcon = 'content_paste';
      }, 2000);
    },
    printBibliography () {
      var printWindow = window.open('', 'PRINT', 'height=' + window.innerHeight + ',width=' + window.innerWidth);

      printWindow.document.write('<html><head><title></title>');
      printWindow.document.write('<style type="text/css" media="print">@page { margin:0; } body { line-height:1.5em; margin: 1.6cm; }</style>')
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1 style="font-size:22px;">' + this.selectedProject.bibliographyTitle + '</h1>');
      const indentStyle = this.selectedProject.hasHangingIndent ? 'margin-left:4em; text-indent: -4em;' : '';
      const lineSpacingStyle = 'line-height:' + (this.selectedProject.lineSpacing < 2 ? '1.5em;' : this.selectedProject.lineSpacing + 'em;');
      const entrySpacingStyle = 'margin-bottom:' + (this.selectedProject.entrySpacing > 0 ? this.selectedProject.entrySpacing + 'em;' : '0;');
      printWindow.document.write('<div>')
      for (const referenceIndex in this.selectedProject.references) {
        printWindow.document.write('<p style="margin-top:0;' + entrySpacingStyle + lineSpacingStyle + indentStyle + '">' + this.selectedProject.references[referenceIndex].formattedStr + '</p>');
      }
      printWindow.document.write('</div></body></html>');

      printWindow.document.close(); // necessary for IE >= 10
      printWindow.focus(); // necessary for IE >= 10*/

      printWindow.print();
      printWindow.close();
    },
    async emailBibliography () {
      this.bibliographyIsSending = true;
      await axios.post(BASE_API_URL + '/download/' + this.selectedProject.id + '/email-bibliography', { email: this.sendBibliographyToEmail }, { headers: { 'Access-Token': AccessToken.get() } });
      this.bibliographyIsSending = false;
      this.showEmailDialog = false;
      SnackBar.addSnack({
        message: '📧 Bibliography sent.'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .options-sheet { padding:10px;
    .sheet-title { font-size:22px; font-weight:400; text-align:center; margin:6px 0 34px; }
    .options { align-items:center; display:flex; flex-wrap:wrap; justify-content:center;
      > div { align-items:center; display: flex; flex-direction:column; font-size:16px; justify-content:center; margin:0 10px 20px; }
      .btn { align-items:center; display:flex; filter:grayscale(100%); height:90px; justify-content:center; margin-bottom: 10px; width:96px;
        i { font-size:40px; margin:0; }
        &:hover { filter:none;}
      }
    }
    .close { position:absolute; right:20px; top:20px; }
  }
  .copy-and-paste-page {
    .doc { color:#000000; font-family: 'Times New Roman'; padding: 60px 40px;
      p { font-size:16px; }
    }
    .close { position:absolute; right:20px; top:20px; }
  }

  .fields {
    .field { margin-bottom:20px;
      label { font-size:12px; font-weight:700;padding-right:18px; text-transform:uppercase; width:150px; }
      input[type=email] { border:1px solid #d7dbe0; border-radius:3px; font-size:14px; max-height:35px; padding:12px 12px; }

      &.string {
        input { width:100%; }
      }
    }
  }

</style>
