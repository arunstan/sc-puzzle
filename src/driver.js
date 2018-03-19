const SeatChart = require('./SeatChart')

const seatingRows = require('./constants').SEATING_ROWS
const seatingCols = require('./constants').SEATING_COLS
const maxSeatRequest = require('./constants').MAX_SEAT_REQUEST
const notEnoughSeatsMessage = require('./constants').NOT_ENOUGH_SEATS_MESSAGE

/**
* Helper function to format [row, col] to string like R1C1
* @param {number} row - row value of the seat
* @param {number} row - col value of the seat
* @return {string} formatter seat value
*/
const formatSeatCode = (row, col) => !isNaN(row && col) && row >= 0 && col >= 0 ? `R${row + 1}C${col + 1}` : null

/**
* Helper function which can parse string like R2C1 to machine language like [1,0]
* @param {string} code that needs to be parsed
* @return {Array.<number>} the parsed seat information in [row, col]
*/
const parseSeatCode = (code) => {
  const codeRegex = /^R(\d+)C(\d+)$/
  const matches = codeRegex.exec(code)
  return matches && matches.length ? matches.slice(1).map(n => n - 1) : null
}

/**
* Helper function which formats a given seat range such as [0,1,2] to human friendly R1C2 - R1C3
* @param {Array.<number>} an array indicating the seat range
* @return {string} the formatted seat range
*/
const formatSeatsReserved = (seatsReserved) => {
  let seatRange = null
  if (seatsReserved.length > 1) {
    const [row, col1, col2] = seatsReserved
    seatRange = formatSeatCode(row, col1)
    seatRange += (col1 !== col2) ? ' - ' + formatSeatCode(row, col2) : ''
  } else {
    seatRange = notEnoughSeatsMessage
  }

  return seatRange
}

/**
* Process the data received from the stdin
* @param {Array.<string>} an array of input lines
* @return {Object} a map conatining the results
*/
const processInput = (inputLines) => {
  let results = null
  if (inputLines.length) {
    const seatChart = new SeatChart(seatingRows, seatingCols, maxSeatRequest)
    const seatCodes = inputLines[0]

    seatCodes && seatCodes.split(' ').map((code) => seatChart.reserve.apply(seatChart, parseSeatCode(code)))
    const seatRanges = inputLines.slice(1).map((requiredSeats) => formatSeatsReserved(seatChart.allottSeat(parseInt(requiredSeats))))
    const seatsRemaining = seatChart.remainingSeats()

    results = {seatRanges, seatsRemaining}
  }
  return results
}

exports.formatSeatCode = formatSeatCode
exports.parseSeatCode = parseSeatCode
exports.formatSeatsReserved = formatSeatsReserved
exports.processInput = processInput
