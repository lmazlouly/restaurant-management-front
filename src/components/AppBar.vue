<template>
  <v-card>
    <v-navigation-drawer v-model="sidebar" app>
      <v-list>
        <!-- Admin Items -->
        <template v-if="hasPerm('admin')">
          <v-divider></v-divider>
          <p class="my-3 text-center text-uppercase primary--text font-weight-black" color="primary"> Admin </p>
          <v-divider></v-divider>
        </template>
        <v-list-item
          v-for="item in adminItems"
          v-show="!item.permission || (item.permission && hasPerm(item.permission))"
          :key="item.title"
          :to="item.path"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>{{ item.title }}</v-list-item-content>
        </v-list-item>
        <!-- Servant Items -->
        <template v-if="hasPerm('servant')">
          <v-divider></v-divider>
          <p class="my-3 text-center text-uppercase primary--text font-weight-black" color="primary"> Serveur </p>
          <v-divider></v-divider>
        </template>
        <v-list-item
          v-for="item in servantItems"
          v-show="!item.permission || (item.permission && hasPerm(item.permission))"
          :key="item.title"
          :to="item.path"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>{{ item.title }}</v-list-item-content>
        </v-list-item>
        <!-- Chef Items -->
        <template v-if="hasPerm('chef')">
          <v-divider></v-divider>
          <p class="my-3 text-center text-uppercase primary--text font-weight-black" color="primary"> Chef </p>
          <v-divider></v-divider>
        </template>
        <v-list-item
          v-for="item in chefItems"
          v-show="!item.permission || (item.permission && hasPerm(item.permission))"
          :key="'chefItem'+ item.title"
          :to="item.path"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>{{ item.title }}</v-list-item-content>
        </v-list-item>
        <!-- Cashier Items -->
        <template v-if="hasPerm('cashier')">
          <v-divider></v-divider>
          <p class="my-3 text-center text-uppercase primary--text font-weight-black" color="primary"> Caissier </p>
          <v-divider></v-divider>
        </template>
        <v-list-item
          v-for="item in cashierItems"
          v-show="!item.permission || (item.permission && hasPerm(item.permission))"
          :key="'cashierItem'+ item.title"
          :to="item.path"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>{{ item.title }}</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="#7957d5">
      <span>
        <v-app-bar-nav-icon v-if="authenticated" color="white" @click="sidebar = !sidebar"></v-app-bar-nav-icon>
      </span>
      <v-toolbar-title>
        <router-link class="white--text" to="/" tag="span" style="cursor: pointer">
          {{ appTitle }}
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn
          class="white--text"
          text
          v-for="item in toolbarItems"
          :key="item.title"
          :to="item.path"
        >
          <v-icon left dark>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
        <!--  Log-out button -->
        <v-btn
          v-if="$store.getters.loggedIn"
          class="white--text"
          text
          @click="logout"
        >
          <v-icon left dark>mdi-logout</v-icon>
          Se déconnecter
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
  </v-card>
</template>

<script>
export default {
  name: 'AppBar',
  methods: {
    logout() {
      this.$swal({
        title: 'Confirmer la déconnexion',
        text: "Assurez-vous d'avoir enregistré toutes les données, puis cliquez sur confirmer!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirmer',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store.commit('changeAuthToken', null);
          window.location = '/login'
        }
      })
    },
    hasPerm(permissionName) {
      return this.$store.state.permissions?.find(perm => perm.name == permissionName) ? true:false
    },
    authenticated() {
      return this.$store.getters.loggedIn()
    }
  },
  computed: {
    toolbarItems() {
      if ( !this.$store.getters.loggedIn ) {
        return [
          { title: 'Accueil', path: '/', icon: 'mdi-home' },
        ]
      } else {
        return [
          // { title: 'Se déconnecter', path: '/logout', icon: 'mdi-logout' },
        ]
      }
    },
    adminItems() {
      if ( this.authenticated ) {
        return [
          { title: 'Rôles', path: '/roles', icon: 'fas fa-user-cog', permission: 'admin' },
          { title: 'Utilisateurs', path: '/users', icon: 'fas fa-users', permission: 'admin' },
          { title: 'Produits', path: '/products', icon: 'fas fa-box', permission: 'admin' }
        ];
      }
      return [];
    },
    servantItems() {
      if ( this.authenticated ) {
        return [
          { title: 'Commandes', path: '/orders', icon: 'fas fa-utensils', permission: 'servant' },
          // { title: 'Utilisateurs', path: '/users', icon: 'fas fa-users', permission: 'servant' },
          // { title: 'Produits', path: '/products', icon: 'fas fa-box', permission: 'servant' }
        ];
      }
      return [];
    },
    chefItems() {
      if ( this.authenticated ) {
        return [
          { title: 'Commandes', path: '/orders', icon: 'fas fa-utensils', permission: 'chef' },
          // { title: 'Utilisateurs', path: '/users', icon: 'fas fa-users', permission: 'servant' },
          // { title: 'Produits', path: '/products', icon: 'fas fa-box', permission: 'servant' }
        ];
      }
      return [];
    },
    cashierItems() {
      if ( this.authenticated ) {
        return [
          { title: 'Commandes', path: '/orders', icon: 'fas fa-utensils', permission: 'cashier' },
          // { title: 'Utilisateurs', path: '/users', icon: 'fas fa-users', permission: 'servant' },
          // { title: 'Produits', path: '/products', icon: 'fas fa-box', permission: 'servant' }
        ];
      }
      return [];
    }
  },
  data() {
    return {
      appTitle: 'Commande Plan - Gestion des commandes',
      sidebar: false,
    }
  },
}
</script>