import { beforeEach } from 'vitest'

;(globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = 'test'

beforeEach(() => {
  localStorage.clear()
})
