<template>
  <v-card>
    <v-navigation-drawer v-model="sidebar" app>
      <v-list>
        <!-- Dashboard Items -->
        <v-list-item
          v-for="item in dashboardItems"
          v-show="!item.permission || (item.permission && hasPerm(item.permission))"
          :key="item.title"
          :to="item.path"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>{{ item.title }}</v-list-item-content>
        </v-list-item>
        <!-- Product Management Items -->
        <template v-if="hasPerm('product-read')">
          <v-divider></v-divider>
          <p class="my-3 text-center text-uppercase primary--text font-weight-black" color="primary"> Gestion de produits </p>
          <v-divider></v-divider>
        </template>
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
      </v-toolbar-items>
    </v-app-bar>
  </v-card>
</template>

<script>
export default {
  name: 'AppBar',
  methods: {
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
          { title: 'Se déconnecter', path: '/logout', icon: 'mdi-logout' },
        ]
      }
    },
    dashboardItems() {
      if ( !this.$store.getters.loggedIn )
        return []
      else
        return [
          { title: 'Dashboard', path: '/dashboard', icon: 'mdi-home' },
        ]
    },
    userRoleItems() {
      if ( !this.$store.getters.loggedIn ) {
        return [
        ]
      } else {
        return [
          { title: 'Rôles', path: '/role', icon: 'mdi-wrench', permission: 'role-read' },
          { title: 'Utilisateurs', path: '/users', icon: 'mdi-account-group', permission: 'user-read' },
        ]
      }
    },
    sideBarItems() {
      // let isLogged = await 
      if ( !this.$store.getters.loggedIn ) {
        return [
          { title: 'Accueil', path: '/', icon: 'mdi-home' },
        //   { title: 'Connexion', path: '/login', icon: 'mdi-lock' },
        ]
      } else {
        // Sidebar LoggedIn Users
        return [
          { title: 'Se déconnecter', path: '/logout', icon: 'mdi-logout' },
        ]
      }
    },
    productItems() {
      if ( this.$store.getters.loggedIn ) {
        return [
          { title: 'Marques', path: '/brands', icon: 'fa-trademark', permission: 'brand-read' },
          { title: 'Familles', path: '/categories', icon: 'mdi-shape', permission: 'category-read' },
          { title: 'Produits', path: '/products', icon: 'mdi-inbox-multiple', permission: 'product-read' },
        ]
      }
      return []
    },
    stockItems() {
      if ( this.$store.getters.loggedIn ) {
        return [
          { title: 'Stock', path: '/inventory', icon: 'fa-warehouse', permission: 'inventory-read' },
        ]
      } else {
        return []
      }
    },
    salesPurchasesItems() {
      if ( this.$store.getters.loggedIn ) {
        return [
          { title: 'Clients', path: '/clients', icon: 'fa-handshake', permission: 'concern-read' },
          { title: 'Fournisseurs', path: '/providers', icon: 'fa-handshake', permission: 'concern-read' },
          { title: 'Achats', path: '/purchases', icon: 'fa-cart-shopping', permission: 'purchase-read' },
          { title: 'Ventes', path: '/sales', icon: 'fa-hand-holding-dollar', permission: 'sale-read' },
        ]
      } else {
        return []
      }
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