import { describe, expect, it } from 'vitest'
import { patientDetailsSchema } from './schema'

describe('intake step validation', () => {
  it('rejects incomplete patient details', () => {
    const result = patientDetailsSchema.safeParse({
      firstName: '',
      lastName: 'Demotron',
      dateOfBirth: '1990-01-01',
      email: 'not-an-email',
      phone: '555',
      address: '',
      city: 'Demo City',
      state: 'CAA',
      zip: '12',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields.firstName).toBeTruthy()
      expect(fields.email).toBeTruthy()
      expect(fields.zip).toBeTruthy()
      expect(fields.state).toBeTruthy()
    }
  })

  it('accepts a valid patient details step', () => {
    const result = patientDetailsSchema.safeParse({
      firstName: 'Avery',
      lastName: 'Demotron',
      dateOfBirth: '1990-01-01',
      email: 'avery.demotron@example.invalid',
      phone: '(555) 010-2001',
      address: '100 Mock Lane',
      city: 'Sampleton',
      state: 'CA',
      zip: '94105',
    })

    expect(result.success).toBe(true)
  })
})
