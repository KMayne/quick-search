'use strict';
/* globals data Vue */
/* exported listVue */

const apiURL = 'api/search';
const wsURL = 'ws://' + location.host + location.pathname + 'api';
const MAX_RESULTS = 25;

let getResults = getResultsFetch;

// WebSocket setup
let socket;
getWebSocket()
  .then(ws => {
    setupWebSocket(ws);
  })
  .catch(err => {
    console.warn('Error connecting to the WebSocket server. Defaulting to Fetch strategy.', err);
  });

window.SearchVue = new Vue({
  el: '.search-container',
  computed: {
    waiting: function () {
      return this.pendingRequests > 0;
    },
    noResults: function () {
      return this.query !== '' && !this.waiting && this.results.length === 0
    },
    shouldFetch: function () {
      return this.results.length >= MAX_RESULTS && this.hasMoreResults;
    }
  },
  watch: {
    query: function (query) {
      this.clearMoreResults();
      if (query === '') {
        this.clearPending();
        ++this.seqNum;
        this.results = [];
        this.lastQuery = query;
        return;
      }
      if (this.results.length === 0 && this.lastQuery !== '' && query.indexOf(this.lastQuery) !== -1) {
        console.info('Cancelling definitely empty query');
        return;
      }
      this.lastQuery = query;
      // Update results with API call
      this.addPending();
      const queryObj = { query: query, seqNum: ++this.seqNum };
      getResults(queryObj)
        .then(result => {
          this.removePending();
          if (result.seqNum != this.seqNum) return console.info('Response discarded');
          this.results = result.data || [];
        })
        .catch(error => console.warn('Error fetching data:', error.message));
    }
  },
  data: {
    results: data.results || [],
    query: data.query || '',
    lastQuery: data.query || '',
    pendingRequests: 0,
    seqNum: 0,
    offset: 0,
    pendingMoreResults: false,
    hasMoreResults: true
  },
  methods: {
    addPending() {
      this.pendingRequests++;
    },
    removePending() {
      this.pendingRequests = Math.max(this.pendingRequests - 1, 0);
    },
    clearPending() {
      this.pendingRequests = 0;
    },
    getMoreResults() {
      if (this.pendingMoreResults) return;
      console.log('Fetching additional records')
      this.pendingMoreResults = true;
      getResults({ query: this.query, seqNum: ++this.seqNum, offset: this.offset += MAX_RESULTS })
        .then(moreResults => {
          if (!this.pendingMoreResults) {
            console.info('More results response discarded');
            clearMoreResults()
            return;
          }
          this.results = this.results.concat(moreResults.data);
          if (moreResults.data.length < MAX_RESULTS) {
            this.hasMoreResults = false;
          }
          this.pendingMoreResults = false;
        })
        .catch(error => {
          console.warn('Error fetching data:', error.message);
        });
    },
    clearMoreResults() {
      this.offset = 0;
      this.pendingMoreResults = false;
      this.hasMoreResults = true;
    }
  },
  mounted: function () {
    window.addEventListener('scroll', () => {
      const el = document.scrollingElement;
      const atBottom = el.scrollHeight - el.scrollTop === el.clientHeight;
      if (atBottom && this.shouldFetch) this.getMoreResults();
    });
  }
});

function getResultsFetch(query) {
  let req = new Request(queryURL(query));
  let promise = fetch(req)
    .then(function (response) {
      if (response.headers.get('Content-Type').split(';')[0] !== 'application/json') {
        throw new Error('Response content-type was not JSON');
      }
      return response.json();
    });
  return promise;
}

function queryURL(query) {
  let queryStr = `${apiURL}?query=${encodeURIComponent(query.query)}&seqNum=${query.seqNum}`;
  if (query.offset) queryStr += `&offset=${query.offset}`;
  return queryStr;
}

function getResultsWS(query) {
  return new Promise(resolve => {
    socket.pendingRequests[query.seqNum] = resolve;
    socket.send(JSON.stringify(query));
  });
}

/* WebSocket management */
function getWebSocket() {
  let ws = new WebSocket(wsURL);
  return new Promise((resolve, reject) => {
    ws.onclose = reject;
    ws.onopen = () => resolve(ws);
  });
}

function setupWebSocket(ws) {
  ws.pendingRequests = {};
  ws.onclose = (event) => {
    getResults = getResultsFetch;
    console.warn('WebSocket connection closed with error code ' + event.code
      + '. Falling back to Fetch strategy.');
    console.info('Attempting to reconnect to WebSocket server…');
    let attempts = 10;
    reconnectWebsocket(attempts)
      .then(ws => {
        setupWebSocket(ws);
      })
      .catch(() => {
        console.warn(`Could not reconnect to WebSocket server after ${attempts} attempts. Continuing to use the Fetch strategy.`);
      });
  };
  ws.onmessage = function (event) {
    let response;
    try {
      response = JSON.parse(event.data);
    } catch (e) {
      console.error('Failed to parse websocket response:', e);
    }
    this.pendingRequests[response.seqNum](response);
  };
  console.info('WebSocket connection open - setting strategy to WebSocket.');
  socket = ws;
  getResults = getResultsWS;
}

function reconnectWebsocket(maxAttempts, attemptNum) {
  attemptNum = attemptNum || 1;
  return getWebSocket()
    .then(ws => {
      return ws;
    })
    .catch(() => {
      console.warn(`Re-connection attempt ${attemptNum}/${maxAttempts} failed.`);
      if (attemptNum === maxAttempts) throw new Error('Too many attempts');
      let timeout = getTimeout(attemptNum);
      console.info(`Attemping to reconnect in ${timeout} ${timeout === 1 ? 'second' : 'seconds'}.`);
      return delay(timeout * 1000).then(() =>
        reconnectWebsocket(maxAttempts, attemptNum + 1)
      );
    });
}

function getTimeout(attemptNum) {
  if (attemptNum <= 2) return 1;
  if (attemptNum <= 3) return 5;
  if (attemptNum <= 5) return 10;
  return 30;
}

function delay(delay) {
  return new Promise(function(resolve) {
    setTimeout(resolve, delay);
  });
}
