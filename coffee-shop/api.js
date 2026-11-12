
// Backend URL from environment variable
const BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");


// Reusable function for sending requests
async function request(path, options = {}) {

    let response;

    try {

        response = await fetch(`${BASE_URL}${path}`, {

            ...options,

            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }

        });

    } catch (error) {

        throw new Error("Cannot connect to the server. Please try again.");

    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {

        throw new Error(
            data.error || `Request failed (${response.status})`
        );

    }

    return data;

}


// FRONTEND API FUNCTIONS
export const api = {

    // Check backend connection
    health: () => request("/api/health"),


    // Get all menu items
    getMenu: () => request("/api/menu"),


    // Get one menu item
    getMenuItem: (id) => request(`/api/menu/${id}`),


    // Place a customer order
    placeOrder: (order) => request("/api/orders", {

        method: "POST",

        body: JSON.stringify(order)

    })

};