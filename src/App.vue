<template>
  <v-app>
    <AppBar></AppBar>
    <v-main style="margin: 15px">
      <router-view/>
    </v-main>
  </v-app>
</template>
<script>
import AppBar from "./components/AppBar.vue";
export default {
  components: { AppBar },
  watch:{
    $route() {
      this.axios.defaults.headers.common['auth'] = this.$store.state.authToken
      this.axios.get(`${process.env.VUE_APP_API_URL}/isLogged`).then((res) => {
        if ( res.data.permissions ) {
          this.$store.commit("changePermissions", res.data.permissions)
        }
        if ( res.data.role ) {
          this.$store.commit("changeRole", res.data.role)
        }
      }).catch(() => {
        this.$store.commit("changeAuthToken", null)
        this.$store.commit("changePermissions", [])
        this.$store.commit("changeRole", {})
      })
    }
  },
}
</script>
<style>
/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1; 
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: #7857d5a4; 
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #7857d5d2; 
}
</style>
