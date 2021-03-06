import page from "page";
import checkConnectivity from "network-latency";
import {
  getRessource,
  getRessources,
  getRessourceCart,
  setRessource,
  setRessources,
  setRessourceCart
} from './idbHelper';
import {getProducts, getProduct} from "./api/products"
import {getCart, setCart} from "./api/cart"


(async (root) => {
  const skeleton = root.querySelector(".skeleton");
  const main = root.querySelector("main");

  checkConnectivity({
    interval: 3000,
    threshold: 2000
  });

  let NETWORK_STATE = true;

  document.addEventListener('connection-changed', ({ detail: state }) => {
    NETWORK_STATE = state;
    if (NETWORK_STATE) {
      document.documentElement
        .style.setProperty('--app-bg-color', 'royalblue');
      document.querySelector("header > a").style.setProperty("background-color", "#51a5ff");
      setCartNetworkRecovered();
    } else {
      document.documentElement
        .style.setProperty('--app-bg-color', '#6e6f72');
      document.querySelector("header > a").style.setProperty("background-color", "#94969a");
    }
  });

  const AppHome = main.querySelector('app-home');
  const AppProduct = main.querySelector('app-product');
  const AppCart = main.querySelector('app-cart');

  async function setCartNetworkRecovered() {
    let cart = await getRessourceCart();
    if (cart) {
      await setCart(cart);
    }
  }

  page('*', (ctx, next) => {
    AppHome.active = false;
    AppProduct.active = false;
    AppCart.active = false;

    skeleton.removeAttribute('hidden');

    next();
  });

  page('/', async () => {
    await import("./views/app-home");
    
    let storedProducts = [];
    if (NETWORK_STATE) {
      const products = await getProducts();
      storedProducts = await setRessources(products);
    } else {
      storedProducts = await getRessources();
    }

    AppHome.products = storedProducts;
    AppHome.active = true;

    skeleton.setAttribute('hidden', true);
  });

  page('/product/:id', async ({ params }) => {
    await import('./views/app-product');

    let storedProduct = {};
    if (NETWORK_STATE) {
      const product = await getProduct(params.id);
      storedProduct = await setRessource(product);
    } else {
      storedProduct = await getRessource(params.id);
    }

    AppProduct.product = storedProduct;
    AppProduct.active = true;

    skeleton.setAttribute('hidden', true);
  });

  page('/cart', async () => {
    await import('./views/app-cart');

    let storedCart = [];
    if (NETWORK_STATE) {
      const cart = await getCart();
      storedCart = await setRessourceCart(cart);
    } else {
      storedCart = await getRessourceCart();
    }

    AppCart.cart = storedCart;
    AppCart.active = true;

    skeleton.setAttribute('hidden', true);
  });

  page();
})(document.querySelector("#app"));