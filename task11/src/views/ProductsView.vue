<script setup>
import { ref, onMounted } from "vue";

const products = ref([]);

async function fetchProducts() {
  const response = await fetch("http://localhost:3000/products");
  products.value = await response.json();
}

onMounted(fetchProducts);
</script>

<template>
  <div class="products">
    <h1>Products</h1>

    <div
      v-for="product in products"
      :key="product.id"
      class="product"
    >
      <RouterLink :to="`/products/${product.id}`">
        <h2>{{ product.title }}</h2>
      </RouterLink>

      <p>${{ product.price }}</p>
    </div>
  </div>
</template>

<style scoped>
.products {
  max-width: 600px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
}

.product {
  padding: 15px;
  margin-top: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.product a {
  text-decoration: none;
}

.product h2 {
  margin: 0;
}

.product p {
  margin-bottom: 0;
}
</style>