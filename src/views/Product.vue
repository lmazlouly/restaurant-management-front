<template>
  <v-container fill-height fluid max-width="1024px">
    <!-- List -->
    <v-row class="text-center" justify="center" max-width="1024px">
      <v-card>
        <v-toolbar
          flat
          color="primary"
          dark
        >
          <v-spacer></v-spacer>
          <v-toolbar-title class="text-center">Liste des produits</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-data-table
          :headers="columns"
          :items="items"
          :items-per-page="15"
          class="elevation-1"
        >
          <template v-slot:top>
            <div class="text-center mx-1-rem">
              <v-btn
                v-if="$store.getters.hasPerm('admin')"
                color="primary"
                dark
                class="my-2"
                @click="showCreateOrUpdateCard"
              >
                Nouveau produit
                <v-icon
                  right
                  dark
                >
                  mdi-plus
                </v-icon>
              </v-btn>
            </div>
          </template>
          <template
            v-if="$store.getters.hasPerm('admin') || $store.getters.hasPerm('admin')"
            v-slot:[`item.actions`]="{ item }"
          >
            <v-btn
              color="primary"
              icon
              v-if="$store.getters.hasPerm('admin')"
              @click="showEditNewUserCard(item)"
            >
              <v-icon
                small
              >
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn
              color="red"
              class="mr-2"
              icon
              v-if="$store.getters.hasPerm('admin')"
              @click="showDeleteConfirm(item)"
            >
              <v-icon
                small
              >
                mdi-delete
              </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-row>
    <v-divider></v-divider>
    <!-- Modify or Create new one -->
    <v-expand-transition>
      <v-row v-show="showCreateOrUpdate" class="text-center my-10" align="center" justify="center" max-width="1024px">
        <v-card style="width: 600px">
          <v-toolbar
            flat
            color="primary"
            dark
          >
            <v-spacer></v-spacer>
            <v-toolbar-title v-text="(showCreateOrUpdate <= 0) ? `Création d'un nouveau produit`:`Modification de : ${selectedItem.name}`"></v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <v-row justify="center" >
              <v-col cols="7">
                <v-text-field
                  label="Nom"
                  v-model="selectedItem.name"
                ></v-text-field>
                <v-text-field
                  label="Prix"
                  v-model="selectedItem.price"
                  type="number"
                ></v-text-field>
                <v-text-field
                  label="URL De L'image"
                  v-model="selectedItem.url"
                ></v-text-field>
                <v-img v-if="selectedItem.url" :src="selectedItem.url"></v-img>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-center" align="center" justify="center">
            <v-btn
              @click="createOrUpdate"
              class="my-2"
              outlined
              rounded
              text
              color="primary"
            >
              Sauvegarder
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-row>
    </v-expand-transition>
  </v-container>
</template>

<script>
export default {
  computed: {
    showCreateOrUpdate() {
      return this.selectedItem.id
    }
  },
  data: () => {
    return {
      selectedItem: {
        id: 0
      },
      columns: [
        { text: '#', value: 'id', align: 'start' },
        { text: "Nom", value: 'name' },
        { text: 'Prix', value: 'price' },
        { text: 'Actions', value: 'actions', sortable: false },
      ], 
      items: [],
      roles: [],
      assignedRole: {},
    }
  },
  created() {
    this.loadItems();
  },
  methods: {
    loadItems() {
      this.axios.get(`${process.env.VUE_APP_API_URL}/products`).then(res => {
        this.items = res.data;
      });
    },
    showCreateOrUpdateCard(item) {
      if ( item.id > 0 ) {
        this.selectedItem = item;
      } else {
        this.selectedItem = { id: -1 };
      }
    },
    createOrUpdate() {
      if ( this.selectedItem.id < 0 ) {
        const data = {
          name: this.selectedItem.name,
          price: this.selectedItem.price,
          url: this.selectedItem.url
        };
        this.axios.post(`${process.env.VUE_APP_API_URL}/product`, data).then(() => {
          this.resetAll();
          this.loadItems();
          this.$swal(
            'Succès!',
            'Les modifications ont été effectuées avec succès.',
            'success'
          )
        }).catch(err => {
          console.log(err);
        })
      } else if ( this.selectedItem.id >  0) {
        const data = {
          name: this.selectedItem.name,
          permissions: this.assignedPermissions
        };
        this.axios.put(`${process.env.VUE_APP_API_URL}/product/${this.selectedItem.id}`, data).then(() => {
          this.resetAll();
          this.loadItems();
          this.$swal(
            'Succès!',
            'Les modifications ont été effectuées avec succès.',
            'success'
          )
        }).catch(err => {
          console.log(err);
        })
      }
    },
    revokePermission(permission) {
      let index = this.assignedPermissions.indexOf(permission);
      if (index !== -1) {
        this.assignedPermissions.splice(index, 1);
      }
      this.unAssignedPermissions.push(permission);
      this.sortTables()
    },
    resetAll() {
      this.selectedItem = { id: 0 }
      this.assignedRole = {}
    },
    showDeleteConfirm(user) {
      this.$swal({
        title: 'Êtes-vous sûr?',
        text: "Vous ne pourrez pas revenir en arrière!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimez-le!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.axios.delete(`${process.env.VUE_APP_API_URL}/user/${user.id}`).then(() => {
            this.$swal(
              'Supprimé!',
              'Rôle a été supprimé.',
              'success'
            );
            this.loadItems();
            this.showCreateOrUpdateCard()
          }).catch(() => {
            this.$swal(
              'Erreur!',
              "Une erreur s'est produite lors de la suppression de rôle",
              'error'
            )
          })
        } else {
          this.$swal(
            'Erreur!',
            "Une erreur s'est produite lors de la suppression de rôle",
            'error'
          )
        }
      })
    },
  }
}
</script>