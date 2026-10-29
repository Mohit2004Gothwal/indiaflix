const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload
      ? payload.message || payload.error
      : payload;
    throw new Error(message || `Request failed (${response.status})`);
  }

  return payload;
}

export function getPlans() {
  return request('/plans');
}

// The API has evolved during backend development. Normalize the known response
// shapes at the UI boundary so components can remain simple.
export function normalizePlans(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.plans)
      ? payload.plans
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return rows
    .filter((plan) => plan && plan.is_active !== false && plan.isActive !== false)
    .map((plan, index) => {
      const rawFeatures =
        plan.features ??
        plan.details?.features ??
        plan.plan_features ??
        plan.details ??
        [];

      const features = Array.isArray(rawFeatures)
        ? rawFeatures.map((feature) => {
            if (typeof feature === 'string') return { name: feature, value: true };
            return {
              name: feature.feature_name ?? feature.name ?? feature.title ?? 'Feature',
              value: feature.feature_value ?? feature.value ?? feature.enabled ?? true,
            };
          })
        : [];

      return {
        id: plan.id ?? plan.plan_id ?? `${plan.name || 'plan'}-${index}`,
        name: plan.name ?? plan.plan_name ?? `Plan ${index + 1}`,
        price: Number(plan.price ?? plan.amount ?? 0),
        currency: plan.currency ?? 'INR',
        billingPeriod: plan.billing_period ?? plan.billingPeriod ?? 'month',
        description: plan.description ?? plan.tagline ?? '',
        features,
      };
    });
}

export function formatPrice(price, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}