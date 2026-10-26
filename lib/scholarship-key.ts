import type { Scholarship } from './types'

export function scholarshipKey(scholarship: Scholarship): string {
  return scholarship.link ?? scholarship.name
}
