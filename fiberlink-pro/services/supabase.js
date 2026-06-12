window.SUPABASE_URL = 'https://fezqufsojshigxjvkdti.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlenF1ZnNvanNoaWd4anZrZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNzE3ODcsImV4cCI6MjA5NTc0Nzc4N30.0RZBCCxiHXLNGkzoigQAFSNx9TQ6PCVFQvZHlFAiadI';

function isUUID(val) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val));
}

function initSupabase() {
  if (!window.supabase) {
    console.error('Supabase JS library is not loaded.');
    return null;
  }
  window.SUPABASE = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  return window.SUPABASE;
}

function ensureSupabase() {
  if (!window.SUPABASE) return initSupabase();
  return window.SUPABASE;
}

function handleResponse(response) {
  if (response.error) {
    console.error('Supabase error:', response.error.message, '| code:', response.error.code, '| details:', response.error.details, '| hint:', response.error.hint);
    return { data: null, error: response.error };
  }
  return { data: response.data, error: null };
}

window.SupabaseService = {
  init: initSupabase,

  // ── FETCH ──
  fetchClients: async function () {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    return handleResponse(await sb.from('clients').select('*').order('created_at', { ascending: false }));
  },
  fetchPayments: async function () {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    return handleResponse(await sb.from('payments').select('*').order('created_at', { ascending: false }));
  },
  fetchPlans: async function () {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    return handleResponse(await sb.from('plans').select('*').order('price', { ascending: true }));
  },
  fetchContracts: async function () {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    return handleResponse(await sb.from('contracts').select('*').order('created_at', { ascending: false }));
  },

  // ── CLIENTS ──
  upsertClient: async function (client) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    const payload = { ...client };
    if (payload.id      && !isUUID(payload.id))      delete payload.id;
    if (payload.plan_id && !isUUID(payload.plan_id)) delete payload.plan_id;
    return handleResponse(await sb.from('clients').upsert(payload).select());
  },
  deleteClient: async function (id) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    if (!isUUID(id)) return { data: null, error: null };
    return handleResponse(await sb.from('clients').delete().eq('id', id));
  },

  // ── PLANS ──
  upsertPlan: async function (plan) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    const payload = { ...plan };
    if (payload.id && !isUUID(payload.id)) delete payload.id;
    return handleResponse(await sb.from('plans').upsert(payload).select());
  },
  deletePlan: async function (id) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    if (!isUUID(id)) return { data: null, error: null };
    return handleResponse(await sb.from('plans').delete().eq('id', id));
  },

  // ── PAYMENTS ──
  insertPayment: async function (payment) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    return handleResponse(await sb.from('payments').insert(payment).select());
  },

  // ── CONTRACTS ──
  insertContract: async function (contract) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    return handleResponse(await sb.from('contracts').insert(contract).select());
  },
  updateContract: async function (id, updates) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    if (!isUUID(id)) return { data: null, error: null };
    return handleResponse(await sb.from('contracts').update(updates).eq('id', id).select());
  },

  // ── USERS ──
  fetchUsers: async function () {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };
    return handleResponse(await sb.from('users').select('*').order('created_at', { ascending: true }));
  },

  // ── AUTH ──
  loginUser: async function (email, password) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };

    try {
      const { data, error } = await sb
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return { data: null, error: new Error('User not found') };
      }

      // Simple password verification (in production, use proper hashing)
      if (data.password_hash !== btoa(password)) {
        return { data: null, error: new Error('Invalid password') };
      }

      return {
        data: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status
        },
        error: null
      };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  registerUser: async function (name, email, password) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };

    try {
      // Check if email exists
      const { data: existing } = await sb
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        return { data: null, error: new Error('Email already registered') };
      }

      // Create new user with basic role
      const passwordHash = btoa(password);
      const { data, error } = await sb
        .from('users')
        .insert([{
          name,
          email,
          password_hash: passwordHash,
          role: 'user',
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role
        },
        error: null
      };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  createUser: async function (name, email, password, role = 'user') {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };

    try {
      const { data: existing } = await sb
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        return { data: null, error: new Error('Email already registered') };
      }

      const passwordHash = btoa(password);
      const { data, error } = await sb
        .from('users')
        .insert([{
          name,
          email,
          password_hash: passwordHash,
          role,
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  updateUser: async function (userId, updates) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };

    try {
      if (!isUUID(userId)) return { data: null, error: null };

      const { data, error } = await sb
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  deleteUser: async function (userId) {
    const sb = ensureSupabase();
    if (!sb) return { data: null, error: new Error('not initialized') };

    try {
      if (!isUUID(userId)) return { data: null, error: null };

      const { data, error } = await sb
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // ── REALTIME ──
  listenClients: function (callback) {
    const sb = ensureSupabase();
    if (!sb) return null;
    return sb.channel('public:clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, payload => callback(payload))
      .subscribe();
  },
  listenPayments: function (callback) {
    const sb = ensureSupabase();
    if (!sb) return null;
    return sb.channel('public:payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, payload => callback(payload))
      .subscribe();
  }
};

window.SupabaseService.init();
