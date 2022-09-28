/*
  Reference code for writing to Google Analytics UA and GA4
  Author: regan.king@innovation.ca.gov
  Requires Node.js 18 to use core fetch
  Usage:
  $ node --experimental-fetch app.js
  Point browser to http://localhost:8080/ to send event.
*/

// For local dev .env configuration only
require('dotenv').config()
const {PORT, GA_UA_TRACKING_ID, URL, DEBUG_URL} = process.env
let endpoint = URL

if (process.env.NODE_ENV !== 'production') {
  endpoint = DEBUG_URL
}

// Modules
const express = require('express')
const app = express()
app.enable('trust proxy')

// UUID and IP support
const uuid = require('uuid')
const uniqueRandomID = uuid.v4()
const geoip = require('geoip-lite')

// Check vars.
console.log("Starting: GA_UA_TRACKING_ID=" + GA_UA_TRACKING_ID + ", endpoint=" + endpoint + ", UUID=" + uniqueRandomID)

const trackEvent = (category, action, label, value, req) => {

  let geo = geoip.lookup(req.ip);

  const data = {
    // API Version.
    v: '1',
    // Tracking ID / Property ID.
    tid: GA_UA_TRACKING_ID,
    // Anonymous Client Identifier. Ideally, this should be a UUID that
    // is associated with particular user, device, or browser instance.
    cid: uniqueRandomID,
    // Event hit type.
    t: 'event',
    // Event category.
    ec: category,
    // Event action.
    ea: action,
    // Event label.
    el: label,
    // Event value.
    ev: value,
    // Optional User Agent
    ua: req.headers["user-agent"],
  }
const getParams = new URLSearchParams(data)
console.log("Params: " + getParams)

/* 
  // Example with JSON (gA json payload structure unknown)
  const customHeaders = {
    "Content-Type": "application/json",
  }
  ...
  {
    method: "POST",
    headers: customHeaders,
    body: JSON.stringify(data),
  }
  ...

  // Original payload (if using node-fetch)
  ...
  {
    params: getParams,
  }
  ...
*/

/* POST takes body, GET does not seem to take params as a legal value? */

  /* Error: v is not seen */
  return fetch(endpoint, {
      method: "POST",
      body: getParams
    })
    .then(res => {
      if (res.status >= 400) {
        throw new Error("Bad response from server")
      }
      // res.json() will contain error message like the following
      /*
        [
          {
            messageType: 'ERROR',
            description: "A value is required for parameter 'v'. Please see http://goo.gl/a8d4RP#v for details.",
            messageCode: 'VALUE_REQUIRED',
            parameter: 'v'
          }
        ]
      */
      if (process.env.NODE_ENV !== 'production') {
        console.log("Res development. Return res.json() to trigger user.")
        return res.json() // In production this will result in "SyntaxError: Unexpected token G in JSON at position 0"
      }
      else {
        console.log("Res production. Return empty. ")
        return
      }
    })
    .then(user => {

      if(typeof user !== 'undefined') {
        // User response.
        console.log("User section ..." + user.length)
        console.log("User section: valid=" + user.hitParsingResult[0].valid)
        if(JSON.parse(user.hitParsingResult[0].valid)) {
          // Payload is valid
          if(user.parserMessage[0].messageType === 'INFO') {
            console.log("User, valid payload. Info: " +  user.parserMessage[0].description)
          }
        }
        else {
          if(user.hitParsingResult[0].parserMessage.length !== 0) {
            console.log("User, invalid payload. Message: " + user.hitParsingResult[0].parserMessage)
          }
        }
      }

    })
    .catch(err => {
      // Handle error response.
      console.error(err)
    })
}

app.get('/', async (req, res, next) => {
  // Event value must be numeric.

  try {
    // These are just test values.
    await trackEvent(
      'test_category',
      'test_action',
      'test_label',
      '100',
      req
    );
    res.status(200).send('Event tracked.').end()
  } catch (error) {
    console.log("Received an error.")
    // This sample treats an event tracking error as a fatal error. Depending
    // on your application's needs, failing to track an event may not be
    // considered an error.
    next(error)
  }
})

//const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
  console.log('Press Ctrl+C to quit.')
})