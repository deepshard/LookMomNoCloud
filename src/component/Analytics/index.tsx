import mixpanel from 'mixpanel-browser'

interface Analytics {
  isInitialized: boolean
  init(token: string): void
  track(eventName: string, properties: any): void
  identify(userId: string): void
  trackFirstUserVisit(os: string): void
  trackModelInstall(model: any): void
  trackModelStop(model: any): void
  trackModelError(model: any, error: any): void
  trackModelRun(models: any[]): void
}

class Analytics implements Analytics {
  constructor() {
    this.isInitialized = false
  }

  init(token: string) {
    if (!this.isInitialized) {
      mixpanel.init(token, {
        debug: true,
        track_pageview: true,
        persistence: 'localStorage',
      })
      this.isInitialized = true
    }
  }

  trackModelRun(models: any[]): void {
    this.track('Model run', {
      models,
    })
  }

  track(eventName, properties) {
    if (this.isInitialized) {
      mixpanel.track(eventName, properties)
    } else {
      console.warn('Mixpanel not initialized. Call init() first.')
    }
  }

  identify(userId) {
    if (this.isInitialized) {
      mixpanel.identify(userId)
    } else {
      console.warn('Mixpanel not initialized. Call init() first.')
    }
  }

  trackFirstUserVisit(os: string): void {
    this.track('First Usage', {
      os,
    })
  }

  trackModelInstall(model: any): void {
    this.track('Model installed', {
      model: model.name,
    })
  }

  trackModelStop(model: any): void {
    this.track('Model stopped', {
      model: model.name,
    })
  }

  trackModelError(model: any, error: any): void {
    this.track('Model error', {
      model: model.name,
      error: error.message,
    })
  }
}

export default new Analytics()
