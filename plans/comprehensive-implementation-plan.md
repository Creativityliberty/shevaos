# SHEVA OS - Comprehensive Implementation Plan

## Current Project Status Assessment ✅

### Completed (Bloc 2 - CRM + Commandes)
- ✅ **RPC**: `create_order_with_stock_check` with atomic stock validation
- ✅ **Frontend**: Complete CreateOrderForm with real-time COD calculation
- ✅ **Server Action**: `create-order` functional with proper error handling
- ✅ **Orders List**: Basic listing page with status badges and customer info
- ✅ **Numbering**: Automatic "SHEVA-CMD-YYYY-XXXXX" format implemented

### In Progress (Bloc 3 - Dispatch & Livraisons)
- ✅ **Database**: `deliveries` and `cash_collections` tables created
- ✅ **Security**: RLS policies for drivers and dispatchers implemented
- ✅ **Triggers**: Status synchronization between orders and deliveries

## PRIORITY 1 - FINALIZE ORDER MANAGEMENT (BLOC 2)

### 1.1 Tenant Settings Configuration
**Migration SQL**: `0004_tenant_settings.sql`
```sql
CREATE TABLE public.tenant_settings (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id),
    cash_discrepancy_threshold NUMERIC(15,2) DEFAULT 500,
    stock_alert_threshold INTEGER DEFAULT 10,
    cash_deposit_warning_hours INTEGER DEFAULT 24,
    cash_deposit_critical_hours INTEGER DEFAULT 48,
    max_cash_per_driver NUMERIC(15,2) DEFAULT 200000,
    max_orders_per_driver INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
CREATE POLICY tenant_isolation_settings ON public.tenant_settings
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));
```

### 1.2 State Transition Constraints
**Migration SQL**: `0005_order_transition_constraints.sql`
```sql
CREATE OR REPLACE FUNCTION validate_order_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Transitions from state_machines.md
  IF OLD.status = 'CONFIRMÉE' AND NEW.status = 'LIVRÉE' THEN
    RAISE EXCEPTION 'Transition interdite: CONFIRMÉE → LIVRÉE';
  END IF;
  
  IF OLD.status = 'ANNULÉE' AND NEW.status <> 'ANNULÉE' THEN
    RAISE EXCEPTION 'ANNULÉE est un état terminal';
  END IF;
  
  -- Add all transition rules from state-machines.md
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_transition
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION validate_order_transition();
```

### 1.3 Order Detail Page with Timeline
**File**: `src/app/(dashboard)/orders/[id]/page.tsx`
```tsx
// Server Component fetching order details, events, and timeline
// Includes: Order info, customer details, items list, payment status
// Interactive timeline showing all status changes and events
// Action buttons based on current status and user role
```

### 1.4 Cancellation System
**RPC**: `cancel_order_with_reason`
```sql
CREATE OR REPLACE FUNCTION public.cancel_order_with_reason(
    p_order_id UUID,
    p_reason TEXT CHECK (p_reason IN (
        'Doublon', 'Client injoignable', 'Client a annulé', 
        'Produit indisponible', 'Adresse incorrecte', 'Hors zone', 'Autre'
    )),
    p_operator_id UUID
)
RETURNS UUID AS $$
-- Implementation with stock release and audit logging
$$ LANGUAGE plpgsql;
```

## PRIORITY 2 - RESOLVE DEPLOYMENT CONFIGURATION

### 2.1 Clean Supabase Config
**File**: `supabase/config.toml`
```toml
# Remove experimental sections:
# - [auth.rate_limit]
# - [auth.web3]
# - [auth.oauth_server] 
# - [storage.s3]
# - [storage.analytics]
# - [storage.vector]
# - [edge_runtime] advanced options

# Keep only stable, production-ready configurations
```

### 2.2 Migration Deployment Test
```bash
# Test deployment process
supabase db reset
supabase db push
supabase gen types typescript --local
npm run build
```

## PRIORITY 3 - ADVANCE DISPATCH SYSTEM (BLOC 3)

### 3.1 Dispatch RPC Endpoints
**Migration SQL**: `0006_dispatch_rpc.sql`
```sql
-- Assign delivery to driver
CREATE OR REPLACE FUNCTION assign_delivery_to_driver(
    p_order_id UUID,
    p_driver_id UUID,
    p_dispatcher_id UUID
)

-- Confirm delivery with cash collection
CREATE OR REPLACE FUNCTION confirm_delivery_with_cash(
    p_delivery_id UUID,
    p_collected_amount NUMERIC(15,2),
    p_driver_id UUID
)

-- Report delivery failure
CREATE OR REPLACE FUNCTION report_delivery_failure(
    p_delivery_id UUID,
    p_reason TEXT,
    p_driver_id UUID
)
```

### 3.2 Mobile Driver Interface
**Files**:
- `src/app/driver/deliveries/page.tsx` - Delivery list for drivers
- `src/app/driver/deliveries/[id]/page.tsx` - Delivery details with actions
- `src/app/driver/deposit/page.tsx` - Cash deposit interface

### 3.3 Dispatcher Dashboard
**File**: `src/app/(dashboard)/dispatch/page.tsx`
- Real-time order assignment interface
- Driver availability and workload monitoring
- Route optimization suggestions
- Live tracking integration (phase 2)

## ARCHITECTURE STANDARDS

### Database Layer
- **RLS Policies**: All tables with tenant isolation
- **Atomic RPC**: All critical operations as PostgreSQL functions
- **Immutability**: Ledger append-only, no updates/deletes
- **Audit Trails**: Comprehensive event logging

### Frontend Layer
- **Next.js 14**: App Router with Server Components
- **TypeScript**: Strict typing with generated Supabase types
- **Shadcn UI**: Consistent design system
- **React Hook Form + Zod**: Client/server validation

### Security Model
- **Role-Based Access**: RBAC matrix enforcement
- **Tenant Isolation**: Data separation at database level
- **Input Validation**: Both client and server side
- **Audit Logging**: All critical actions tracked

## TESTING STRATEGY

### Unit Tests
- RPC function validation
- Business rule enforcement (R-CMD-001 to R-CMD-004)
- State transition validation

### Integration Tests
- End-to-end order creation flow
- Stock reservation and release
- Cash reconciliation scenarios

### User Acceptance Testing
- SAV agent workflow validation
- Driver mobile interface testing
- Dispatcher assignment scenarios

## DEPLOYMENT CHECKLIST

- [ ] All migrations tested locally
- [ ] RLS policies verified
- [ ] TypeScript types regenerated
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Monitoring and alerting setup

## NEXT STEPS

1. **Immediate**: Create tenant_settings migration and test deployment
2. **Short-term**: Implement order transition constraints and detail page
3. **Medium-term**: Develop mobile driver interface and dispatcher dashboard
4. **Long-term**: Implement financial reconciliation and CEO dashboard

This plan ensures the SHEVA OS ERP system meets all COD operational requirements with robust architecture and comprehensive feature coverage.