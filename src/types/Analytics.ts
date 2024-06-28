import mixpanel from 'mixpanel-browser'

interface Analytics {
  isInitialized: boolean
  isProd: boolean
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
    this.isProd = true
  }

  init(token: string) {
    if (!this.isInitialized) {
      mixpanel.init(token, {
        debug: true,
        track_pageview: true,
        persistence: 'localStorage',
      })
      this.isInitialized = true
      this.checkIsPackaged()
    }
  }

  async checkIsPackaged() {
    // @ts-ignore
    const isPackaged = await window.electronAPI.isPackaged()
    this.isProd = isPackaged
  }

  trackModelRun(models: any[]): void {
    this.isProd && this.track('Model run', {
      models,
    })
  }

  track(eventName, properties) {
    if (this.isInitialized) {
        this.isProd && mixpanel.track(eventName, properties)
    } else {
      console.warn('Mixpanel not initialized. Call init() first.')
    }
  }

  async identify(userId) {
    // @ts-ignore
    const isPackaged = await window.electronAPI.isPackaged()
    if (this.isInitialized && isPackaged) {
         mixpanel.identify(userId)
         mixpanel.people.set({
            '$name': userId
         })
    } else {
      console.warn('Mixpanel not initialized. Call init() first.')
    }
  }

  trackFirstUserVisit(os: string): void {
    this.isProd && this.track('First Usage', {
      os,
    })
  }

  trackModelInstall(model: any): void {
    this.isProd && this.track('Model installed', {
      model: model.name,
    })
  }

  trackModelStop(model: any): void {
    this.isProd && this.track('Model stopped', {
      model: model.name,
    })
  }

  trackModelError(model: any, error: any): void {
    this.isProd && this.track('Model error', {
      model: model.name,
      error: error.message,
    })
  }
}

export default new Analytics()
