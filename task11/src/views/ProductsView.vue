<script setup>
import { ref, onMounted } from "vue";

const products = ref([]);
const loading = ref(true);
const error = ref("");

async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:3000/products");

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    products.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchProducts);
</script>

<template>
  <div class="products">
    <h1>Products</h1>

    <p v-if="loading">Loading...</p>

    <p v-else-if="error">{{ error }}</p>

    <div v-else>
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