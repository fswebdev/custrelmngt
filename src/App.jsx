import * as React from 'react';
import { Admin, Resource, ListGuesser, defaultTheme } from 'react-admin';
import {
    unstable_createMuiStrictModeTheme,
    createTheme,
} from '@material-ui/core/styles';

import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import Layout from './Layout';
import contacts from './contacts';
import companies from './companies';
import deals from './deals';
import { Dashboard } from './dashboard/Dashboard';

const theme =
    process.env.NODE_ENV !== 'production'
        ? unstable_createMuiStrictModeTheme(defaultTheme)
        : createTheme(defaultTheme);

const App = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        layout={Layout}
        dashboard={Dashboard}
        theme={theme}
    >
        <Resource name="deals" {...deals} />
        <Resource name="contacts" {...contacts} />
        <Resource name="companies" {...companies} />
        <Resource name="contactNotes" />
        <Resource name="dealNotes" />
        <Resource name="tasks" list={ListGuesser} />
        <Resource name="sales" list={ListGuesser} />
        <Resource name="tags" list={ListGuesser} />
    </Admin>
);

export default App;
