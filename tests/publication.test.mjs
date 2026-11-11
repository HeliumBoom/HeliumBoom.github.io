import assert from 'node:assert/strict'
import test from 'node:test'
import { isPublished, shanghaiDate } from '../src/lib/publication.mjs'

test('publication uses the Shanghai calendar day, including midnight and year boundaries', () => {
  const now = new Date('2026-12-31T16:00:00Z')
  assert.equal(shanghaiDate(now), '2027-01-01')
  assert.equal(isPublished({ date: '2027-01-01T15:59:59Z' }, now), true)
  assert.equal(isPublished({ date: '2027-01-01T16:00:00Z' }, now), false)
  assert.equal(isPublished({ date: '2026-01-01', draft: true }, now), false)
  assert.equal(isPublished({ date: 'invalid' }, now), false)
})
