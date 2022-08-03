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
          <v-toolbar-title class="text-center">Liste des utilisateurs</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="users"
          :items-per-page="5"
          class="elevation-1"
        >
          <template v-slot:top>
            <div class="text-center mx-1-rem">
              <v-btn
                v-if="$store.getters.hasPerm('admin')"
                color="primary"
                dark
                class="my-2"
                @click="showCreateNewRoleCard"
              >
                Nouveau compte
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
      <v-row v-show="showCreateOrUpdateCard" class="text-center my-10" align="center" justify="center" max-width="1024px">
        <v-card style="width: 600px">
          <v-toolbar
            flat
            color="primary"
            dark
          >
            <v-spacer></v-spacer>
            <v-toolbar-title v-text="(showCreateOrUpdateCard < 0) ? `Création d'un nouveau compte`:`Modification de : ${selectedUser.username}`"></v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-tabs vertical>
            <v-tab>
              <v-icon left>
                mdi-account-edit
              </v-icon>
              Compte
            </v-tab>
            <v-tab-item>
              <v-card flat>
                <v-card-text>
                  <v-text-field v-model="selectedUser.username" label="Spécifiez le nom d'utilisateur"></v-text-field>
                  <v-text-field v-model="selectedUser.password" label="Spécifiez le mot de passe"></v-text-field>
                  <v-select
                    placeholder="Sélectionnez un rôle"
                    :items="roles"
                    item-value="id"
                    item-text="name"
                    v-model="assignedRole"
                  ></v-select>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs>
          <v-card-actions class="justify-center" align="center" justify="center">
            <v-btn
              @click="createOrUpdateUser"
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
    showCreateOrUpdateCard() {
      return this.selectedUser.id
    }
  },
  data: () => {
    return {
      selectedUser: {
        id: 0
      },
      headers: [
        { text: '#', value: 'id', align: 'start' },
        { text: "Nom d'utilisateur", value: 'username' },
        { text: 'Rôle', value: 'role.name' },
        { text: 'Actions', value: 'actions', sortable: false },
      ], 
      users: [],
      roles: [],
      assignedRole: {},
    }
  },
  created() {
    this.loadUsers();
    this.loadRoles();
    this.loadPermissions();
  },
  methods: {
    loadRoles() {
      this.axios.get(`${process.env.VUE_APP_API_URL}/roles`).then(res => {
        this.roles = res.data;
      });
    },
    loadUsers() {
      this.axios.get(`${process.env.VUE_APP_API_URL}/users`).then(res => {
        this.users = res.data;
        for (let i = 0; i < this.users.length; i++) {
          this.users[i].password = null
        }
      });
    },
    loadPermissions() {
      this.axios.get(`${process.env.VUE_APP_API_URL}/permissions`).then(res => {
        this.permissions = res.data;
        this.unAssignedPermissions = res.data;
      });
    },
    showCreateNewRoleCard() {
      this.selectedUser = { id: -1 };
      this.assignedRole = {};
    },
    createOrUpdateUser() {
      if ( !this.selectedUser.username || !this.selectedUser.password )
        return this.$swal(
            'Saisie manquante!',
            "Veuillez vous assurer d'avoir rempli tous les champs.",
            'warning'
          )
      if ( this.selectedUser.id < 0 ) {
        const data = {
          name: this.selectedUser.username,
          password: this.selectedUser.password,
          roleId: this.assignedRole
        };
        this.axios.post(`${process.env.VUE_APP_API_URL}/user`, data).then(() => {
          this.resetAll();
          this.loadUsers();
          this.$swal(
            'Succès!',
            'Les modifications ont été effectuées avec succès.',
            'success'
          )
        }).catch(err => {
          console.log(err);
        })
      } else if ( this.selectedUser.id >  0) {
        const data = {
          name: this.selectedUser.name,
          password: this.selectedUser.password,
          roleId: this.assignedRole
        };
        this.axios.put(`${process.env.VUE_APP_API_URL}/user/${this.selectedUser.id}`, data).then(() => {
          this.resetAll();
          this.loadUsers();
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
      this.selectedUser = { id: 0 }
      this.assignedRole = {}
    },
    showEditNewUserCard(user) {
      user.password = null;
      this.selectedUser = user;
      this.axios.get(`${process.env.VUE_APP_API_URL}/user/${this.selectedUser.id}/role`).then(res => {
        this.assignedRole = res.data;
      })
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
            this.loadUsers();
            this.showCreateNewRoleCard()
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