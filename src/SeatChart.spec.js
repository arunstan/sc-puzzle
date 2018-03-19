const chai = require('chai')
const expect = chai.expect

const SeatChart = require('../src/SeatChart')
const totalSeatRows = require('../src/constants').SEATING_ROWS
const totalSeatCols = require('../src/constants').SEATING_COLS
const maxSeatRequest = require('../src/constants').MAX_SEAT_REQUEST

const totalSeats = totalSeatRows * totalSeatCols

describe('Seat Chart', () => {
  it('should return whether a seat is reserved ', function () {
    const sc = new SeatChart(totalSeatRows, totalSeatCols, maxSeatRequest)
    expect(sc.isReserved(0, 0)).to.equal(false)
  })

  it('should reserve a given seat ', function () {
    const sc = new SeatChart(totalSeatRows, totalSeatCols, maxSeatRequest)
    expect(sc.isReserved(0, 1)).to.equal(false)
    sc.reserve(0, 1)
    expect(sc.isReserved(0, 1)).to.equal(true)
  })

  it('should return the remaining seats ', function () {
    const sc = new SeatChart(totalSeatRows, totalSeatCols, maxSeatRequest)
    expect(sc.remainingSeats()).to.equal(totalSeats)
    sc.reserve(0, 0)
    sc.reserve(1, 1)
    expect(sc.remainingSeats()).to.equal(totalSeats - 2)
  })

  it('should reserve seats correctly ', function () {
    const sc = new SeatChart(totalSeatRows, totalSeatCols, maxSeatRequest)
    sc.allottSeat(2)
    expect(sc.isReserved(0, Math.round(totalSeatCols / 2))).to.equal(true)
    expect(sc.isReserved(0, Math.round(totalSeatCols / 2) - 1)).to.equal(true)
    expect(sc.remainingSeats()).to.equal(totalSeats - 2)
  })

  it('should reserve seats correctly with initial reservation', function () {
    const sc = new SeatChart(totalSeatRows, totalSeatCols, maxSeatRequest)
    const initialReservation = [[0, 3], [0, 5], [1, 2], [1, 6], [2, 8], [2, 9]]
    const seatExpectations = [
      { request: 3, seats: [[0, 6], [0, 7], [0, 8]] },
      { request: 3, seats: [[1, 3], [1, 4], [1, 5]] },
      { request: 3, seats: [[2, 4], [2, 5], [2, 6]] },
      { request: 1, seats: [[0, 4]] },
      { request: 2, seats: [[0, 1], [0, 2]] },
      { request: 1, seats: [[1, 7]] }
    ]
    const totalReservedSeats = seatExpectations.reduce((total, expectation) => total + expectation.request, 0) + initialReservation.length

    initialReservation.map((seat) => sc.reserve(...seat))
    expect(sc.remainingSeats()).to.equal(totalSeats - initialReservation.length)

    seatExpectations.map((expectation) => {
      sc.allottSeat(expectation.request)
      expectation.seats.map((seat) => expect(sc.isReserved(...seat)).to.equal(true))
    })
    expect(sc.remainingSeats()).to.equal(totalSeats - totalReservedSeats)
  })

  it('should not reserve more than the limited seats ', function () {
    const sc = new SeatChart(totalSeatRows, totalSeatCols, maxSeatRequest)
    expect(sc.allottSeat(0).length).to.equal(0)
    expect(sc.allottSeat(11).length).to.equal(0)
    expect(sc.remainingSeats()).to.equal(totalSeats)
  })

  it('should not reserve when there are not enough seats ', function () {
    const sc = new SeatChart(totalSeatRows, totalSeatCols, maxSeatRequest)
    sc.allottSeat(3)
    sc.allottSeat(3)
    sc.allottSeat(3)
    expect(sc.allottSeat(10).length).to.equal(0)
    expect(sc.remainingSeats()).to.equal(totalSeats - 9)
  })
})
