const io = require("socket.io-client");
const socket = io("https://eu-wss.live-rates.com/");
const axios = require("axios");
const dateformat = require("dateformat");
var config = require("../config/config");

var loggerHandler = require("../logger/logger");

const logger = loggerHandler.createLogger("LiveRatesClient");

var key = "c5a40264c5"; //YOUR LIVE-RATES SUBSCRIPTION KEY

function setTimes() {
  setTimeout(() => (timer.candle = true), 60 * 1000);
  setTimeout(() => (timer.fiveMinCandle = true), 5 * 60 * 1000);
  setTimeout(() => (timer.fifteenMinCandle = true), 15 * 60 * 1000);
  setTimeout(() => (timer.hourCandle = true), 60 * 60 * 1000);
  setTimeout(() => (timer.dayCandle = true), 24 * 60 * 60 * 1000);
}

setTimes();

var timer = {
  candle: false,
  fiveMinCandle: false,
  fifteenMinCandle: false,
  hourCandle: false,
  dayCandle: false
};
var lastClose = {
  candle: {},
  fiveMinCandle: {},
  fifteenMinCandle: {},
  hourCandle: {},
  dayCandle: {}
};

var minCandlesMap = {};
var fiveMinCandlesMap = {};
var fifteenMinCandlesMap = {};
var hourCandlesMap = {};
var dayCandlesMap = {};

// intervals to send candles----avery second???
setInterval(function () {
  var secs = new Date().getSeconds();
  var mins = new Date().getMinutes();
  var hours = new Date().getHours();

  updateMaps();

  // send candle every 0:59 seconds---????
  if (timer.candle === true && secs === 00) {
    const newTime = getNewDate(1);

    sendCandlesData(minCandlesMap, "candle", newTime.minutes, newTime.hours);
  }

  // send candle every 5 minutes----???
  if (timer.fiveMinCandle === true && mins % 5 === 0 && secs === 00) {
    const newTime = getNewDate(5);
    sendCandlesData(
      fiveMinCandlesMap,
      "fiveMinCandle",
      newTime.minutes,
      newTime.hours
    );
  }
  // send candle every 15 minutes---???
  if (timer.fifteenMinCandle === true && mins % 15 === 0 && secs === 00) {
    const newTime = getNewDate(15);
    sendCandlesData(
      fifteenMinCandlesMap,
      "fifteenMinCandle",
      newTime.minutes,
      newTime.hours
    );
  }
  // send candle every 00 minutes and 00 seconds---???
  if (timer.hourCandle === true && mins === 00 && secs === 00) {
    const newTime = getNewDate(60);
    sendCandlesData(
      hourCandlesMap,
      "hourCandle",
      newTime.minutes,
      newTime.hours
    );
  }
  // send candle every 24 hours, 00 minutes and 00 seconds----???
  if (timer.dayCandle === true && hours === 00 && mins === 00 && secs === 00) {
    const newTime = getNewDate(1440);
    sendCandlesData(dayCandlesMap, "dayCandle", newTime.minutes, newTime.hours);
  }
}, 1000);

function getNewDate(mins) {
  const date = new Date();
  const miliSecondsDate = date.setMinutes(date.getMinutes() - mins);

  const minutes = new Date(miliSecondsDate).getMinutes();
  const hours = new Date(miliSecondsDate).getHours();

  return {
    minutes,
    hours
  };
}

function updateMaps() {
  Object.keys(minCandlesMap).forEach(key => {
    // new day candle
    if (dayCandlesMap[key] == undefined) {
      dayCandlesMap[key] = minCandlesMap[key];
      hourCandlesMap[key] = minCandlesMap[key];
      fifteenMinCandlesMap[key] = minCandlesMap[key];
      fiveMinCandlesMap[key] = minCandlesMap[key];
    }
    //new hour candle
    else if (hourCandlesMap[key] == undefined) {
      hourCandlesMap[key] = minCandlesMap[key];
      fifteenMinCandlesMap[key] = minCandlesMap[key];
      fiveMinCandlesMap[key] = minCandlesMap[key];
      updateMap(minCandlesMap, dayCandlesMap, key);
    }
    //new fifteen minutes candle
    else if (fifteenMinCandlesMap[key] == undefined) {
      fifteenMinCandlesMap[key] = minCandlesMap[key];
      fiveMinCandlesMap[key] = minCandlesMap[key];
      updateMap(minCandlesMap, dayCandlesMap, key);
      updateMap(minCandlesMap, hourCandlesMap, key);
    }
    //new five minutes candle
    else if (fiveMinCandlesMap[key] == undefined) {
      fiveMinCandlesMap[key] = minCandlesMap[key];
      updateMap(minCandlesMap, dayCandlesMap, key);
      updateMap(minCandlesMap, hourCandlesMap, key);
      updateMap(minCandlesMap, fifteenMinCandlesMap, key);
    }
  });
}



socket.on("connect", function () {
  socket.emit("key", key, data => {
    logger.info(`key subscribe to live rate: ${data}`); //RESPONSE FROM SERVER
  });
  logger.info("Create connection to: https://eu-wss.live-rates.com")
});

socket.on("disconnect", reason => {
  logger.error(`live-rates disconnect: ${reason}`);
  console.log(reason)//->show the erorr on console-line 153
});

socket.on("rates", function (msg) {
  try {
    if (msg.info) {
      return logger.info(msg.info)
    }

    msg = JSON.parse(msg);

    if (parseFloat(msg.bid) == 0) {
      date = null;
    }
    var date = new Date(parseFloat(msg.timestamp));

    //Do what you want with the Incoming Rates... Enjoy!
    if (config.symbols[msg.currency]) {
      //new candle

      const bid = parseFloat(msg.bid);
      const close = msg.close === "n/a" ? bid : parseFloat(msg.close);

      if (minCandlesMap[msg.currency] === undefined) {
        //new candle
        minCandlesMap[msg.currency] = {
          open: bid,
          high: bid,
          low: bid,
          close: close,
          date: dateformat(date, "dd-mm-yyyy"),
          time: dateformat(date, "HH:MM")
        };
      } else {
        if (minCandlesMap[msg.currency].high < bid) {
          //higher than high
          minCandlesMap[msg.currency].high = bid;
        } else if (minCandlesMap[msg.currency].low > bid) {
          //higher than high
          minCandlesMap[msg.currency].low = bid;
        }

        minCandlesMap[msg.currency].close = close;
      }
    }
  } catch (e) {
    console.log("msg: ", msg)
    console.log("e: ", e)
    logger.error("not valid data: ", e);
  }
});

function updateMap(srcMap, destMap, key) {
  //update high
  if (destMap[key].high < srcMap[key].high) {
    destMap[key].high = srcMap[key].high;
  }
  //update low
  if (destMap[key].low > srcMap[key].low) {
    destMap[key].low = srcMap[key].low;
  }
  destMap[key].close = srcMap[key].close;
}

async function sendCandlesData(map, url, mins, hours) {
  try {
    const data = [];
    let open = 0.0;

    // push the details into data-------Algoritem
    Object.keys(map).forEach(key => {
      if (lastClose[url][key] === undefined) {
        open = map[key].open;
      } else {
        open = lastClose[url][key];
      }

      // if the candle is rising---Algoritem
      if (map[key].close > open) {
        // if the low is bigger than the open
        if (map[key].low > open) {
          // set the low to be the open ===>    low === open
          map[key].low = open;
        }
      }

      // if the candle is falling
      if (map[key].close < open) {
        // if the high is smaller than the open
        if (map[key].high < open) {
          // set the high to be the open ===>    high === open
          map[key].high = open;
        }
      }

      data.push({
        open,
        symbol: key,
        date: map[key].date,
        time: hours + ":" + mins,
        high: map[key].high,
        low: map[key].low,
        close: map[key].close
      });

      // save the lastest close---Algoritem
      lastClose[url][key] = map[key].close;
    });

    if (url !== "candle") {

      // send data
      if (data.length) {
        await axios.post("http://localhost:3636/" + url, data);
        logger.info(`sent ${url}`);
      }
    }

    resetCandleMap(map);

  } catch (error) {
    logger.error("Failed to send data to Dalya: ", error);
    
    if(error === "socket hang up") {
      socket.close();
    }
  }
}


const resetCandleMap = map => {
  // reset candle details
  for (let member in map) delete map[member];
}



// import React, { Component } from "react";
// import styled from "styled-components";
// import { connect } from "react-redux";
// import Dashboard from "./Dashboard/Dashboard";
// import { sendSymbolType, allowDataFlow } from "./GraphPages.action";
// import { dates, requestedSymbols, historyCandles } from "../../utils/services/api";
// import * as s from "../../store/selectors";
// import BigGraph from "../../containers/Graph/BigGraph";
// import OneMinClock from "../../features/clock/OneMinClock";
// import FiveMinClock from "../../features/clock/FiveMinClock";
// import FifteenMinClock from "../../features/clock/FifteenMinClock";
// import OneHourClock from "../../features/clock/OneHourClock";
// import OneDayClock from "../../features/clock/OneDayClock";
// import { graphTypes } from "../../utils/helpers/config";
// import { PacmanLoader } from "react-spinners";