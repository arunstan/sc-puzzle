/** Class representing the seating chart */
class SeatChart {
  /**
  * Creates a SeatChart object, initializes the seat map as a 2D array of given rows and cols.
  * Each seat would be initialized as 0 indicating that it is available.
  * Also initializes a 2D array holding available (unallotted) ranges in each row.
  * Eg. Initially the first row would be [[0,1,2,3,4,5,6,7,8...C-1]] as every seat is available
  * @param {number} maxRows the max no of rows in the seating chart
  * @param {number} maxCols the max no of cols in the seating chart
  * @param {number} maxSeatRequest the max no of seats that can be requested at a time
  */
  constructor (maxRows, maxCols, maxSeatRequest) {
    this._maxRows = maxRows
    this._maxCols = maxCols
    this._maxSeatRequest = maxSeatRequest
    this._createChart()
  }

  _createChart () {
    this.chart = new Array(this._maxRows)
    this.availableRanges = new Array(this._maxRows)

    for (let i = 0; i < this._maxRows; i++) {
      this.chart[i] = new Array(this._maxCols).fill(0)
      this.availableRanges[i] = [[...Array(this._maxCols).keys()]
      ]
    }
  }

  /**
  * Checks whether given indices are within the valid seat array limits
  * @param {number} row - value for row
  * @param {number} col - value for col
  * @return {boolean} whether indices are valid
  */
  _isValidIndices (row, col) {
    return !isNaN(row || col) && row >= 0 && row < this._maxRows && col >= 0 && col < this._maxCols
  }

  /**
  * Returns the best seat in the chart, currently the front center seat
  * @return {number}
  */
  _getBestSeat () {
    return [0, Math.round(this._maxCols / 2) - 1]
  }

  /**
  * Updates the available ranges array, usually called after reserving a seat, to update the current ranges.
  * For eg. when there are no seats alloted, and the first best seat (assuming R1C6) is reserved,
  * the first row of available ranges would be updated as:
  * [[0,1,2,3,4][6,7,8,9,10]]
  * @param {number} row - row value of the seat alloted
  * @param {number} col - col value of the seat alloted
  * @param {number} length - number of seats alloted from (row, col)
  */
  _updateAvailableRanges (row, col, length) {
    /** Find the range where (row,col) is part of */
    const rangeIndex = this.availableRanges[row].findIndex(range => {
      return range.includes(col + length - 1)
    })

    const range = this.availableRanges[row][rangeIndex]

    let colIndex = range.indexOf(col)
    let colEndIndex = range.indexOf(col + length)
    let newRanges = []

    /** Split that range into two depending on the position of col param */
    range.slice(0, colIndex).length !== 0 && newRanges.push(range.slice(0, colIndex))
    range.slice(colIndex, colEndIndex).length !== 0 && newRanges.push(range.slice(colEndIndex))

    /** Delete the existing range and insert the new split ranges */
    this.availableRanges[row].splice(rangeIndex, 1, ...newRanges)
  }

  /**
  * Calculates the manhattan distance for a given seat from the best seat
  * @param {number} row - row value of the seat
  * @param {number} col - col value of the seat
  * @return {number} the manahattan distance of the seat
  */
  _manhattanDistance (row, col) {
    const [bestSeatRow, bestSeatCol] = this._getBestSeat()
    const mhDistance = Math.abs(bestSeatCol - col) + Math.abs(bestSeatRow - row)
    return mhDistance
  }

  /**
  * Helper function used to compare the current best seat with the new seat calculated, while finding the best seat
  * It checks which seat has the least manhattan distance. If they are equal the one close to the front row, wins.
  * @param {Object} seat - current best seat
  * @param {Object} newSeat - the new seat
  * @return {Object} compartively better seat
  */
  _compareSeats (seat, newSeat) {
    let betterSeat = newSeat
    if (seat && newSeat) {
      if (seat.mhDistance === newSeat.mhDistance) {
        betterSeat = seat.row <= newSeat.row ? seat : newSeat
      } else {
        betterSeat = seat.mhDistance < newSeat.mhDistance ? seat : newSeat
      }
    }
    return betterSeat
  }

  /**
  * Public function which simply reserves a seat
  * Also updates the available ranges
  * @param {number} row - row value of the seat
  * @param {number} col - col value of the seat
  */
  reserve (row, col) {
    if (this._isValidIndices(row, col) && !this.chart[row][col]) {
      this.chart[row][col] = 1
      this._updateAvailableRanges(row, col, 1)
    }
  }

  /**
  * Public function to determine whether a seat is already reserved
  * @param {number} row - row value of the seat
  * @param {number} col - col value of the seat
  * @return {boolean} whether the seat is reserved, null if invalid indices.
  */
  isReserved (row, col) {
    return this._isValidIndices(row, col) ? this.chart[row][col] === 1 : null
  }

  /**
  * Public function to determine how many seats are still available
  * @return {number} the number of available seats
  */
  remainingSeats () {
    return this.chart.reduce((total, seatRow) => total + seatRow.filter((seat) => !seat).length, 0)
  }

  /**
  * Public function to find best seats and reserve it
  * @param {number} requiredSeats - the required number of seats to be reserved
  * @return {Array.<number>} indicating the row and columns of first and last seat of the requested seats
  */
  allottSeat (requiredSeats) {
    let allottedSeat = []

    const bestSeatCol = this._getBestSeat()[1]

    /** Helper functions to condense and improve the readablity of the code below */
    const doesRangeHasTheBestCol = (rangeStart, rangeEnd) => (rangeStart <= bestSeatCol && rangeEnd >= bestSeatCol)
    const closestColToBestCol = (rangeStart, rangeEnd) => Math.abs(bestSeatCol - rangeStart) >= Math.abs(bestSeatCol - rangeEnd) ? rangeEnd : rangeStart
    const farthestColToBestCol = (rangeStart, rangeEnd) => Math.abs(bestSeatCol - rangeStart) >= Math.abs(bestSeatCol - rangeEnd) ? rangeStart : rangeEnd

    /** Check whether only the limited no.of seats are requested */
    if (requiredSeats && requiredSeats <= this._maxSeatRequest) {
      let seatRange = null

      /** Run through each available range and find the best seat */
      this.availableRanges.map((ranges, row) => {
        ranges.map((range) => {
          /** Only consider the ranges which have the number of seats we need */
          if (range.length >= requiredSeats) {
            const rangeStart = range[0]
            const rangeEnd = range[range.length - 1]

            let seatRangeStart, seatRangeEnd, rangeBestSeat

            /** If a range is a perfect fit, grab it first */
            if (range.length === requiredSeats) {
              seatRangeStart = rangeStart
              seatRangeEnd = rangeEnd
            } else {
              /** ...else we will have to figure out how we are going to pick the best seats in the range */
              /** For starters, if the range has a middle most seat, aka the (col) of best seat, */
              /** we have to pick the seats close to that, on either sides */
              if (doesRangeHasTheBestCol(rangeStart, rangeEnd)) {
                rangeBestSeat = bestSeatCol
                const seatsFromBestToLeft = Math.min(Math.round(requiredSeats / 2), Math.abs(rangeBestSeat - rangeStart) + 1)
                const seatsFromBestToRight = requiredSeats - seatsFromBestToLeft
                seatRangeStart = rangeBestSeat - seatsFromBestToLeft + 1
                seatRangeEnd = rangeBestSeat + seatsFromBestToRight
              } else {
                /** If that's not the case, figure out which seat of the range is close to the middle seat */
                /** and try to pick seats close to that, in the range */
                rangeBestSeat = closestColToBestCol(rangeStart, rangeEnd)

                if (rangeBestSeat === rangeStart) {
                  seatRangeStart = rangeStart
                  seatRangeEnd = seatRangeStart + requiredSeats - 1
                }

                if (rangeBestSeat === rangeEnd) {
                  seatRangeStart = rangeEnd - requiredSeats + 1
                  seatRangeEnd = rangeEnd
                }
              }
            }

            /** By now, we must be aware of lot of things, including the seats that we could allot */
            /** We still have to figure out its manhattan distance so that it is *THE* next best seat possible, across all rows */
            const mhDistance = this._manhattanDistance(row, farthestColToBestCol(seatRangeStart, seatRangeEnd))

            /** Just check how does it compare with the next best seat so far, and make it the next best seat, in case it is */
            seatRange = this._compareSeats(seatRange, { row, range: [seatRangeStart, seatRangeEnd], mhDistance })
          }
        })
      })

      /** Ok, by now we must have a winner in our hands, well unless there is none */
      if (seatRange) {
        /** Go ahead and reserve it */
        for (let i = seatRange.range[0]; i <= seatRange.range[1]; i++) {
          this.reserve(seatRange.row, i)
        }
        allottedSeat = [seatRange.row, ...seatRange.range]
      }
    }
    return allottedSeat
  }
}

module.exports = SeatChart
