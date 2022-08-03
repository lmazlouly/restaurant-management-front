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
          <v-toolbar-title class="text-center">Liste des rôles</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-data-table
          :headers="rolesColumns"
          :items="roles"
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
                Nouveau Rôle
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
              @click="showEditNewRoleCard(item)"
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
            <v-toolbar-title v-text="showCreateOrUpdateCardText"></v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-tabs vertical>
            <v-tab>
              <v-icon left>
                mdi-lock
              </v-icon>
              Rôle
            </v-tab>
            <v-tab>
              <v-icon left>
                mdi-lock
              </v-icon>
              Permissions
            </v-tab>
            <v-tab-item>
              <v-card flat>
                <v-card-text>
                  <v-text-field v-model="selectedRole.name" label="Spécifiez le nom du rôle"></v-text-field>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-card flat>
                <v-card-text>
                  <h2 class="my-10" v-text="assignPermissionCardText"></h2>
                  <v-simple-table v-if="assignedPermissions.length" fixed-header dense style="max-height:300px;overflow-y: scroll;">
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-center">
                            Nom
                          </th>
                          <th class="text-center">
                            Rejeter
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="perm in assignedPermissions"
                          :key="perm.name"
                        >
                          <td>{{ perm.name }}</td>
                          <td>
                            <v-btn
                              @click="revokePermission(perm)"
                              color="primary"
                              icon
                            >
                              <v-icon
                                small
                                color="primary"
                              >
                                mdi-chevron-down
                              </v-icon>
                            </v-btn>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                  <v-divider></v-divider>
                  <h2 class="my-10">Liste des autorisations</h2>
                  <v-simple-table v-if="unAssignedPermissions.length" fixed-header dense style="max-height:300px;overflow-y: scroll;">
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-center">
                            Nom
                          </th>
                          <th class="text-center">
                            Affecter
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="perm in unAssignedPermissions"
                          :key="perm.name"
                        >
                          <td>{{ perm.name }}</td>
                          <td>
                            <v-btn
                              @click="assignPermission(perm)"
                              color="primary"
                              icon
                            >
                              <v-icon
                                small
                                color="primary"
                              >
                                mdi-chevron-up
                              </v-icon>
                            </v-btn>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs>
          <v-card-actions class="justify-center" align="center" justify="center">
            <v-btn
              @click="createOrUpdateRole"
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
      return this.selectedRole.id
    },
    showCreateOrUpdateCardText() {
      return this.showCreateOrUpdateCard ? `Création d'un nouveau rôle`:`Modification de rôle: ${this.selectedRole.name}`;
    },
    assignPermissionCardText() {
      return this.assignedPermissions.length ? `Liste des autorisations attribuées`:`Attribuez un ou plusieurs rôles en cliquant sur le chevron`;
    }
  },
  data: () => {
    return {
      selectedRole: {
        id: 0
      },
      // defaultRole: {
      //   id: 0
      // },
      rolesColumns: [
        { text: '#', value: 'id', align: 'start' },
        { text: 'Nom', value: 'name' },
        { text: 'Actions', value: 'actions', sortable: false },
      ], 
      roles: [],
      permissions: [],
      assignedPermissions: [],
      unAssignedPermissions: [],
    }
  },
  created() {
    this.loadRoles();
    this.loadPermissions();
  },
  methods: {
    loadRoles() {
      this.axios.get(`${process.env.VUE_APP_API_URL}/roles`).then(res => {
        this.roles = res.data;
      });
    },
    loadPermissions() {
      this.axios.get(`${process.env.VUE_APP_API_URL}/permissions`).then(res => {
        this.permissions = res.data;
        this.unAssignedPermissions = res.data;
      });
    },
    showCreateNewRoleCard() {
      this.selectedRole = { id: -1 };
      this.assignedPermissions = [];
      this.unAssignedPermissions = this.permissions;
    },
    createOrUpdateRole() {
      if ( this.selectedRole.id < 0 && this.selectedRole.name ) {
        const data = {
          name: this.selectedRole.name,
          permissions: this.assignedPermissions
        };
        this.axios.post(`${process.env.VUE_APP_API_URL}/role`, data).then(() => {
          this.resetAll();
          this.loadRoles();
          this.$swal(
            'Succès!',
            'Les modifications ont été effectuées avec succès.',
            'success'
          )
        }).catch(err => {
          console.log(err);
        })
      } else if ( this.selectedRole.id >  0) {
        const data = {
          name: this.selectedRole.name,
          permissions: this.assignedPermissions
        };
        this.axios.put(`${process.env.VUE_APP_API_URL}/role/${this.selectedRole.id}`, data).then(() => {
          this.resetAll();
          this.loadRoles();
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
    assignPermission(permission) {
      let index = this.unAssignedPermissions.indexOf(permission);
      if (index !== -1) {
        this.unAssignedPermissions.splice(index, 1);
      }
      this.assignedPermissions.push(permission);
      this.sortTables()
    },
    sortTables() {
      this.assignedPermissions.sort((a,b) => {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      })
      this.unAssignedPermissions.sort((a,b) => {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      })
    },
    resetAll() {
      this.assignedPermissions = [];
      this.unAssignedPermissions = [];
      this.selectedRole = { id: 0 }
    },
    showEditNewRoleCard(role) {
      this.selectedRole = role;
      this.unAssignedPermissions = this.permissions;
      this.axios.get(`${process.env.VUE_APP_API_URL}/role/${this.selectedRole.id}/permissions`).then(res => {
        for (let i = 0; i < res.data.length; i++) {
          this.assignPermission(res.data[i])
        }
      })
    },
    showDeleteConfirm(role) {
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
          this.axios.delete(`${process.env.VUE_APP_API_URL}/role/${role.id}`).then(() => {
            this.$swal(
              'Supprimé!',
              'Rôle a été supprimé.',
              'success'
            );
            this.loadRoles();
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

<style>

</style>