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
          <v-toolbar-title class="text-center">Liste des commandes</v-toolbar-title>
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
                v-if="$store.getters.hasPerm('servant')"
                color="primary"
                dark
                class="my-2"
                @click="showCreateOrUpdateCard"
              >
                Nouvelle commande
                <v-icon
                  right
                  dark
                >
                  mdi-plus
                </v-icon>
              </v-btn>
            </div>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <div v-html="$options.filters.formatStatus(item.status)"></div>
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">
            {{ item.createdAt | formatDateTime }}
          </template>
          <template
            v-slot:[`item.actions`]="{ item }"
          >
            <v-btn
              color="primary"
              class="mr-2"
              icon
              outlined
              @click="readOrder(item)"
            >
              <v-icon small>fas fa-eye</v-icon>
            </v-btn>
            <v-btn
              color="success"
              class="mr-2"
              icon
              outlined
              v-if="item.status == 'NEW' && $store.getters.hasPerm('chef')"
              @click="readyOrder(item)"
            >
              <v-icon small>fas fa-check</v-icon>
            </v-btn>
            <v-btn
              color="success"
              class="mr-2"
              icon
              outlined
              v-if="item.status == 'READY' && $store.getters.hasPerm('servant')"
              @click="serveOrder(item)"
            >
              <v-icon small>fas fa-check</v-icon>
            </v-btn>
            <v-btn
              color="success"
              class="mr-2"
              icon
              outlined
              v-if="item.status == 'SERVED' && $store.getters.hasPerm('cashier')"
              @click="payOrder(item)"
            >
              <v-icon small>fas fa-money-bill</v-icon>
            </v-btn>
            <v-btn
              color="red"
              class="mr-2"
              icon
              outlined
              v-if="$store.getters.hasPerm('servant')"
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
            <v-toolbar-title v-text="(showCreateOrUpdate <= 0) ? `Création d'une nouvelle commande`:`Modification de : ${selectedItem.id}`"></v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <v-btn
              @click="productDialog = true"
              class="my-2"
              color="primary"
            >
              Ajouter Produit
            </v-btn>
            <v-simple-table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Quantité</th>
                  <th>Prix (MAD)</th>
                  <th>Total (MAD)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(orderProduct, index) in orderProducts" :key="'table' + orderProduct.productId">
                  <td> {{ products.find(p => p.id == orderProduct.productId).name }} </td>
                  <td> {{ orderProduct.amount }} </td>
                  <td> {{ Intl.NumberFormat().format(products.find(p => p.id == orderProduct.productId).price) }} </td>
                  <td> {{ parseFloat(orderProduct.amount) * parseFloat(products.find(p => p.id == orderProduct.productId).price) }} </td>
                  <td> 
                    <v-btn icon color="warning" @click="removeOrderProduct(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                    <v-btn icon @click="orderProduct.amount--">
                      <v-icon>fas fa-minus</v-icon>
                    </v-btn>
                    <v-btn icon @click="orderProduct.amount++">
                      <v-icon>fas fa-plus</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
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
    <v-dialog
      transition="dialog-bottom-transition"
      v-model="productDialog"
      max-width="640"
      persistent
    >
      <v-card>
        <v-toolbar class="text-center" color="primary" dark >
          <v-spacer></v-spacer>
          <h2>Ajouter un produit</h2>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text class="my-5 py-5">
          <v-row justify="center">
            <!-- Product -->
            <v-col lg="6" sm="12">
              <v-autocomplete
                label="Produit"
                v-model="editedOrderProduct.productId"
                :items="products"
                item-text="name"
                item-value="id"
              ></v-autocomplete>
            </v-col>
            <!-- Quantity -->
            <v-col lg="6" sm="12">
              <v-text-field
                readonly
                style="text-align: center"
                label="Quantité"
                v-model="editedOrderProduct.amount"
                append-icon="fas fa-plus"
                prepend-inner-icon="fas fa-minus"
                @click:append="editedOrderProduct.amount++"
                @click:prepend-inner="editedOrderProduct.amount--"
              ></v-text-field>
            </v-col>
            <v-col lg="7">
              <v-transition-group>
                <v-text-field
                  v-if="editedOrderProduct.productId > 0"
                  readonly
                  v-bind:value="'Prix: ' + Intl.NumberFormat().format(products.find(p => p.id == editedOrderProduct.productId)?.price) + ' MAD'"
                ></v-text-field>
                <v-img
                  v-if="editedOrderProduct.productId > 0"
                  :src="products.find(p => p.id == editedOrderProduct.productId).img"
                ></v-img>
              </v-transition-group>
              <!-- <v-expand-transition>
              </v-expand-transition> -->
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            text
            @click="productDialog = false"
          >
          Fermer
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            text color="primary"
            @click="addProduct()"
            v-text="`Ajouter`"
          >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      scrollable
      transition="dialog-bottom-transition"
      v-model="orderInfo.show"
      max-width="640"
      persistent
    >
      <v-card>
        <v-toolbar class="text-center" color="primary" dark >
          <v-spacer></v-spacer>
          <h2>Information sur la commande N°: {{ orderInfo.id }}</h2>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text class="my-5 py-5">
          <v-row justify="center">
            <v-col cols="10">
              <v-simple-table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Quantité</th>
                    <th>Prix</th>
                    <th>Total</th>
                    <th>Image</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="orderProduct in orderInfo.orderProducts" :key="'tableInfo' + orderProduct.id">
                    <td> {{ products.find(p => p.id == orderProduct.productId).name }} </td>
                    <td> {{ orderProduct.amount }} </td>
                    <td> {{ Intl.NumberFormat().format(products.find(p => p.id == orderProduct.productId).price) }} MAD</td>
                    <td> {{ parseFloat(orderProduct.amount) * parseFloat(products.find(p => p.id == orderProduct.productId).price) }} MAD</td>
                    <td>
                      <v-btn small outlined icon color="primary" @click="previewImage = orderProduct.product.img">
                        <v-icon small>mdi-eye</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
                <tbody>
                  <tr>
                    <th colspan="2"></th>
                    <th class="text-right" colspan="2">Total en Dirhams</th>
                    <th> {{ Intl.NumberFormat().format(orderInfo.totalPrice) }} MAD</th>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-col>
              <v-expand-transition>
                <v-col class="text-center" cols="12" v-if="previewImage">
                  <v-btn class="my-4" outlined color="red" @click="previewImage = null">
                    <v-icon small class="mr-2">fas fa-times</v-icon>
                    Fermer Preview
                  </v-btn>
                  <v-img v-bind:src="previewImage"></v-img>
                </v-col>
              </v-expand-transition>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn outlined color="primary" @click="orderInfo = {id: 0, show: false}">
            Fermer
          </v-btn>
          <template v-if="orderInfo.status == 'NEW' && $store.getters.hasPerm('chef')">
            <v-spacer></v-spacer>
            <v-btn outlined color="success" @click="readyOrder(orderInfo)">
              <v-icon small class="mr-2">fas fa-check</v-icon>
              Completez
            </v-btn>
          </template>
          <template v-if="orderInfo.status == 'READY' && $store.getters.hasPerm('servant')">
            <v-spacer></v-spacer>
            <v-btn outlined color="success" @click="serveOrder(orderInfo)">
              <v-icon small class="mr-2">fas fa-check</v-icon>
              Serve
            </v-btn>
          </template>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  watch: {
    orderInfo() {
      this.orderInfo.totalPrice = 0;
      if ( this.orderInfo.id > 0 ) {
        for (const orderProduct of this.orderInfo.orderProducts) {
          this.orderInfo.totalPrice += parseFloat(orderProduct.amount) * parseFloat(orderProduct.product.price)
        }
      }
    },
    productDialog() {
      if ( !this.productDialog )
        this.editedOrderProduct = { productId: -1, amount: 1 }
    },
    'editedOrderProduct.amount'() {
      if ( this.editedOrderProduct.amount <= 0 )
        this.editedOrderProduct.amount = 1;
    }
  },
  computed: {
    showCreateOrUpdate() {
      return this.selectedItem.id
    }
  },
  data: () => {
    return {
      previewImage: null,
      productDialog: false,
      orderInfo: {
        id: 0,
        show: false,
      },
      selectedItem: {
        id: 0
      },
      columns: [
        { text: '#', value: 'id', align: 'start' },
        { text: "Status", value: 'status' },
        { text: 'Crée Le', value: 'createdAt' },
        { text: 'Actions', value: 'actions', sortable: false },
      ], 
      items: [],
      orderProducts: [],
      editedOrderProduct: {
        productId: -1,
        amount: 1,
      },
      products: [],
    }
  },
  created() {
    this.loadItems();
    this.loadProducts();
  },
  methods: {
    payOrder(order) {
      this.axios.put(`${process.env.VUE_APP_API_URL}/order/${order.id}`, { status: "PAID" }).then(() => {
        this.resetAll();
        this.loadItems();
        this.loadProducts();
        this.$swal(
          'Succès!',
          'Les modifications ont été effectuées avec succès.',
          'success'
        )
      }).catch(err => {
        console.log(err);
      })
    },
    readOrder(order) {
      this.axios.get(`${process.env.VUE_APP_API_URL}/order/${order.id}`).then((res) => {
        this.orderInfo = res.data;
        this.orderInfo.show = true;
      })
    },
    readyOrder(order) {
      this.axios.put(`${process.env.VUE_APP_API_URL}/order/${order.id}`, { status: "READY" }).then(() => {
        this.resetAll();
        this.loadItems();
        this.loadProducts();
        this.$swal(
          'Succès!',
          'Les modifications ont été effectuées avec succès.',
          'success'
        )
      }).catch(err => {
        console.log(err);
      })
    },
    serveOrder(order) {
      this.axios.put(`${process.env.VUE_APP_API_URL}/order/${order.id}`, { status: "SERVED" }).then(() => {
        this.resetAll();
        this.loadItems();
        this.loadProducts();
        this.$swal(
          'Succès!',
          'Les modifications ont été effectuées avec succès.',
          'success'
        )
      }).catch(err => {
        console.log(err);
      })
    },
    removeOrderProduct(productIndex) {
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
          this.orderProducts.splice(productIndex, 1)
        }
      })
    },
    addProduct() {
      this.orderProducts.push(this.editedOrderProduct);
      this.editedOrderProduct = { productId: -1, amount: 1 }
      this.productDialog = false;
    },
    loadItems() {
      this.axios.get(`${process.env.VUE_APP_API_URL}/orders`).then(res => {
        this.items = res.data;
      });
    },
    loadProducts() {
      this.axios.get(`${process.env.VUE_APP_API_URL}/products`).then(res => {
        this.products = res.data;
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
        const data = { products: this.orderProducts };
        this.axios.post(`${process.env.VUE_APP_API_URL}/order`, data).then(() => {
          this.resetAll();
          this.loadItems();
          this.loadProducts();
          this.$swal(
            'Succès!',
            'Les modifications ont été effectuées avec succès.',
            'success'
          )
        }).catch(err => {
          console.log(err);
        })
      } else if ( this.selectedItem.id >  0) {
        const data = {};
        this.axios.put(`${process.env.VUE_APP_API_URL}/order/${this.selectedItem.id}`, data).then(() => {
          this.resetAll();
          this.loadItems();
          this.loadProducts();
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
      this.orderInfo = { id: 0, show: false }
      this.orderProducts = []
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
          this.axios.delete(`${process.env.VUE_APP_API_URL}/order/${user.id}`).then(() => {
            this.$swal(
              'Supprimé!',
              'Commande a été annuler.',
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

<style>
input[readonly] {
  text-align: center;
}
</style>