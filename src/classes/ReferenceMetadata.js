export default class ReferenceMetadata {
  author = [{}];
  collectionEditor = [{}];
  composer = [{}];
  containerAuthor = [{}];
  director = [{}];
  editor = [{}];
  editorialDirector = [{}];
  illustrator = [{}];
  interviewer = [{}];
  originalAuthor = [{}];
  recipient = [{}];
  reviewedAuthor = [{}];
  translator = [{}];

  accessed = {};
  eventDate = {};
  issued = {};
  originalDate = {};
  submitted = {};

  'abstract';
  annote;
  archive;
  archiveLocation;
  archivePlace;
  authority;
  callNumber;
  citationLabel;
  citationNumber;
  collectionTitle;
  containerTitle;
  containerTitleShort;
  dimensions;
  doi;
  edition;
  event;
  eventPlace;
  firstReferenceNoteNumber;
  genre;
  isbn;
  issn;
  issue;
  jurisdiction;
  keyword;
  locator;
  medium;
  note;
  number;
  numberOfPages;
  originalPublisher;
  originalPublisherPlace;
  originalTitle;
  page;
  pageFirst;
  pmcid;
  pmid;
  publisher;
  publisherPlace;
  references;
  reviewedTitle;
  scale;
  section;
  source;
  status;
  title;
  titleShort;
  url;
  version;
  volume;
  yearSuffix;

  rawStr;

  addNamePlaceholders () {
    if (this.author.length === 0) {
      this.author.push({})
    }
    if (this.collectionEditor.length === 0) {
      this.collectionEditor.push({})
    }
    if (this.composer.length === 0) {
      this.composer.push({})
    }
    if (this.containerAuthor.length === 0) {
      this.containerAuthor.push({})
    }
    if (this.director.length === 0) {
      this.director.push({})
    }
    if (this.editor.length === 0) {
      this.editor.push({})
    }
    if (this.editorialDirector.length === 0) {
      this.editorialDirector.push({})
    }
    if (this.illustrator.length === 0) {
      this.illustrator.push({})
    }
    if (this.interviewer.length === 0) {
      this.interviewer.push({})
    }
    if (this.originalAuthor.length === 0) {
      this.originalAuthor.push({})
    }
    if (this.recipient.length === 0) {
      this.recipient.push({})
    }
    if (this.reviewedAuthor.length === 0) {
      this.reviewedAuthor.push({})
    }
    if (this.translator.length === 0) {
      this.translator.push({})
    }
  }
}
