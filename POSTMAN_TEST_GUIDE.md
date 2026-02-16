# Postman API Testing Guide & Test Cases

This project contains a comprehensive Postman Collection (`postman_collection.json`) designed for automated testing of the MyFarmerSolution Backend API.

## 🛠 Prerequisites

1.  **Install Postman**: Download and install [Postman](https://www.postman.com/downloads/).
2.  **Import Collection**: Import the `postman_collection.json` file into Postman.
3.  **Environment Setup**: Add a new environment in Postman with the following variable:
    *   `baseUrl`: `http://localhost:5000` (or your deployed URL)
    *   *Note: `app_token`, `PRODUCT_ID`, `VARIANT_ID`, and `orderId` will be auto-generated during testing.*

---

## 🧪 Automated Test Sequence (Recommended)

To run the full suite automatically using **Postman Collection Runner**:

1.  Open Postman.
2.  Select the **MyFarmerSolution API** collection.
3.  Click **Run** (or "Run Collection").
4.  Ensure the order of execution is as follows (Drag & Drop if needed):
    1.  **CMS Users** -> `Create CMS User` (Setup Admin)
    2.  **App Users (Mobile)** -> `Verify OTP (Register)` (Setup User)
    3.  **Products** -> `Create Product` (Setup Inventory)
    4.  **Coupons** -> `Create Coupon` (Setup Discounts)
    5.  **App Users (Mobile)** -> `Update Cart` (Add Item)
    6.  **Orders** -> `Place Order` (Checkout)
    7.  **Orders** -> `Get Order By ID` (Verify)
5.  Click **Run MyFarmerSolution API**.
6.  View the results in the summary pane.

---

## 📝 Manual Test Cases

If you prefer testing endpoints individually, follow this sequence to simulate a real user flow.

### 1. User Authentication (App User)
*   **Endpoint**: `POST /app-users/verify-otp`
*   **Action**: Send request with `phoneNumber: "+919999999999"` and `otp: "123456"`.
*   **Verify**: Status `200`. Response contains `token`.
*   **Note**: The token is **automatically saved** to the variable `{{app_token}}`.

### 2. Product Management (Admin/Backend)
*   **Endpoint**: `POST /products`
*   **Action**: Create a new product (e.g., "Neem Oil 500ml").
*   **Verify**: Status `201`. Response contains `_id` and `variants[0]._id`.
*   **Note**: The IDs are **automatically saved** to `{{PRODUCT_ID}}` and `{{VARIANT_ID}}`.

### 3. Coupon Creation
*   **Endpoint**: `POST /coupons`
*   **Action**: Create a coupon `SUMMER2025` with 15% discount.
*   **Verify**: Status `201`.

### 4. Shopping Cart
*   **Endpoint**: `PATCH /app-users/cart`
*   **Action**: Add quantity `2` of the product created in Step 2.
*   **Verify**: Status `200`. Response `data` array contains the item.

### 5. Checkout (Order Placement)
*   **Endpoint**: `POST /orders/checkout`
*   **Action**: Place an order using `cod` and coupon `SUMMER2025`.
*   **Verify**: 
    *   Status `201`.
    *   `finalAmount` is calculated correctly (Item Total - Discount).
    *   `status` is `confirmed`.

### 6. Order Verification
*   **Endpoint**: `GET /orders/my-orders`
*   **Action**: List orders for the logged-in user.
*   **Verify**: The recently placed order is at the top of the list.

### 7. Stock Reduction Check
*   **Endpoint**: `GET /products/:id`
*   **Action**: Check the product created in Step 2.
*   **Verify**: `stockQuantity` has decreased by `2`.

---
## 🐞 Troubleshooting

*   **401 Unauthorized**: Ensure you have run **Verify OTP** first so the `{{app_token}}` is populated.
*   **404 Product Not Found**: Ensure you have run **Create Product** first so `{{PRODUCT_ID}}` is populated.
*   **Insufficient Stock**: Check if you ran the Order test multiple times without restocking.
