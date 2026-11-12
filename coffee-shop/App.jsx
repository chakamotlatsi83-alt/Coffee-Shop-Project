import { useEffect, useState } from "react";
import { api } from "./api.js";
import "./App.css";

// Sample menu used while the backend is being developed
const sampleMenu = [
  {
    id: "1",
    name: "Cappuccino",
    description: "Rich espresso with steamed milk and creamy foam.",
    price: 35,
    category: "Coffee",
    available: true
  },
  {
    id: "2",
    name: "Latte",
    description: "Smooth espresso combined with steamed milk.",
    price: 40,
    category: "Coffee",
    available: true
  },
  {
    id: "3",
    name: "Americano",
    description: "Classic espresso with hot water.",
    price: 30,
    category: "Coffee",
    available: true
  },
  {
    id: "4",
    name: "Hot Chocolate",
    description: "Creamy chocolate drink topped with foam.",
    price: 38,
    category: "Drinks",
    available: true
  },
  {
    id: "5",
    name: "Green Tea",
    description: "Refreshing and relaxing green tea.",
    price: 25,
    category: "Tea",
    available: true
  },
  {
    id: "6",
    name: "Chocolate Muffin",
    description: "Freshly baked chocolate muffin.",
    price: 22,
    category: "Pastries",
    available: true
  },
  {
    id: "7",
    name: "Croissant",
    description: "Fresh and buttery pastry.",
    price: 28,
    category: "Pastries",
    available: true
  },
  {
    id: "8",
    name: "Iced Coffee",
    description: "Chilled coffee served over ice.",
    price: 42,
    category: "Drinks",
    available: true
  }
];

export default function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [customerName, setCustomerName] = useState("");
  const [page, setPage] = useState("home");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Retrieve menu from Express backend
  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await api.getMenu();

        const items = Array.isArray(data)
          ? data
          : data.menu || data.items || [];

        setMenu(items);
      } catch (error) {
        setMenu(sampleMenu);
        setMessage("Showing sample menu while the backend is being connected.");
      }
    }

    loadMenu();
  }, []);

  // Add product to shopping cart
  function addToCart(product) {
    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previousCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, {
        ...product,
        quantity: 1,
        price: Number(product.price)
      }];
    });
  }

  // Change product quantity
  function changeQuantity(id, amount) {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // Remove product
  function removeFromCart(id) {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== id)
    );
  }

  // Calculate total price
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Submit customer order
  async function submitOrder(event) {
    event.preventDefault();

    if (!customerName.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (cart.length === 0) {
      alert("Please add products to your cart.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const orderData = {
        customerName: customerName.trim(),
        items: cart.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const result = await api.placeOrder(orderData);
      const savedOrder = result.order || result.data || result;

      setOrder(savedOrder);
      setCart([]);
      setPage("confirmation");
      setCustomerName("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Filter menu categories
  const filteredMenu = menu.filter((item) => {
    return (
      category === "All" ||
      item.category === category
    ) && item.available !== false;
  });

  return (
    <div className="coffee-app">

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          ☕ Coffee House
        </div>

        <nav>
          <button onClick={() => setPage("home")}>
            Home
          </button>

          <button onClick={() => setPage("menu")}>
            Menu
          </button>

          <button onClick={() => setPage("cart")}>
            My Cart ({cartCount})
          </button>
        </nav>
      </header>

      {/* NOTIFICATION */}
      {message && (
        <div className="notice">
          {message}
        </div>
      )}

      <main>

        {/* HOMEPAGE */}
        {page === "home" && (
          <section className="hero">
            <div className="hero-content">
              <p className="welcome">WELCOME TO COFFEE HOUSE</p>

              <h1>
                Fresh Coffee,<br />
                Fresh Moments.
              </h1>

              <p>
                Enjoy freshly prepared coffee, delicious tea
                and tasty pastries made just for you.
              </p>

              <button
                className="primary-btn"
                onClick={() => setPage("menu")}
              >
                Explore Our Menu
              </button>
            </div>

            <div className="hero-image">
              ☕
            </div>
          </section>
        )}

        {/* MENU PAGE */}
        {page === "menu" && (
          <section className="menu-section">
            <h1>Our Menu</h1>
            <p>Discover your favourite drinks and treats.</p>

            <div className="categories">
              {["All", "Coffee", "Tea", "Pastries", "Drinks"].map(
                (item) => (
                  <button
                    key={item}
                    className={
                      category === item ? "active-category" : ""
                    }
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <div className="menu-grid">
              {filteredMenu.map((item) => (
                <div className="menu-card" key={item.id}>
                  <div className="product-icon">
                    {item.category === "Coffee" ? "☕" :
                     item.category === "Tea" ? "🍵" :
                     item.category === "Pastries" ? "🥐" : "🥤"}
                  </div>

                  <h3>{item.name}</h3>

                  <p>{item.description}</p>

                  <div className="product-bottom">
                    <strong>
                      M {Number(item.price).toFixed(2)}
                    </strong>

                    <button onClick={() => addToCart(item)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMenu.length === 0 && (
              <p>No products available in this category.</p>
            )}
          </section>
        )}

        {/* SHOPPING CART */}
        {page === "cart" && (
          <section className="cart-section">
            <h1>Your Shopping Cart</h1>

            {cart.length === 0 ? (
              <p>Your shopping cart is empty.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>M {item.price.toFixed(2)}</p>
                    </div>

                    <div className="quantity-controls">
                      <button onClick={() =>
                        changeQuantity(item.id, -1)
                      }>
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button onClick={() =>
                        changeQuantity(item.id, 1)
                      }>
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <h2>
                  Total: M {total.toFixed(2)}
                </h2>

                <button
                  className="primary-btn"
                  onClick={() => setPage("checkout")}
                >
                  Proceed to Checkout
                </button>
              </>
            )}
          </section>
        )}

        {/* CHECKOUT PAGE */}
        {page === "checkout" && (
          <section className="checkout-section">
            <h1>Complete Your Order</h1>

            <p>
              Order Total: M {total.toFixed(2)}
            </p>

            <form onSubmit={submitOrder}>
              <label>Customer Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                required
              />

              <button
                type="submit"
                className="primary-btn"
                disabled={loading || cart.length === 0}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </section>
        )}

        {/* ORDER CONFIRMATION */}
        {page === "confirmation" && order && (
          <section className="confirmation-section">
            <div className="success-icon">✓</div>

            <h1>Order Placed Successfully!</h1>

            <p>Thank you for ordering from Coffee House.</p>

            <h3>Your Order Number</h3>

            <h2>
              {order.id || order.orderNumber || order.orderId}
            </h2>

            <p>
              Status: {order.status || "Pending"}
            </p>

            <p>
              Total: M {Number(order.total ?? total).toFixed(2)}
            </p>

            <button
              className="primary-btn"
              onClick={() => {
                setOrder(null);
                setPage("menu");
              }}
            >
              Continue Shopping
            </button>
          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer>
        <h2> Coffee House</h2>
        <p>Fresh Coffee, Fresh Moments.</p>
        <p>© 2026 Coffee Shop Management System</p>
      </footer>

    </div>
  );
}