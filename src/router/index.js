import Vue from 'vue';
import Router from 'vue-router';
import Root from '@/components/Root';
import ProjectView from '@/components/ProjectView';
import NewReferenceSearch from '@/components/NewReferenceSearch';
import NewReference from '@/components/NewReference';
import ReferenceNotes from '@/components/ReferenceNotes';
import EditReference from '@/components/EditReference';
import Styles from '@/components/Styles';
import ImportReferences from '@/components/ImportReferences';
import Settings from '@/components/Settings';
import SettingsChangePassword from '@/components/SettingsChangePassword';

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Root',
      component: Root
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/settings/change-password',
      name: 'SettingsChangePassword',
      component: SettingsChangePassword
    },
    {
      path: '/import/:importToken',
      name: 'ImportExternal',
      component: ImportReferences
    },
    {
      path: '/projects',
      redirect: { name: 'Root' }
    },
    {
      path: '/projects/:projectId',
      name: 'Project',
      component: ProjectView
    },
    {
      path: '/projects/:projectId/citation/new',
      name: 'NewReferenceSearch',
      component: NewReferenceSearch
    },
    {
      path: '/projects/:projectId/citation/new/:sourceId',
      name: 'NewReference',
      component: NewReference
    },
    {
      path: '/projects/:projectId/citation/:referenceId/notes',
      name: 'ReferenceNotes',
      component: ReferenceNotes
    },
    {
      path: '/projects/:projectId/citation/:referenceId/edit/:sourceId',
      name: 'EditReference',
      component: EditReference
    },
    {
      path: '/projects/:projectId/style',
      name: 'Styles',
      component: Styles
    }
  ]
})
