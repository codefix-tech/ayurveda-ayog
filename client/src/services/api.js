const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/products?${query}`);
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  return res.json();
}

export async function fetchBrands() {
  const res = await fetch(`${API_BASE}/brands`);
  return res.json();
}

export async function fetchDoctors() {
  const res = await fetch(`${API_BASE}/doctors`);
  return res.json();
}

export async function bookAppointment(appointmentData) {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(appointmentData)
  });
  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData)
  });
  return res.json();
}

export async function fetchMyOrders() {
  const res = await fetch(`${API_BASE}/orders/my`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function fetchMyAppointments() {
  const res = await fetch(`${API_BASE}/appointments/my`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function createRazorpayOrder(amount, receipt) {
  const res = await fetch(`${API_BASE}/create-order`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount, receipt })
  });
  return res.json();
}

export async function verifyRazorpayPayment(paymentData) {
  const res = await fetch(`${API_BASE}/verify-payment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentData)
  });
  return res.json();
}

export async function sendOtpApi(data) {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function verifyOtpApi(data) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function verifyPincodeApi(pincode) {
  const res = await fetch(`${API_BASE}/pincode/${pincode}`);
  return res.json();
}


