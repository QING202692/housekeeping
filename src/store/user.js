import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('hss_token') || '',
    user: JSON.parse(localStorage.getItem('hss_user') || 'null')
  }),
  actions: {
    setLogin({ token, user }) {
      this.token = token
      this.user = user
      localStorage.setItem('hss_token', token)
      localStorage.setItem('hss_user', JSON.stringify(user))
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('hss_token')
      localStorage.removeItem('hss_user')
    }
  },
  getters: {
    isLoggedIn: s => !!s.token,
    isAdmin: s => s.user?.roleId === 1
  }
})
