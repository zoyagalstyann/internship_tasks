import { createRouter, createWebHistory } from "vue-router";
import ProductsView from "../views/ProductsView.vue";
import ProductView from "../views/ProductView.vue";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: "/products",
      component: ProductsView
    },
    {
      path: "/products/:id",
      component: ProductView
    }
  ]
});

export default router;