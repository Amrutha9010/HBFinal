<template>
  <nav class="navbar" :class="{'dark-theme': isDarkTheme}">
    <div class="navbar-container">
      <!-- Logo -->
      <router-link to="/" class="navbar-logo">
        <font-awesome-icon :icon="['fas', 'users']" />
        Hostel Buddy
      </router-link>

      <!-- Theme Toggle -->
      <button @click="toggleTheme" class="theme-toggle">
        {{ isDarkTheme ? '☀' : '🌙' }}
      </button>

      <!-- Navigation Menu -->
      <ul class="nav-menu" :class="{'active': isOpen}">
        <li class="nav-item">
          <router-link to="/hostel-buddy" class="nav-links" @click="closeMenu">Home</router-link>
        </li>
        <li class="nav-item">
          <button @click="logout" class="nav-links logout-btn">Logout</button>
        </li>
      </ul>

      <!-- Mobile Menu Toggle -->
      <div class="menu-toggle" @click="toggleMenu">
        <div class="bar1" :class="{'active': isOpen}"></div>
        <div class="bar2" :class="{'active': isOpen}"></div>
        <div class="bar3" :class="{'active': isOpen}"></div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

library.add(faUsers);

export default {
  name: 'Navbar_admin',
  setup() {
    const router = useRouter();
    const isOpen = ref(false);
    const isDarkTheme = ref(false);

    const toggleMenu = () => {
      isOpen.value = !isOpen.value;
    };

    const closeMenu = () => {
      isOpen.value = false;
    };

    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value;
      localStorage.setItem('darkTheme', isDarkTheme.value ? 'dark' : 'light');
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { isDark: isDarkTheme.value }
      }));
    };

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    };

    onMounted(() => {
      const savedTheme = localStorage.getItem('darkTheme');
      if (savedTheme) {
        isDarkTheme.value = savedTheme === 'dark';
      }
    });

    return {
      isOpen,
      isDarkTheme,
      toggleMenu,
      closeMenu,
      toggleTheme,
      logout
    };
  }
}
</script>

<style scoped>
/* General Styles */
.navbar {
  background-color: #fff;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: sticky;
  top: 0;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  height: 80px;
  width: 100%;
  max-width: 1500px;
  padding: 0 24px;
}

.navbar-logo {
  color: #1BBC9B;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  font-weight: bold;
  text-decoration: none;
}

.navbar-logo svg {
  margin-right: 10px;
  font-size: 1.2em;
  transition: transform 0.3s ease;
}

.navbar-logo:hover svg {
  transform: scale(1.1);
  color: #16a085;
}

.theme-toggle {
  background-color: #44D4C5;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  height: 40px;
  margin-top: 20px;
  margin-left: auto;
  margin-right: 15px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background-color: #16a085;
  transform: scale(1.05);
}

/* Mobile Menu Toggle */
.menu-toggle {
  display: none;
  cursor: pointer;
  z-index: 1001;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.bar1, .bar2, .bar3 {
  width: 25px;
  height: 3px;
  margin: 5px auto;
  background-color: #333;
  transition: 0.4s;
}

.bar1.active {
  transform: rotate(45deg) translate(5px, 5px);
}

.bar2.active {
  opacity: 0;
}

.bar3.active {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Nav menu items */
.nav-menu {
  display: flex;
  align-items: center;
  list-style: none;
  transition: all 0.5s ease;
  margin: 0;
  padding: 0;
}

.nav-item {
  height: 80px;
}

.nav-links {
  color: #333;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  transition: all 0.3s ease;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;
}

.nav-links:hover {
  color: #1BBC9B;
}

.nav-links.router-link-exact-active {
  color: #1BBC9B;
  border-bottom: 3px solid #1BBC9B;
}

.logout-btn {
  color: #e74c3c;
}

.logout-btn:hover {
  color: #c0392b;
}

/* Dark Theme */
.navbar.dark-theme {
  background-color: #1A1C2D;
}

.navbar.dark-theme .navbar-logo {
  color: #44d4c5;
}

.navbar.dark-theme .nav-links {
  color: #e0e0e0;
}

.navbar.dark-theme .nav-links:hover {
  color: #44d4c5;
}

.navbar.dark-theme .nav-links.router-link-exact-active {
  color: #44d4c5;
  border-bottom: 3px solid #44d4c5;
}

.navbar.dark-theme .bar1,
.navbar.dark-theme .bar2,
.navbar.dark-theme .bar3 {
  background-color: #e0e0e0;
}

.navbar.dark-theme .theme-toggle {
  background-color: #44D4C5;
  color: #1A1C2D;
}

.navbar.dark-theme .logout-btn {
  color: #e74c3c;
}

.navbar.dark-theme .logout-btn:hover {
  color: #c0392b;
}

/* Mobile Responsive */
@media screen and (max-width: 768px) {
  .theme-toggle {
    position: absolute;
    right: 70px;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    padding: 6px 10px;
    font-size: 0.8rem;
    height: 35px;
  }

  .menu-toggle {
    display: block;
  }

  .nav-menu {
    position: fixed;
    left: -100%;
    top: 80px;
    width: 100%;
    height: calc(100vh - 80px);
    background-color: #fff;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.5s ease;
    z-index: 1000;
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-item {
    height: auto;
    width: 100%;
    padding: 15px 0;
    text-align: center;
  }

  .nav-links {
    padding: 1rem;
    width: 100%;
    display: block;
    text-align: center;
  }

  .nav-links:hover {
    background-color: #f5f5f5;
    color: #1BBC9B;
  }

  .nav-links.router-link-exact-active {
    background-color: #f5f5f5;
    border-bottom: none;
  }

  .navbar.dark-theme .nav-menu {
    background-color: #2E3047;
  }

  .navbar.dark-theme .nav-links:hover {
    background-color: #3a3d5a;
  }

  .navbar.dark-theme .nav-links.router-link-exact-active {
    background-color: #3a3d5a;
  }
}
</style>