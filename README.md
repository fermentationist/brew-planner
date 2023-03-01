# brew-planner
---

A full stack React application for creating brewing recipes. A work in progress.

This application uses an Express.js REST API, written in Node.js, with a MySQL database.

---

## Installation

1. **`cd` into project root.**
2. **Type `pnpm install`.**
3. **To serve production build, type `pnpm start`.** Or to run dev server, type `pnpm run dev`.

---

### Project Structure

* **api/** - **The API**.
  * **scripts/** - Utility scripts, typically to be executed on the command line instead of being programmatically loaded and executed.
  * **src/** - The API source code.
    * **config/** - API configuration files.
      * **`dbConfig.js`** - The database configuration. Imported by **`api/src/services/db/index.js`**, where connection is created.
      * **`firebase-adminsdk-key.json`** - Needed to configure Firebase Auth Admin API.
    * **controllers/** - The controllers (primary request handlers) for the Express API.
    * **integrations/** - Third party integrations and services.
    * **middleware/** - Middleware (intermediate request handlers) for the Express API
      * **`auth.js`** - Middleware to authenticate client requests, and to restrict access by authorization status.
      * **`error-handler.js`** - Exports error handling middleware. Importing it will also register listeners for `unhandledRejection` and `uncaughtException` errors, as well as `rejectionHandled` and `warning` events.
      * **`input-validation.js`** - Exports various middleware functions that assist in input validation and sanitization.
    * **models/** - Database models and classes.
      * **`Model.js`** - Class used to create database models.
      * **`Models.js`** - Contains database models that have been instantiated using the `Model` class. Add new models here.
    * **routes/** - Express API routes.
      * **`index.js`** - Primary API router.
    * **server/** - The Express server and related files
      * **`app.js`** - This file instantiates the Express API server, and as such, is the entry point of the application.
      * **`errors.js`** - Custom error objects
      * **`responses.js`** - Exports custom response methods: `sendResponse` and `sendError`.
    * **services/** - Services used by the application to store or update data. In most cases, intermediate methods used by controllers to interact with models. The pattern is controller > service > model.
      * **db/** - A self-authored MySQL database adapter package.
        * **`index.js`** - Here is where the database connection is created.
      * **localCache/** - A self-authored, simple in-memory cache package.
        * **`index.js`** - Here is where the in-memory cache is instantiated.
    * **utils/** - Contains helper functions and utilities
  * **test/** - Backend test setup and helpers.
* **db/** - **The database**.
  * **scripts/** - Database scripts.
    * **deploy/** - Database deployment scripts.
      * **`deploy.js`** - Run this script (`node db/scripts/deploy/deploy.js` from project root) to deploy the database, by executing all of the SQL scripts enumerated in **`scriptList.js`** (in order), and then executing any update scripts found in **`db/sql/update`** (as sorted by name, with the expectation that update scripts are named starting with a sortable timestamp or index, like `1677694021206_add_example_column_to_brewery.sql`).
      * **`scriptList.js`** - An array defining the database creation scripts to be run (and in what order) by **`deploy.js`**. Add new database creation scripts to the **`db/sql/`** folder and then include them in this array.
  * **sql/** - This folder contains database creation scripts. In order for a new script added here to be run, it must also be included in **`db/scripts/deploy/scriptList.js`**.
    * **update/** - When deploying the database, SQL scripts included in this folder will be run, in alphanumeric order, following the database creation scripts.
* **src/** - **The client application**.
  * **componentFactories** - Functions for constructing React components.
  * **components** - Reusable React components.
  * **config/** - Configuration files.
    * **themes/** - MUI themes.
    * **`firebaseConfig.ts`** - Client config for Firebase Auth.
    * **`menuItems.ts`** - Config for the app's main menu.
    * **`queryClientConfig.ts`** - React Query config.
    * **`routeConfig.tsx`** - Client routes are configured here.
    * **`unitDefaults.ts`** - For unit conversion to work for a field, a default unit must be configured in this file.
  * **context/** - Various context provider components.
    * **AlertStateProvider** - This context controls the display of alert and confirm dialogues, and includes methods for invoking them.
    * **APIProvider** - All API "get" requests are configured here, using React Query, and exported along with some API methods.
    * **AuthProvider** - Initialization of Firebase auth occurs here. Exports auth state as well as related methods.
    * **GlobalStateProvider** - Context provider for global state object (used for some global options like preferred units or theme).
  * **hoc/** - Higher-order components (functions that augment an existing component).
  * **hooks/** - Custom React hooks.
    * **`useAlert.ts`** - Returns various methods used to display an alert dialogue to the user.
    * **`useAPI.ts`** - When invoked with the name of an API query (as configured in **APIProvider**), returns various properties and methods (like `data`, `error`, `status` and `refetch`) pertaining to the state of that API request, derived from the return object of **React Query's** `useQuery` hook (https://react-query-v3.tanstack.com/reference/useQuery). If invoked *without* arguments, returns this same data, contained in an object, keyed to the API's name, but for *every* API query. In all cases, this hook also returns several methods to control the API (like `disableAll` and `resetAPI`) as well as some constants and other values (like `API_URL` and `breweryPath`) and also the `APIRequest` class.
    * **`useAuth.ts`** - Returns the current auth state, which contains among other things, the user's email, display name, uid, authorization role, an array of allowed breweries (breweryUuids), the currently selected brewery and the access token that is sent with all API requests for authentication. Importantly, the hook also returns several methods related to auth: `setAuth`, `login`, `logout` and `sendPasswordResetEmail`.
    * **`useConfirm`** - Returns methods to display a dialogue to the user, that also prompts them to select "confirm" or "cancel": `confirm`, `confirmWithInput` and `confirmDelete`.
    * **`useConvertUnits`** - Returns several methods to facilitate unit conversion across the app, including `convertToPreferredUnit`, `setPreferredUnit` and `generateColumnsFromInputs`, as well as the values `UNIT_DEFAULTS` and `preferredUnits`.
    * **`useDeeperMemo`** - Returns a function that will memoize a value, checking for changes to the value using (slightly enhanced) `JSON.stringify` comparison.
    * **`useEffectOnce`** - A version of the `useEffect` hook, that will only run (invoke callback) once.
    * **`useGlobalState`** - A hook that returns an array containing the global state object, and a method for updating the global state.
    * **`useTriggeredEffect`** - A hook that behaves like `useEffect`, except will not automatically run (invoke callback) on initial render, but only once one of the dependencies changes.
  * **pages/** - React "page" components.
  * **types/** - Typescript types.
  * **utils/** - Utilities folder, contains helper functions, **APIRequest** class, etc.
  * **main.tsx** - This is the main JavaScript file, imported by `index.html`.
  * **App.tsx** - The root React component, loaded by `main.tsx`.
* **index.html** - The HTML file that is initially loaded by the client.

---
## Credits

**brew-planner** was made by [Dennis Hodges](https://dennis-hodges.com), a JavaScript developer.

---
## License

#### Copyright © 2023 Dennis Hodges


__The MIT License__

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.