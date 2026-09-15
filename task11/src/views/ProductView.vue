<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const product = ref(null);
const loading = ref(true);
const error = ref("");

async function fetchProduct() {
  try {
    const response = await fetch(
      `http://localhost:3000/products/${route.params.id}`
    );

    if (!response.ok) {
      throw new Error("Product not found");
    }

    product.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchProduct);
</script>

<template>
  <div class="product-page">
    <RouterLink to="/products">
      Back to Products
    </RouterLink>

    <p v-if="loading">Loading...</p>

    <p v-else-if="error">{{ error }}</p>

    <div v-else class="product">
      <h1>{{ product.title }}</h1>
      <p>Price: ${{ product.price }}</p>
    </div>
  </div>
</template>

<style scoped>
.product-page {
  max-width: 600px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
}

.product-page a {
  text-decoration: none;
}

.product {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.product h1 {
  margin-top: 0;
}
</style>