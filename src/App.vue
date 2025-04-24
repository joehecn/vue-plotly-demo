<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, RouterView } from 'vue-router'

const route = useRoute()

const routeName = ref('home')

watch(route, (to) => {
  routeName.value = to.name as string
})
</script>

<template>
  <el-container>
    <el-aside width="200px">
      <el-menu :default-active="routeName" router>
        <el-menu-item index="home" route="/">
          Settings
        </el-menu-item>
        <el-menu-item index="chiller" route="/chiller">
          Status - Chiller
        </el-menu-item>
        <el-menu-item index="cdwp" route="/cdwp">
          Status - CDWP
        </el-menu-item>
        <el-menu-item index="cooling-tower" route="/cooling-tower">
          Status - Cooling Tower
        </el-menu-item>
        <el-menu-item index="chiller-power" route="/chiller-power">
          Power - Chiller
        </el-menu-item>
        <el-menu-item index="cdwp-power" route="/cdwp-power">
          Power - CDWP
        </el-menu-item>
        <el-menu-item index="ct-power" route="/ct-power">
          Power - Cooling Tower
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-main>
      <RouterView />
    </el-main>
  </el-container>

</template>

<!-- <style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style> -->
