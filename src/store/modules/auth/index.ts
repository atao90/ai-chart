import { defineStore } from 'pinia'
import { getToken, removeToken, setToken } from './helper'
import { store } from '@/store/helper'
import { fetchSession } from '@/api'
import { gptConfigStore, homeStore } from '@/store/homeStore'

interface SessionResponse {
  auth: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
}

export interface AuthState {
  token: string | undefined
  session: SessionResponse | null
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    session: null,
  }),

  getters: {
    isChatGPTAPI(state): boolean {
      return state.session?.model === 'ChatGPTAPI'
    },
  },

  actions: {
    async getSession() {
      try {
        const { data } = await fetchSession<SessionResponse>()
        this.session = { ...data }
        homeStore.setMyData({session: data });

        let str = localStorage.getItem('gptConfigStore');
        const sessionData = data as SessionResponse & { amodel?: string; cmodels?: string }
        const configuredModels = (sessionData.cmodels || sessionData.amodel || '').split(',').map(model => model.trim()).filter(Boolean)
        if( ! str ) setTimeout( ()=>  gptConfigStore.setInit() , 500);
        else if (sessionData.amodel && configuredModels.length && !configuredModels.includes(gptConfigStore.myData.model)) {
          gptConfigStore.setMyData({
            model: sessionData.amodel,
            modelLabel: sessionData.amodel,
          })
        }
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
