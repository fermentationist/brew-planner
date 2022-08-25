import admin from "firebase-admin";
import {getAuth} from "firebase-admin/auth";
import { randomString } from "../utils/helpers.js";
import { createRequire } from "module";
import { opError } from "../server/errors.js";
const require = createRequire(import.meta.url);
const serviceAccount = require("../config/firebase-adminsdk-key.json"); // ES Modules can't import JSON for some reason

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const auth = getAuth(admin.app());

export const ALL_USER_ROLES = ["admin", "manager", "user"];
export const MANAGER_ADMINISTERED_USER_ROLES = ["user"];

export const verifyToken = authToken => {
  return auth.verifyIdToken(authToken);
};

export const createUser = async ({email, password, role, breweries, displayName}) => {
  console.log("Creating user for", email);
  if (!password) {
    password = randomString(10);
    console.log("No password submitted, using random password")
  }
  const userRecord = await auth.createUser({email, password, displayName});
  await updateUser(userRecord.uid, {role, breweries} );
  console.log(`User ${email} (${userRecord.uid}) created.`);
  return userRecord;
}

export const getUser = async ({uid, email}) => {
  try {
    if (uid) {
      const user = await auth.getUser(uid);
      return user;
    }
    if (email) {
      const user = await auth.getUserByEmail(email);
      return user;
    }
  } catch (error) {
    const err = opError("User not found", {name: "not_found"});
    throw err; 
  }
  throw opError("getUser requires uid or email");
}

export const getBreweryUsers = async (breweryId) => {
  if (!breweryId) {
    throw "getBreweryUsers requires breweryId";
  }
  const allUsers = await getAllUsers();
  const breweryUsers = allUsers.filter(userRecord => userRecord.customClaims?.breweries?.includes(breweryId));
  return breweryUsers;
}

export const getAllUsers = async (nextPageToken) => {
  // List batch of users, 1000 at a time.
  try {
    const allUsers = [];
    const {users, pageToken} = await auth.listUsers(1000, nextPageToken);
    allUsers.push(...users);
    if (pageToken) { // there are more results
      allUsers.push(...getAllUsers(pageToken)); // recur
    }
    return allUsers;
  } catch (error) {
    console.log("Error getting users");
    console.error(error);
  }
};

export const deleteUser = async uid => {
  await auth.deleteUser(uid);
  console.log(`User with uid ${uid} deleted.`);
  return true;
}

export const updateUser = async (uid, newClaims, merge = true) => {
  let claims = newClaims;
  if (merge) {
    const user = await getUser({uid});
    const existingClaims = user.customClaims || {};
    claims = {
      ...existingClaims,
      ...newClaims
    }
  }
  return auth.setCustomUserClaims(uid, claims);
}

export const generatePasswordResetLink = async email => {
  const resetLink = await auth.generatePasswordResetLink(email);
  return resetLink;
}

