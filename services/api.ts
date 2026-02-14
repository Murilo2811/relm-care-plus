import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ClaimStatus, LinkStatus, Role, User, WarrantyClaim, WarrantyEvent, Store } from '../types';

const API_URL = 'http://localhost:3001';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'; // Correctly parse boolean

// --- HELPER: Local Storage for Session Persistence ---
const STORAGE_KEY = 'relm_token';
const USER_KEY = 'relm_user';

const getStoredToken = () => localStorage.getItem(STORAGE_KEY);
const getStoredUser = (): User | null => {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
};

// --- MOCK DATA (Fallback/Demo Mode) ---
let mockClaims: WarrantyClaim[] = [
  {
    id: '1',
    protocolNumber: 'HB-20231025-1001',
    customerName: 'João Silva',
    customerPhone: '11999998888',
    customerEmail: 'joao@email.com',
    itemType: 'Bike',
    productDescription: 'Mountain Bike XC 900',
    serialNumber: 'RELM-XC9-123456',
    invoiceNumber: '000.123.456',
    purchaseDate: '2023-01-15',
    purchaseStoreName: 'Bike Point SP',
    storeId: 'store-1',
    linkStatus: LinkStatus.LINKED_AUTO,
    status: ClaimStatus.EM_ANALISE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    protocolNumber: 'HB-20231026-1002',
    customerName: 'Maria Oliveira',
    customerPhone: '21988887777',
    customerEmail: 'maria@email.com',
    itemType: 'Acessório',
    productDescription: 'Capacete Aero',
    serialNumber: 'RELM-ACC-999',
    invoiceNumber: '000.987.654',
    purchaseStoreName: 'Loja Desconhecida',
    linkStatus: LinkStatus.PENDING_REVIEW,
    status: ClaimStatus.RECEBIDO,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let mockEvents: WarrantyEvent[] = [
  {
    id: 'e1',
    claimId: '1',
    eventType: 'STATUS_CHANGE',
    fromStatus: ClaimStatus.RECEBIDO,
    toStatus: ClaimStatus.EM_ANALISE,
    comment: 'Iniciando análise técnica',
    createdAt: new Date().toISOString(),
    createdByUserName: 'Técnico Relm'
  }
];

let mockStores: Store[] = [
  {
    id: 'store-1',
    tradeName: 'Bike Point SP',
    legalName: 'Bike Point Comércio de Bicicletas LTDA',
    cnpj: '12.345.678/0001-90',
    city: 'São Paulo',
    state: 'SP',
    contactName: 'Carlos Gerente',
    contactEmail: 'loja@bikepoint.com',
    active: true,
    claimsCount: 12
  },
  {
    id: 'store-2',
    tradeName: 'Pedal Power Sul',
    legalName: 'Pedal Power Comércio LTDA',
    cnpj: '98.765.432/0001-10',
    city: 'Curitiba',
    state: 'PR',
    contactName: 'Ana Souza',
    contactEmail: 'contato@pedalpower.com.br',
    active: true,
    claimsCount: 5
  }
];

const MOCK_ADMIN: User = { id: 'u1', name: 'Admin Relm', email: 'admin@relm.com', role: Role.ADMIN_RELM, active: true };
const MOCK_STORE: User = { id: 'u2', name: 'Gerente Loja', email: 'loja@bikepoint.com', role: Role.LOJA, storeId: 'store-1', active: true };
let mockUsers: User[] = [MOCK_ADMIN, MOCK_STORE];


// --- IMPLEMENTATION 1: MOCK API (Client-Side Logic) ---
const MockApi = {
  auth: {
    login: async (email: string, pass: string) => {
      const foundUser = mockUsers.find(u => u.email === email);
      let user = foundUser;

      if (!foundUser) {
        if (email.includes('admin')) user = MOCK_ADMIN;
        else if (email.includes('loja')) user = MOCK_STORE;
        else throw new Error('Credenciais inválidas');
      }

      if (user && !user.active) throw new Error('Usuário inativo.');

      // Simulate Session
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY, 'mock-jwt-token');
      return user!;
    },
    logout: async () => {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(STORAGE_KEY);
    },
    getCurrentUser: () => getStoredUser()
  },
  claims: {
    createPublic: async (data: any) => {
      const newClaim: WarrantyClaim = {
        id: Math.random().toString(36).substr(2, 9),
        protocolNumber: `HB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: ClaimStatus.RECEBIDO,
        linkStatus: LinkStatus.PENDING_REVIEW,
        storeId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      };
      mockClaims.push(newClaim);
      return newClaim;
    },
    list: async () => {
      const currentUser = getStoredUser();
      if (!currentUser) throw new Error('Unauthorized');

      let result = [...mockClaims];

      if (currentUser.role === Role.LOJA) {
        result = result.filter(c => c.storeId === currentUser.storeId);
        result = result.map(c => ({
          ...c,
          customerPhone: c.customerPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) *****-$3'),
          customerEmail: '***@***.com'
        }));
      }
      return result;
    },
    getById: async (id: string) => {
      const currentUser = getStoredUser();
      const claim = mockClaims.find(c => c.id === id);
      if (currentUser?.role === Role.LOJA && claim?.storeId !== currentUser.storeId) return null;
      return claim;
    },
    getByProtocol: async (protocol: string) => {
      const claim = mockClaims.find(c => c.protocolNumber === protocol);
      return claim || null;
    },
    updateStatus: async (id: string, newStatus: ClaimStatus, comment: string) => {
      const currentUser = getStoredUser();
      const claim = mockClaims.find(c => c.id === id);
      if (!claim) throw new Error('Not found');

      const oldStatus = claim.status;
      claim.status = newStatus;
      claim.updatedAt = new Date().toISOString();

      const event: WarrantyEvent = {
        id: Math.random().toString(),
        claimId: id,
        eventType: 'STATUS_CHANGE',
        fromStatus: oldStatus,
        toStatus: newStatus,
        comment,
        createdAt: new Date().toISOString(),
        createdByUserName: currentUser?.name || 'Unknown'
      };
      mockEvents.push(event);
      return claim;
    },
    getHistory: async (id: string) => {
      return mockEvents.filter(e => e.claimId === id);
    }
  },
  stores: {
    list: async () => {
      return [...mockStores];
    },
    getById: async (id: string) => {
      return mockStores.find(s => s.id === id) || null;
    },
    update: async (id: string, data: Partial<Store>) => {
      const index = mockStores.findIndex(s => s.id === id);
      if (index >= 0) {
        mockStores[index] = { ...mockStores[index], ...data };
        return mockStores[index];
      }
      throw new Error('Store not found');
    }
  },
  users: {
    list: async () => {
      return [...mockUsers];
    },
    create: async (userData: Omit<User, 'id'>) => {
      const newUser: User = { id: Math.random().toString(36).substr(2, 9), ...userData };
      mockUsers.push(newUser);
      return newUser;
    },

    update: async (id: string, user: Partial<User>) => {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index >= 0) {
        mockUsers[index] = { ...mockUsers[index], ...user };
        return mockUsers[index];
      }
      throw new Error('User not found');
    },

    toggleStatus: async (id: string) => {
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex >= 0) {
        mockUsers[userIndex].active = !mockUsers[userIndex].active;
        return mockUsers[userIndex];
      }
      throw new Error('User not found');
    }
  }
};


// --- IMPLEMENTATION 2: SUPABASE CLIENT (Real Backend Connection) ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- SUPABASE CLIENT (Lazy Initialization) ---
let supabaseInstance: SupabaseClient | null = null;

const getSupabase = (): SupabaseClient => {
  if (USE_MOCK) throw new Error('Cannot get Supabase client in Mock mode');

  if (supabaseInstance) return supabaseInstance;

  if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing!');
    throw new Error('Supabase configuration missing.');
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      realtime: { params: { eventsPerSecond: 0 } },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
    console.log('Supabase Client Initialized Successfully (Lazy)');
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    throw error;
  }
};

const RemoteApi = {
  auth: {
    login: async (email: string, pass: string) => {
      const { data, error } = await getSupabase().auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Erro desconhecido ao logar.');

      // Fetch additional user profile data from public schema
      const { data: userProfile, error: profileError } = await getSupabase()
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !userProfile) {
        // Fallback if profile missing
        return {
          id: data.user.id,
          name: data.user.user_metadata.name || email.split('@')[0],
          email: email,
          role: Role.LOJA,
          active: true
        } as User;
      }

      const user: User = {
        id: userProfile.id,
        name: userProfile.full_name,
        email: data.user.email || '', // Email comes from auth, not necessarily profile
        role: userProfile.role as Role,
        storeId: userProfile.store_id || undefined,
        active: userProfile.is_active
      };

      localStorage.setItem(USER_KEY, JSON.stringify(user));

      return user;
    },
    logout: async () => {
      await getSupabase().auth.signOut();
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(STORAGE_KEY);
    },
    getCurrentUser: () => getStoredUser()
  },
  claims: {
    createPublic: async (data: any) => {
      // Prepare payload for RPC function
      const payload = {
        protocol_number: `HB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        customer_email: data.customerEmail,
        item_type: data.itemType,
        product_description: data.productDescription,
        serial_number: data.serialNumber,
        invoice_number: data.invoiceNumber,
        purchase_date: data.purchaseDate,
        purchase_store_name: data.purchaseStoreName
      };

      // Use RPC (Remote Procedure Call) to bypass RLS securely
      const { data: result, error } = await getSupabase()
        .rpc('create_public_claim', { claim_data: payload });

      if (error) throw error;

      // Access the returned JSON object directly
      const newClaim = result;

      return {
        id: newClaim.id,
        protocolNumber: newClaim.protocol_number,
        customerName: newClaim.customer_name,
        customerPhone: newClaim.customer_phone,
        customerEmail: newClaim.customer_email,
        itemType: newClaim.item_type,
        product_description: newClaim.product_description, // Note: DB returns snake_case key if using to_jsonb
        productDescription: newClaim.product_description, // Fix mapping
        serialNumber: newClaim.serial_number,
        invoiceNumber: newClaim.invoice_number,
        purchaseDate: newClaim.purchase_date,
        purchaseStoreName: newClaim.purchase_store_name,
        storeId: newClaim.store_id,
        linkStatus: newClaim.link_status as LinkStatus,
        status: newClaim.status as ClaimStatus,
        createdAt: newClaim.created_at,
        updatedAt: newClaim.updated_at
      } as WarrantyClaim;
    },
    list: async () => {
      const currentUser = getStoredUser();
      if (!currentUser) throw new Error('Unauthorized');

      let query = getSupabase().from('warranty_claims').select('*');

      if (currentUser.role === Role.LOJA) {
        query = query.eq('store_id', currentUser.storeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((c: any) => {
        const claim: WarrantyClaim = {
          id: c.id,
          protocolNumber: c.protocol_number,
          customerName: c.customer_name,
          customerPhone: c.customer_phone,
          customerEmail: c.customer_email,
          itemType: c.item_type,
          productDescription: c.product_description,
          serialNumber: c.serial_number,
          invoiceNumber: c.invoice_number,
          purchaseDate: c.purchase_date,
          purchaseStoreName: c.purchase_store_name,
          purchaseStoreCity: c.purchase_city,
          purchaseStoreState: c.purchase_state,
          storeId: c.store_id,
          linkStatus: c.link_status as LinkStatus,
          status: c.status as ClaimStatus,
          createdAt: c.created_at,
          updatedAt: c.updated_at
        };

        if (currentUser.role === Role.LOJA) {
          claim.customerPhone = claim.customerPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) *****-$3');
          claim.customerEmail = '***@***.com';
        }
        return claim;
      });
    },
    getById: async (id: string) => {
      const currentUser = getStoredUser();

      const { data: c, error } = await getSupabase()
        .from('warranty_claims')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null;
      if (currentUser?.role === Role.LOJA && c.store_id !== currentUser.storeId) return null;

      return {
        id: c.id,
        protocolNumber: c.protocol_number,
        customerName: c.customer_name,
        customerPhone: c.customer_phone,
        customerEmail: c.customer_email,
        itemType: c.item_type,
        productDescription: c.product_description,
        serialNumber: c.serial_number,
        invoiceNumber: c.invoice_number,
        purchaseDate: c.purchase_date,
        purchaseStoreName: c.purchase_store_name,
        purchaseStoreCity: c.purchase_city,
        purchaseStoreState: c.purchase_state,
        storeId: c.store_id,
        linkStatus: c.link_status as LinkStatus,
        status: c.status as ClaimStatus,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      } as WarrantyClaim;
    },
    getByProtocol: async (protocol: string) => {
      const { data: c, error } = await getSupabase()
        .from('warranty_claims')
        .select('*')
        .eq('protocol_number', protocol)
        .single();

      if (error || !c) return null;

      return {
        id: c.id,
        protocolNumber: c.protocol_number,
        customerName: c.customer_name,
        customerPhone: c.customer_phone,
        customerEmail: c.customer_email,
        itemType: c.item_type,
        productDescription: c.product_description,
        serialNumber: c.serial_number,
        invoiceNumber: c.invoice_number,
        purchaseDate: c.purchase_date,
        purchaseStoreName: c.purchase_store_name,
        purchaseStoreCity: c.purchase_city,
        purchaseStoreState: c.purchase_state,
        storeId: c.store_id,
        linkStatus: c.link_status as LinkStatus,
        status: c.status as ClaimStatus,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      } as WarrantyClaim;
    },
    updateStatus: async (id: string, newStatus: ClaimStatus, comment: string) => {
      const currentUser = getStoredUser();

      const { data: currentClaim } = await getSupabase().from('warranty_claims').select('status').eq('id', id).single();
      const oldStatus = currentClaim?.status;

      const { data: updated, error } = await getSupabase()
        .from('warranty_claims')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await getSupabase().from('warranty_events').insert([{
        claim_id: id,
        event_type: 'STATUS_CHANGE',
        from_status: oldStatus,
        to_status: newStatus,
        comment: comment,
        created_by_user_name: currentUser?.name || 'Unknown',
        created_at: new Date().toISOString()
      }]);

      return {
        id: updated.id,
        status: updated.status as ClaimStatus,
        updatedAt: updated.updated_at
      } as any;
    },
    getHistory: async (id: string) => {
      const { data, error } = await getSupabase()
        .from('warranty_events')
        .select('*')
        .eq('claim_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((e: any) => ({
        id: e.id,
        claimId: e.claim_id,
        eventType: e.event_type,
        fromStatus: e.from_status as ClaimStatus,
        toStatus: e.to_status as ClaimStatus,
        comment: e.comment,
        createdAt: e.created_at,
        createdByUserName: e.created_by_user_name
      } as WarrantyEvent));
    }
  },
  stores: {
    list: async () => {
      const { data, error } = await getSupabase().from('stores').select('*');
      if (error) throw error;

      return data.map((s: any) => ({
        id: s.id,
        tradeName: s.trade_name,
        legalName: s.legal_name,
        cnpj: s.cnpj,
        city: s.city,
        state: s.state,
        contactName: s.contact_name,
        contactEmail: s.contact_email,
        active: s.active,
        claimsCount: s.claims_count
      } as Store));
    },
    getById: async (id: string) => {
      const { data: s, error } = await getSupabase().from('stores').select('*').eq('id', id).single();
      if (error) return null;

      return {
        id: s.id,
        tradeName: s.trade_name,
        legalName: s.legal_name,
        cnpj: s.cnpj,
        city: s.city,
        state: s.state,
        contactName: s.contact_name,
        contactEmail: s.contact_email,
        active: s.active,
        claimsCount: s.claims_count
      } as Store;
    },
    update: async (id: string, data: Partial<Store>) => {
      if (USE_MOCK) {
        const index = mockStores.findIndex(s => s.id === id);
        if (index >= 0) {
          mockStores[index] = { ...mockStores[index], ...data };
          return mockStores[index];
        }
        throw new Error('Store not found');
      }

      const { data: updated, error } = await getSupabase()
        .from('stores')
        .update({
          trade_name: data.tradeName,
          legal_name: data.legalName,
          city: data.city,
          state: data.state,
          contact_name: data.contactName,
          contact_email: data.contactEmail,
          active: data.active
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    }
  },
  users: {
    list: async () => {
      const { data, error } = await getSupabase().from('users').select('*');
      if (error) throw error;
      return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as Role,
        storeId: u.store_id,
        active: u.active
      } as User));
    },
    create: async (user: Omit<User, 'id'>) => {
      if (USE_MOCK) {
        const newUser = { ...user, id: String(mockUsers.length + 1) };
        mockUsers.push(newUser);
        return newUser;
      }

      const { data, error } = await getSupabase().functions.invoke('admin-user-actions', {
        body: {
          action: 'create',
          userData: {
            email: user.email,
            password: 'password123', // Default password, user should change it
            name: user.name,
            role: user.role,
            storeId: user.storeId,
            active: user.active
          }
        }
      });

      if (error) throw error;
      return data.user;
    },
    update: async (id: string, user: Partial<User>) => {
      if (USE_MOCK) {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index >= 0) {
          mockUsers[index] = { ...mockUsers[index], ...user };
          return mockUsers[index];
        }
        throw new Error('User not found');
      }

      const { data, error } = await getSupabase().functions.invoke('admin-user-actions', {
        body: {
          action: 'update',
          userId: id,
          userData: {
            name: user.name,
            email: user.email,
            role: user.role,
            storeId: user.storeId,
            active: user.active
          }
        }
      });

      if (error) throw error;
      return data;
    },
    toggleStatus: async (id: string) => {
      const { data: current } = await getSupabase().from('users').select('active').eq('id', id).single();

      const { data, error } = await getSupabase()
        .from('users')
        .update({ active: !current?.active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as Role,
        storeId: data.store_id,
        active: data.active
      } as User;
    }
  }
};

// --- EXPORT ---
// In a real build, use: import.meta.env.VITE_USE_MOCK === 'true'
export const api = USE_MOCK ? MockApi : RemoteApi;