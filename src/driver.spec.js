const chai = require('chai')
const expect = chai.expect

const driver = require('./driver')
const notEnoughSeatsMessage = require('./constants').NOT_ENOUGH_SEATS_MESSAGE

describe('driver', () => {
  it('formatSeatCode - should format seat code correctly ', function () {
    expect(driver.formatSeatCode(0, 0)).to.equal('R1C1')
    expect(driver.formatSeatCode(-1, -1)).to.equal(null)
    expect(driver.formatSeatCode('R', 'C')).to.equal(null)
  })

  it('parseSeatCode - should parse seat code correctly ', function () {
    expect(driver.parseSeatCode('R1C1')).to.have.same.members([0, 0])
    expect(driver.parseSeatCode('abcd')).to.equal(null)
    expect(driver.formatSeatCode('')).to.equal(null)
  })

  it('formatSeatsReserved - should format seat ranges correctly ', function () {
    expect(driver.formatSeatsReserved([])).to.equal(notEnoughSeatsMessage)
    expect(driver.formatSeatsReserved([0, 1, 2])).to.equal('R1C2 - R1C3')
    expect(driver.formatSeatsReserved([0, 1, 1])).to.equal('R1C2')
  })

  it('processInput - should accept the input seat requirements and return allotted seats ', function () {
    const inputLines = ['R1C4 R1C6 R2C3 R2C7 R3C9 R3C10', '3', '3', '3', '1', '10']
    const expectedOutput = {
      seatRanges: ['R1C7 - R1C9', 'R2C4 - R2C6', 'R3C5 - R3C7', 'R1C5', notEnoughSeatsMessage],
      seatsRemaining: 17
    }
    expect(driver.processInput([])).to.equal(null)
    expect(driver.processInput(inputLines)).to.deep.equal(expectedOutput)
  })
})
