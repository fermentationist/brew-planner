
// API Test Class

import axios from "axios";
import { config } from "dotenv";
import assert from "assert";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import app from "../src/server/app.js"; // importing to start server
import { createUser, deleteUser, getIDToken, updateUser } from "./firebase.js";
import { randomString } from "../src/utils/helpers.js";

config();

const PORT = process.env.SERVER_PORT;
const TEST_MODE = process.env.TEST_MODE === "false" ? false : true;

if (!TEST_MODE) {
  throw "Must be in TEST_MODE to run tests!";
}

export default class TestAPI {
  constructor(config = {}) {
    this.config = config;
    this.config.baseURL = config.baseURL || `http://localhost:${PORT}/api`;
    this.config.headers = config.headers || {};
    this.user = {
      email: null,
      password: null,
      accessToken: null,
      uid: null,
      role: null,
      breweries: []
    };
  }

  handleError(error) {
    throw error;
  }

  async signInAsNewUser({
    email = `${randomString(6)}@example.com`,
    password = randomString(10),
    role = "user",
    breweries = []
  } = {}) {
    this.user.email = email;
    this.user.password = password;
    this.user.role = role;
    this.user.breweries = breweries;
    this.user.userRecord = await createUser({ email, password, role, breweries });
    this.user.uid = this.user.userRecord.uid;
    await this.signIn();
  }

  async signIn(email = this.user.email, password = this.user.password) {
    const {
      user: { accessToken }
    } = await getIDToken(email, password);
    this.user.accessToken = accessToken;
    this.setHeader("Firebase-Token", accessToken);
  }

  signOut() {
    this.setHeader("Firebase-Token", null);
  }

  async deleteUser() {
    this.signOut();
    await deleteUser(this.user.uid);
    this.user = {
      email: null,
      password: null,
      accessToken: null,
      uid: null,
      role: null,
      breweries: []
    };
  }

  async updateUserAuthClaims ({role, breweries}) {
    let newClaims = {};
    if (role) {
      newClaims.role = role;
    }
    if (breweries) {
      newClaims.breweries = breweries;
    }
    await updateUser(this.user.uid, newClaims);
    await this.signIn();
  }

  request(config = {}) {
    for (const attr in this.config) {
      config[attr] = this.config[attr];
    }
    return axios(config)
      .then(response => {
        if (config.expected) {
          for (const key in config.expected) {
            if (response.data[key]) {
              assert.equal(
                response.data[key],
                config.expected[key],
                "actual does not match expected for " + key
              );
            }
          }
        }
        return response.data;
      })
      .catch(error => {
        if (error?.response?.data?.error) {
          error.response.data.error.message = `api path: ${config.url}, method: ${config.method}
          ${error.response.data.error.message}`;
          this.handleError(error.response.data.error);
        } else {
          error.message = `api path: ${config.url}, method: ${config.method}\n${error.message}`;
          this.handleError(error);
        }
      });
  }

  setHeader(key, value) {
    if (!this.config.headers) {
      this.config.headers = {};
    }
    this.config.headers[key] = value;
  }

  getHeaders(key) {
    return this.config.headers[key];
  }

  hasHeader(key) {
    return this.config.headers[key] ? true : false;
  }
}
