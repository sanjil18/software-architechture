# SL Traffic Fine Pay

A React Native (Expo) mobile app for the Sri Lanka Police Traffic Fine Management System university project. Drivers can look up a traffic fine issued against them, review the details, and pay it from their phone — mirroring the web Payment Portal, but as a native mobile experience.

This app is a **pure API consumer**. It does not run its own backend or database; it talks to the existing Express + MongoDB REST API (the same one used by the web app) over HTTP.

## Tech Stack

- **Expo** (~51) — React Native tooling and dev client
- **React Navigation** (native + stack) — screen navigation
- **Axios** — HTTP client for the REST API
- **@react-native-picker/picker** — category dropdown
- **react-native-safe-area-context** / **react-native-screens** — native screen/safe-area handling

## Project Structure

```
mobile/
├── src/
│   ├── api/api.js              All axios calls (getCategories, lookupFine, payFine)
│   ├── config/constants.js     BASE_URL + color palette
│   ├── screens/                HomeScreen, FineDetailScreen, PaymentScreen, SuccessScreen
│   ├── components/             LoadingButton, FineCard, StatusBadge (reusable UI)
│   └── utils/formatters.js     formatCurrency, formatDate, card/expiry formatting
├── App.js                      Navigation stack setup
├── app.json                    Expo app config
└── package.json
```

## How to Run

1. **Install dependencies**
   ```
   cd mobile
   npm install
   ```

2. **Point the app at your backend.** Phones (physical or emulated) cannot reach `localhost` — that resolves to the phone itself, not your computer. Open [src/config/constants.js](src/config/constants.js) and set `BASE_URL` to your computer's LAN IP address:
   ```js
   export const BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';
   ```
   Find your IP with `ipconfig` (Windows, look under your Wi-Fi adapter) or `ifconfig`/`ipconfig getifaddr en0` (Mac/Linux). Your phone and computer must be on the **same Wi-Fi network**. The backend must already be running (`npm run dev` in `backend/`) and reachable on port 5000.

3. **Start the backend** (in a separate terminal, from the `backend/` folder):
   ```
   npm run dev
   ```

4. **Start the Expo dev server**
   ```
   npx expo start
   ```
   Scan the QR code with the Expo Go app on your phone, or press `a`/`i` to launch an Android/iOS emulator.

## Screens

1. **HomeScreen** — Enter the fine reference number, pick a violation category (loaded from `GET /api/categories`), and tap "Look Up Fine" (`GET /api/fines/lookup`). Shows a spinner while searching and an inline error if the fine isn't found.
2. **FineDetailScreen** — Displays the full fine in a card: violation, amount (LKR), driver, vehicle, location, issue/due dates, and a colored status badge (pending = yellow, overdue = red, paid = green). "Pay Now" proceeds to payment; "Back" returns to the search screen.
3. **PaymentScreen** — Simulated card payment form (card number, expiry, CVV, cardholder name) with input formatting and validation. "Pay Now" calls `POST /api/fines/:id/pay` with `paymentMethod: "mobile"` so it shows up correctly on the admin dashboard's payment-channel chart. Shows a loading spinner on the button and an alert on failure.
4. **SuccessScreen** — Green checkmark, payment confirmation, reference number and amount paid. "Done" resets the navigation stack back to HomeScreen.

## Notes

- Payment is **simulated** — there is no real payment gateway integration, matching the behavior of the existing web Payment Portal. No real card data is transmitted or stored anywhere.
- `paymentReference` is generated client-side as `MOB-<timestamp>` and sent to the backend alongside `paymentMethod: "mobile"`.
